<?php

namespace App\Http\Requests\Admin;

use App\Models\Video;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class VideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'youtube_url' => ['required', 'string', 'max:255', function (string $attribute, mixed $value, Closure $fail) {
                if (! Video::parseYoutube($value)) {
                    $fail('Lien YouTube non reconnu. Collez l\'adresse de la vidéo : youtube.com/watch?v=…, youtu.be/… ou youtube.com/shorts/…');
                }
            }],
            'title' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:170', 'alpha_dash', Rule::unique('videos', 'slug')->ignore($this->route('video'))],
            'description' => ['nullable', 'string', 'max:5000'],
            'is_vertical' => ['boolean'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'collection_id' => ['nullable', 'integer', 'exists:collections,id'],
            'product_ids' => ['nullable', 'array', 'max:12'],
            'product_ids.*' => ['integer', 'distinct', 'exists:products,id'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'position' => ['nullable', 'integer', 'min:0', 'max:65535'],
        ];
    }

    public function attributes(): array
    {
        return [
            'youtube_url' => 'lien YouTube',
            'title' => 'titre',
            'slug' => 'adresse de la page',
            'description' => 'description',
            'is_vertical' => 'format vertical',
            'category_id' => 'catégorie',
            'collection_id' => 'collection',
            'product_ids' => 'articles présentés',
            'product_ids.*' => 'article',
            'is_published' => 'visible sur le site',
            'published_at' => 'date de publication',
            'position' => 'ordre',
        ];
    }

    public function messages(): array
    {
        return [
            'product_ids.max' => 'Associez :max articles au maximum à une vidéo.',
        ];
    }

    /** Colonnes de `videos` prêtes pour create()/update(). */
    public function videoAttributes(): array
    {
        $youtube = Video::parseYoutube($this->validated('youtube_url'));

        return [
            ...Arr::except($this->validated(), ['youtube_url', 'product_ids']),
            'youtube_id' => $youtube['id'],
            'position' => $this->validated('position') ?? 0,
        ];
    }

    /** [product_id => ['position' => n]] dans l'ordre choisi, pour sync(). */
    public function productSync(): array
    {
        return collect($this->validated('product_ids') ?? [])
            ->values()
            ->mapWithKeys(fn ($id, $position) => [(int) $id => ['position' => $position]])
            ->all();
    }
}
