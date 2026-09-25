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
}
