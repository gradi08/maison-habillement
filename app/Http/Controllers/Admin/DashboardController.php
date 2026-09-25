<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::count(),
                'published' => Product::published()->count(),
                'out_of_stock' => Product::outOfStock()->count(),
                'low_stock_variants' => ProductVariant::whereBetween('stock', [1, 2])->count(),
            ],
            'outOfStock' => ProductResource::collection(
                Product::outOfStock()
                    ->with('coverImage')
                    ->withSum('variants', 'stock')
                    ->latest('updated_at')
                    ->take(10)
                    ->get()
            ),
        ]);
    }
}
