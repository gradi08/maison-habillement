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

    public function attributes(): array
    {
        return [
            'name' => 'nom',
            'slug' => 'slug',
            'parent_id' => 'catégorie parente',
            'description' => 'description',
            'position' => 'ordre',
            'is_active' => 'visible sur le site',
        ];
    }

    public function messages(): array
    {
        return [
            'parent_id.exists' => 'La catégorie parente doit être une catégorie principale (2 niveaux maximum).',
            'parent_id.not_in' => 'Une catégorie ne peut pas être sa propre catégorie parente.',
        ];
    }
}
