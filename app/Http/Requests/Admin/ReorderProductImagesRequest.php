<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReorderProductImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product'));
    }

    public function rules(): array
    {
        return [
            // Liste des IDs d'images dans le nouvel ordre d'affichage.
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct',
                Rule::exists('product_images', 'id')->where('product_id', $this->route('product')->id),
            ],
        ];
    }
}
