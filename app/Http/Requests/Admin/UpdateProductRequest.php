<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

/**
 * En édition, les photos sont gérées à part (upload, tri, suppression immédiats
 * via Admin\ProductImageController), le formulaire n'envoie donc que les données texte.
 */
class UpdateProductRequest extends StoreProductRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product'));
    }

    public function rules(): array
    {
        $product = $this->route('product');

        return array_merge(parent::rules(), [
            'slug' => ['nullable', 'string', 'max:170', 'alpha_dash', Rule::unique('products', 'slug')->ignore($product)],
            'reference' => ['nullable', 'string', 'max:50', Rule::unique('products', 'reference')->ignore($product)],
            // Unique parmi les variantes des AUTRES produits (les siennes sont ré-synchronisées).
            'variants.*.sku' => ['nullable', 'string', 'max:60', 'distinct',
                Rule::unique('product_variants', 'sku')->where(fn ($q) => $q->where('product_id', '!=', $product->id)),
            ],
            'images' => ['prohibited'],
            'images.*' => ['prohibited'],
        ]);
    }
}
