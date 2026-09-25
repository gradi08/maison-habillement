<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\CollectionResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:120'],
            'collection' => ['nullable', 'string', 'max:140'],
            'size' => ['nullable', 'string', 'max:20'],
            'color' => ['nullable', 'string', 'max:50'],
            'in_stock' => ['nullable', 'boolean'],
            // Volontairement pas de tri par prix : il révélerait l'ordre des prix masqués.
            'sort' => ['nullable', 'in:newest,name'],
        ]);

        $products = Product::published()
            ->filter($filters)
            ->with(['coverImage', 'category'])
            ->withSum('variants', 'stock')
            ->when(($filters['sort'] ?? 'newest') === 'name',
                fn ($q) => $q->orderBy('name'),
                fn ($q) => $q->latest())
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Catalogue', [
            'products' => ProductResource::collection($products),
            'filters' => $filters,
            'options' => fn () => $this->filterOptions(),
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_published, 404);

        $product->load(['images', 'variants', 'category', 'collection']);

        $related = Product::published()
            ->whereKeyNot($product->id)
            ->where('category_id', $product->category_id)
            ->with(['coverImage', 'category'])
            ->withSum('variants', 'stock')
            ->inRandomOrder()
            ->take(4)
            ->get();

        return Inertia::render('ProductPage', [
            'product' => new ProductResource($product),
            'related' => ProductResource::collection($related),
        ]);
    }

    /** Valeurs proposées dans les filtres, limitées à ce qui existe réellement dans le catalogue publié. */
    private function filterOptions(): array
    {
        $publishedVariants = fn () => ProductVariant::query()
            ->whereHas('product', fn ($q) => $q->published());

        return [
            'categories' => CategoryResource::collection(
                Category::active()->roots()
                    ->with(['children' => fn ($q) => $q->active()])
                    ->orderBy('position')
                    ->get()
            ),
            'collections' => CollectionResource::collection(
                Collection::active()->orderBy('position')->get()
            ),
            'sizes' => ProductVariant::sortSizes(
                $publishedVariants()->whereNotNull('size')->distinct()->pluck('size')
            ),
            'colors' => $publishedVariants()
                ->whereNotNull('color')
                ->select('color', DB::raw('MAX(color_hex) as hex'))
                ->groupBy('color')
                ->orderBy('color')
                ->get()
                ->map(fn ($row) => ['name' => $row->color, 'hex' => $row->hex]),
        ];
    }
}
