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

    protected function prepareForValidation(): void
    {
        // Sans source précisée : lien YouTube (comportement d'origine).
        if (blank($this->input('source'))) {
            $this->merge(['source' => Video::SOURCE_YOUTUBE]);
        }
    }

    public function rules(): array
    {
        /** @var Video|null $video */
        $video = $this->route('video');
        $isFile = $this->input('source') === Video::SOURCE_FILE;
        // Un fichier est obligatoire à la création, ou si la vidéo n'en avait pas encore (passage YouTube → fichier).
        $needsUpload = $isFile && ! ($video?->isFile() && $video->file_path);

        return [
            'source' => ['required', Rule::in([Video::SOURCE_YOUTUBE, Video::SOURCE_FILE])],
            'youtube_url' => $isFile ? ['nullable'] : ['required', 'string', 'max:255', function (string $attribute, mixed $value, Closure $fail) {
                if (! Video::parseYoutube($value)) {
                    $fail('Lien YouTube non reconnu. Collez l\'adresse de la vidéo : youtube.com/watch?v=…, youtu.be/… ou youtube.com/shorts/…');
                }
            }],
            'upload_id' => $needsUpload ? ['required', 'uuid'] : ['nullable', 'uuid'],
            'poster' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'duration' => ['nullable', 'integer', 'min:0', 'max:86400'],
            'title' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:170', 'alpha_dash', Rule::unique('videos', 'slug')->ignore($video)],
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
            'source' => 'source de la vidéo',
            'youtube_url' => 'lien YouTube',
            'upload_id' => 'fichier vidéo',
            'poster' => 'image d\'aperçu',
            'duration' => 'durée',
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
            'upload_id.required' => 'Choisissez le fichier vidéo et attendez la fin de l\'envoi.',
            'poster.max' => 'L\'image d\'aperçu doit peser 2 Mo maximum.',
            'poster.mimes' => 'Image d\'aperçu : utilisez JPG, PNG ou WebP.',
            'product_ids.max' => 'Associez :max articles au maximum à une vidéo.',
        ];
    }

    /** Colonnes de `videos` prêtes pour create()/update() (hors fichiers, gérés par le contrôleur). */
    public function videoAttributes(): array
    {
        $data = [
            ...Arr::except($this->validated(), ['youtube_url', 'upload_id', 'poster', 'product_ids']),
            'position' => $this->validated('position') ?? 0,
        ];

        if ($this->validated('source') === Video::SOURCE_YOUTUBE) {
            $data['youtube_id'] = Video::parseYoutube($this->validated('youtube_url'))['id'];
        }

        return $data;
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
