<?php

namespace App\Http\Controllers\Admin;

use App\Actions\StoreProductImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Product::class);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer'],
            'stock' => ['nullable', 'in:out'],
        ]);

        $products = Product::query()
            ->with(['coverImage', 'category:id,name', 'collection:id,name'])
            ->withSum('variants', 'stock')
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('reference', 'like', "%{$search}%")))
            ->when($filters['category_id'] ?? null, fn ($q, $id) => $q->where('category_id', $id))
            ->when(($filters['stock'] ?? null) === 'out', fn ($q) => $q->outOfStock())
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products' => ProductResource::collection($products),
            'filters' => $filters,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'globalShowPrices' => Setting::bool('show_prices_globally'),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Product::class);

        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            ...$this->formOptions(),
        ]);
    }

    public function store(StoreProductRequest $request, StoreProductImages $storeImages): RedirectResponse
    {
        $product = DB::transaction(function () use ($request, $storeImages) {
            $product = Product::create($request->productAttributes());
            $this->syncVariants($product, $request->validated('variants'));
            // En dernier : si l'enregistrement des fichiers échoue, la transaction annule le reste.
            $storeImages->handle($product, $request->file('images', []));

            return $product;
        });

        return redirect()
            ->route('admin.products.edit', $product)
            ->with('success', 'Produit créé.');
    }

    public function edit(Product $product): Response
    {
        Gate::authorize('update', $product);

        $product->load(['images', 'variants']);

        return Inertia::render('Admin/Products/Form', [
            'product' => new ProductResource($product),
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product) {
            $product->update($request->productAttributes());
            $this->syncVariants($product, $request->validated('variants'));
        });

        return back()->with('success', 'Produit mis à jour.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        Gate::authorize('delete', $product);

        // Déclenche Product::deleting → suppression des images et de leurs fichiers.
        DB::transaction(fn () => $product->delete());

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Produit supprimé.');
    }

    /** Bascule rapide depuis la liste (composant <Switch>). */
    public function updatePriceVisibility(Request $request, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);

        $data = $request->validate([
            'price_visibility' => ['required', Rule::in(['inherit', 'show', 'hide'])],
        ]);

        $product->update([
            'show_price' => match ($data['price_visibility']) {
                'show' => true,
                'hide' => false,
                default => null,
            },
        ]);

        return back();
    }

    /**
     * Crée / met à jour les variantes envoyées (identifiées par leur couple taille + couleur)
     * et supprime celles qui ont disparu du formulaire.
     *
     * @param  array<int, array{size?: ?string, color?: ?string, color_hex?: ?string, stock: int, sku?: ?string}>  $variants
     */
    private function syncVariants(Product $product, array $variants): void
    {
        $keptIds = [];

        foreach ($variants as $data) {
            $variant = $product->variants()->updateOrCreate(
                ['size' => $data['size'] ?? null, 'color' => $data['color'] ?? null],
                [
                    'color_hex' => $data['color_hex'] ?? null,
                    'stock' => $data['stock'],
                    'sku' => $data['sku'] ?? null,
                ],
            );

            $keptIds[] = $variant->id;
        }

        $product->variants()->whereKeyNot($keptIds)->delete();
    }

    private function formOptions(): array
    {
        return [
            'categories' => Category::query()
                ->with('parent:id,name')
                ->orderBy('name')
                ->get()
                ->map(fn (Category $c) => [
                    'id' => $c->id,
                    'name' => $c->parent ? "{$c->parent->name} › {$c->name}" : $c->name,
                ])
                ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
                ->values(),
            'collections' => Collection::orderBy('position')->get(['id', 'name']),
            'globalShowPrices' => Setting::bool('show_prices_globally'),
        ];
    }
}
