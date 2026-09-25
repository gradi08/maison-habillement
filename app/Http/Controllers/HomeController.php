<?php

namespace App\Http\Controllers;

use App\Http\Resources\CollectionResource;
use App\Http\Resources\ProductResource;
use App\Models\Collection;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $listing = fn () => Product::published()
            ->with(['coverImage', 'category'])
            ->withSum('variants', 'stock');

        return Inertia::render('Home', [
            'featuredCollections' => CollectionResource::collection(
                Collection::active()->featured()->orderBy('position')->take(3)->get()
            ),
            'featuredProducts' => ProductResource::collection(
                $listing()->featured()->latest()->take(4)->get()
            ),
            'newArrivals' => ProductResource::collection(
                $listing()->latest()->take(8)->get()
            ),
        ]);
    }
}
