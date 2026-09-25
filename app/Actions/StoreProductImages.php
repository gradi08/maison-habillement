<?php

namespace App\Actions;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Enregistre des photos uploadées à la fin de la galerie d'un produit.
 * Les fichiers reçoivent un nom aléatoire (jamais le nom d'origine fourni par le navigateur).
 */
class StoreProductImages
{
    /** @param  array<int, UploadedFile>  $files */
    public function handle(Product $product, array $files): void
    {
        $next = (ProductImage::where('product_id', $product->id)->max('order') ?? -1) + 1;
        $stored = [];

        try {
            foreach ($files as $file) {
                $path = $file->store("products/{$product->id}", ProductImage::DISK);
                $stored[] = $path;

                $product->images()->create([
                    'path' => $path,
                    'alt' => $product->name,
                    'order' => $next++,
                ]);
            }
        } catch (Throwable $e) {
            // Pas de fichiers orphelins si l'enregistrement échoue en cours de route.
            Storage::disk(ProductImage::DISK)->delete($stored);

            throw $e;
        }
    }
}
