<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/** Liste + création/édition dans une modale sur la même page. */
class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => CategoryResource::collection(
                Category::roots()
                    ->withCount('products')
                    ->with(['children' => fn ($q) => $q->withCount('products')])
                    ->orderBy('position')
                    ->get()
            ),
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        return back()->with('success', 'Catégorie créée.');
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return back()->with('success', 'Catégorie mise à jour.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        // La clé étrangère (restrictOnDelete) bloquerait de toute façon : on renvoie un message clair.
        if ($category->products()->exists()) {
            return back()->with('error', 'Impossible de supprimer une catégorie qui contient des produits.');
        }

        $category->delete(); // les sous-catégories deviennent des catégories racines (nullOnDelete)

        return back()->with('success', 'Catégorie supprimée.');
    }
}
