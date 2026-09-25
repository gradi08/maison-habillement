<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CollectionRequest;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    private const DISK = 'public';

    public function index(): Response
    {
        return Inertia::render('Admin/Collections/Index', [
            'collections' => CollectionResource::collection(
                Collection::withCount('products')->orderBy('position')->get()
            ),
        ]);
    }

    public function store(CollectionRequest $request): RedirectResponse
    {
        $data = Arr::except($request->validated(), ['cover', 'remove_cover']);

        if ($request->hasFile('cover')) {
            $data['cover_image'] = $request->file('cover')->store('collections', self::DISK);
        }

        Collection::create($data);

        return back()->with('success', 'Collection créée.');
    }

    /**
     * Avec un fichier, le front doit envoyer un POST + `_method=put`
     * (PHP ne lit pas les corps multipart des requêtes PUT).
     */
    public function update(CollectionRequest $request, Collection $collection): RedirectResponse
    {
        $data = Arr::except($request->validated(), ['cover', 'remove_cover']);
        $oldCover = $collection->cover_image;

        if ($request->hasFile('cover')) {
            $data['cover_image'] = $request->file('cover')->store('collections', self::DISK);
        } elseif ($request->boolean('remove_cover')) {
            $data['cover_image'] = null;
        }

        $collection->update($data);

        if ($oldCover && $oldCover !== $collection->cover_image) {
            Storage::disk(self::DISK)->delete($oldCover);
        }

        return back()->with('success', 'Collection mise à jour.');
    }

    public function destroy(Collection $collection): RedirectResponse
    {
        $collection->delete(); // les produits sont conservés, collection_id → NULL

        if ($collection->cover_image) {
            Storage::disk(self::DISK)->delete($collection->cover_image);
        }

        return back()->with('success', 'Collection supprimée.');
    }
}
