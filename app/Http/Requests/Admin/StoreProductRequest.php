<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Product::class);
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'collection_id' => ['nullable', 'integer', 'exists:collections,id'],
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:170', 'alpha_dash', Rule::unique('products', 'slug')],
            'reference' => ['nullable', 'string', 'max:50', Rule::unique('products', 'reference')],
            'description' => ['nullable', 'string', 'max:10000'],

            'price' => ['nullable', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            // inherit = suit le réglage global, show / hide = surcharge pour ce produit
            'price_visibility' => ['required', Rule::in(['inherit', 'show', 'hide'])],

            'is_published' => ['boolean'],
            'is_featured' => ['boolean'],

            'variants' => ['required', 'array', 'min:1'],
            'variants.*.size' => ['nullable', 'string', 'max:20'],
            'variants.*.color' => ['nullable', 'string', 'max:50'],
            'variants.*.color_hex' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'variants.*.stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'variants.*.sku' => ['nullable', 'string', 'max:60', 'distinct', Rule::unique('product_variants', 'sku')],

            'images' => ['required', 'array', 'min:1', 'max:12'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $variants = $this->input('variants');
                if (! is_array($variants)) {
                    return;
                }

                $combos = collect($variants)
                    ->filter(fn ($v) => is_array($v))
                    ->map(fn ($v) => mb_strtolower(trim(($v['size'] ?? '').'|'.($v['color'] ?? ''))));

                if ($combos->duplicates()->isNotEmpty()) {
                    $validator->errors()->add('variants', 'Chaque combinaison taille / couleur doit être unique.');
                }
            },
        ];
    }

    public function attributes(): array
    {
        return [
            'category_id' => 'catégorie',
            'collection_id' => 'collection',
            'name' => 'nom',
            'slug' => 'adresse de la fiche',
            'reference' => 'référence',
            'description' => 'description',
            'price' => 'prix',
            'price_visibility' => 'affichage du prix',
            'is_published' => 'visible sur le site',
            'is_featured' => 'mise en avant',
            'variants' => 'variantes',
            'variants.*.size' => 'taille',
            'variants.*.color' => 'couleur',
            'variants.*.color_hex' => 'pastille de couleur',
            'variants.*.stock' => 'stock',
            'variants.*.sku' => 'SKU',
            'images' => 'photos',
            'images.*' => 'photo',
        ];
    }

    public function messages(): array
    {
        return self::photoMessages();
    }

    /** Messages des photos, partagés avec l'ajout de photos en édition (ProductImageController). */
    public static function photoMessages(): array
    {
        return [
            'images.required' => 'Ajoutez au moins une photo.',
            'images.max' => 'Envoyez :max photos au maximum à la fois.',
            'images.*.image' => 'Ce fichier n\'est pas une image.',
            'images.*.mimes' => 'Format de photo non accepté : utilisez JPG, PNG ou WebP.',
            'images.*.max' => 'Chaque photo doit peser 2 Mo maximum.',
            'variants.*.color_hex.regex' => 'La pastille de couleur doit être un code du type #1A1A1A.',
            'variants.*.sku.unique' => 'Ce SKU est déjà utilisé par un autre article.',
            'variants.*.sku.distinct' => 'Deux lignes ont le même SKU.',
        ];
    }

    /** Colonnes de `products` prêtes pour create()/update(). */
    public function productAttributes(): array
    {
        $data = Arr::except($this->validated(), ['variants', 'images', 'price_visibility']);

        $data['show_price'] = match ($this->validated('price_visibility')) {
            'show' => true,
            'hide' => false,
            default => null,
        };

        return $data;
    }
}
