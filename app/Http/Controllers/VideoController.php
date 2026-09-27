<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\CollectionResource;
use App\Http\Resources\VideoResource;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VideoController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'category' => ['nullable', 'string', 'max:120'],
            'collection' => ['nullable', 'string', 'max:140'],
        ]);

        $videos = Video::published()
            ->filter($filters)
            ->with(['category', 'collection'])
            ->withCount(['products' => fn ($q) => $q->published()])
            ->ordered()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Videos/Index', [
            'videos' => VideoResource::collection($videos),
            'filters' => $filters,
            'options' => fn () => $this->filterOptions(),
        ]);
    }

    public function show(Video $video): Response
    {
        abort_unless(Video::published()->whereKey($video->id)->exists(), 404);

        $video->load([
            'category',
            'collection',
            // Seuls les articles en ligne sont proposés sous la vidéo.
            'products' => fn ($q) => $q->published()->with(['coverImage', 'category'])->withSum('variants', 'stock'),
        ]);

        $more = Video::published()
            ->whereKeyNot($video->id)
            ->when($video->category_id || $video->collection_id, fn ($q) => $q->where(fn ($w) => $w
                ->when($video->category_id, fn ($w) => $w->orWhere('category_id', $video->category_id))
                ->when($video->collection_id, fn ($w) => $w->orWhere('collection_id', $video->collection_id))))
            ->with(['category', 'collection'])
            ->ordered()
            ->take(4)
            ->get();

        return Inertia::render('Videos/Show', [
            'video' => new VideoResource($video),
            'more' => VideoResource::collection($more),
        ]);
    }

    /** Uniquement les catégories et collections qui ont au moins une vidéo en ligne (pas de filtre vide). */
    private function filterOptions(): array
    {
        $withVideos = fn ($q) => $q->published();

        return [
            'categories' => CategoryResource::collection(
                Category::active()
                    ->where(fn ($q) => $q
                        ->whereHas('videos', $withVideos)
                        ->orWhereHas('children.videos', $withVideos))
                    ->roots()
                    ->orderBy('position')
                    ->get()
            ),
            'collections' => CollectionResource::collection(
                Collection::active()->whereHas('videos', $withVideos)->orderBy('position')->get()
            ),
        ];
    }
}
