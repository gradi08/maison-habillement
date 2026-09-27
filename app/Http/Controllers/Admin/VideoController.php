<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\VideoRequest;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Video;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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
                    'thumbnail_url' => $v->thumbnail_url,
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
                'youtube_url' => $video->youtube_url,
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
        });

        return back()->with('success', 'Vidéo mise à jour.');
    }

    public function destroy(Video $video): RedirectResponse
    {
        $video->delete(); // la vidéo reste sur YouTube : seul son affichage sur le site est retiré

        return redirect()->route('admin.videos.index')->with('success', 'Vidéo retirée du site.');
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
