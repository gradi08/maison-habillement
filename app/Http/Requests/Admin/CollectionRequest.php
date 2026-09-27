<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CollectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140', 'alpha_dash',
                Rule::unique('collections', 'slug')->ignore($this->route('collection')),
            ],
            'season' => ['nullable', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:5000'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_cover' => ['boolean'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'position' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nom',
            'slug' => 'slug',
            'season' => 'saison',
            'description' => 'description',
            'cover' => 'image de couverture',
            'is_featured' => 'mise en avant',
            'is_active' => 'visible sur le site',
            'position' => 'ordre d\'affichage',
            'published_at' => 'date de lancement',
        ];
    }

    public function messages(): array
    {
        return [
            'cover.mimes' => 'Format d\'image non accepté : utilisez JPG, PNG ou WebP.',
            'cover.max' => 'L\'image de couverture doit peser 2 Mo maximum.',
        ];
    }
}
