<?php

namespace App\Http\Controllers\Admin;

use App\Actions\StoreProductImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderProductImagesRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

/**
 * Gestion de la galerie depuis la page d'édition, appelée en Axios (réponses JSON) :
 * chaque action renvoie la galerie complète dans son nouvel ordre.
 */
class ProductImageController extends Controller
{
    public function store(Request $request, Product $product, StoreProductImages $storeImages): JsonResponse
    {
        Gate::authorize('update', $product);

        $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:12'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $storeImages->handle($product, $request->file('images'));

        return $this->gallery($product, 201);
    }

    public function reorder(ReorderProductImagesRequest $request, Product $product): JsonResponse
    {
        DB::transaction(function () use ($request, $product) {
            foreach ($request->validated('ids') as $position => $id) {
                ProductImage::where('product_id', $product->id)
                    ->whereKey($id)
                    ->update(['order' => $position]);
            }
        });

        return $this->gallery($product);
    }

    public function destroy(Product $product, ProductImage $image): JsonResponse
    {
        Gate::authorize('update', $product);

        if (ProductImage::where('product_id', $product->id)->count() <= 1) {
            return response()->json([
                'message' => 'Un produit doit conserver au moins une photo.',
            ], 422);
        }

        $image->delete(); // supprime aussi le fichier (event ProductImage::deleted)

        return $this->gallery($product);
    }

    private function gallery(Product $product, int $status = 200): JsonResponse
    {
        return ProductImageResource::collection($product->images()->get())
            ->response()
            ->setStatusCode($status);
    }
}
