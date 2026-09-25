<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120', 'alpha_dash', Rule::unique('categories', 'slug')->ignore($category)],
            // Deux niveaux maximum : le parent doit lui-même être une catégorie racine.
            // Cela empêche aussi toute boucle (A parent de B parent de A).
            'parent_id' => ['nullable', 'integer',
                Rule::exists('categories', 'id')->whereNull('parent_id'),
                Rule::notIn(array_filter([$category?->id])),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'position' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'is_active' => ['boolean'],
        ];
    }
}
