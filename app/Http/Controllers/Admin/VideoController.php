<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VideoRequest;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Video;
use App\Support\ChunkedUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VideoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Videos/Index', [
            'videos' => Video::query()
                ->with(['category:id,name', 'collection:id,name'])
                ->withCount('products')
                ->ordered()
                ->get()
                ->map(fn (Video $v) => [
                    'id' => $v->id,
                    'title' => $v->title,
                    'source' => $v->source,
                    'thumbnail_url' => $v->thumbnail_url,
                    'file_size' => $v->file_size,
                    'is_vertical' => $v->is_vertical,
                    'category_name' => $v->category?->name,
                    'collection_name' => $v->collection?->name,
                    'products_count' => $v->products_count,
                    'is_published' => $v->is_published,
                    'published_at' => $v->published_at?->toIso8601String(),
                    'is_scheduled' => $v->is_published && $v->published_at?->isFuture(),
                    'public_url' => route('videos.show', $v->slug),
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Videos/Form', ['video' => null, ...$this->formOptions()]);
    }

    public function store(VideoRequest $request): RedirectResponse
    {
        $video = DB::transaction(function () use ($request) {
            $video = Video::create($request->videoAttributes());
            $video->products()->sync($request->productSync());
            // Après create() : le dossier des fichiers dépend de l'id de la vidéo.
            $this->applyMedia($request, $video);

            return $video;
        });

        return redirect()->route('admin.videos.edit', $video)->with('success', 'Vidéo ajoutée.');
    }

    public function edit(Video $video): Response
    {
        $video->load('products:id');

        return Inertia::render('Admin/Videos/Form', [
            'video' => [
                'id' => $video->id,
                'title' => $video->title,
                'slug' => $video->slug,
                'description' => $video->description,
                'source' => $video->source,
                'youtube_url' => $video->youtube_url,
                'file_url' => $video->file_url,
                'file_size' => $video->file_size,
                'file_mime' => $video->file_mime,
                'duration' => $video->duration,
                'thumbnail_url' => $video->thumbnail_url,
                'is_vertical' => $video->is_vertical,
                'category_id' => $video->category_id,
                'collection_id' => $video->collection_id,
                'product_ids' => $video->products->pluck('id'),
                'is_published' => $video->is_published,
                'published_at' => $video->published_at?->format('Y-m-d\TH:i'),
                'position' => $video->position,
                'public_url' => route('videos.show', $video->slug),
            ],
            ...$this->formOptions(),
        ]);
    }

    public function update(VideoRequest $request, Video $video): RedirectResponse
    {
        DB::transaction(function () use ($request, $video) {
            $video->update($request->videoAttributes());
            $video->products()->sync($request->productSync());
            $this->applyMedia($request, $video);
        });

        return back()->with('success', 'Vidéo mise à jour.');
    }

    public function destroy(Video $video): RedirectResponse
    {
        // Fichier envoyé : supprimé du serveur (événement Video::deleted). Vidéo YouTube : elle reste sur YouTube.
        $video->delete();

        return redirect()->route('admin.videos.index')->with('success', 'Vidéo retirée du site.');
    }

    /**
     * Range le fichier vidéo assemblé et l'image d'aperçu, et supprime ceux qu'ils remplacent.
     * Pour une vidéo YouTube, supprime les fichiers éventuels d'une ancienne version « fichier ».
     */
    private function applyMedia(VideoRequest $request, Video $video): void
    {
        $disk = Storage::disk(Video::DISK);
        $replaced = [];

        if (! $video->isFile()) {
            $replaced = [$video->file_path, $video->poster_path];
            $video->update(['file_path' => null, 'file_mime' => null, 'file_size' => null, 'poster_path' => null, 'duration' => null]);
        } else {
            $changes = ['youtube_id' => null];

            if ($uploadId = $request->validated('upload_id')) {
                $file = ChunkedUpload::finalize($uploadId, $video->storageDirectory());
                $replaced[] = $video->file_path;
                $changes += ['file_path' => $file['path'], 'file_mime' => $file['mime'], 'file_size' => $file['size']];
            }

            if ($request->hasFile('poster')) {
                $replaced[] = $video->poster_path;
                $changes['poster_path'] = $request->file('poster')->store($video->storageDirectory(), Video::DISK);
            }

            $video->update($changes);
        }

        $disk->delete(array_values(array_filter($replaced)));
    }

    private function formOptions(): array
    {
        return [
            'categories' => Category::query()->with('parent:id,name')->orderBy('name')->get()
                ->map(fn (Category $c) => ['id' => $c->id, 'name' => $c->parent ? "{$c->parent->name} › {$c->name}" : $c->name])
                ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)->values(),
            'collections' => Collection::orderBy('position')->get(['id', 'name']),
            // Fuseau utilisé pour la publication programmée (APP_TIMEZONE dans le .env).
            'timezone' => config('app.timezone'),
            // Taille maximale d'un fichier vidéo (VIDEO_MAX_MB dans le .env).
            'videoMaxMb' => config('media.video_max_mb'),
            'products' => Product::query()->with('coverImage')->orderBy('name')->get()
                ->map(fn (Product $p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'reference' => $p->reference,
                    'is_published' => $p->is_published,
                    'cover_url' => $p->coverImage?->url,
                ]),
        ];
    }
}
