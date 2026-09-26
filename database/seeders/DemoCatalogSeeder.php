<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Setting;
use Composer\CaBundle\CaBundle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * Catalogue de démonstration illustré de photos libres de droits (Unsplash ; auteurs dans
 * data/demo-photos.json), téléchargées au premier seed puis gardées en cache (disque `local`, dossier demo-photos).
 * Sans connexion internet, des images unies sont générées localement à la place.
 * À ne pas lancer en production.
 */
class DemoCatalogSeeder extends Seeder
{
    private const SIZES_CLOTHES = ['XS', 'S', 'M', 'L', 'XL'];

    private const SIZES_SHOES = ['38', '39', '40', '41', '42'];

    private const COLORS = [
        'Noir' => '#1A1A1A',
        'Blanc cassé' => '#F4F1EA',
        'Beige sable' => '#D8C3A5',
        'Bleu nuit' => '#1F2A44',
        'Terracotta' => '#C0643F',
        'Vert olive' => '#6B7045',
    ];

    public function run(): void
    {
        $tree = [
            'Femme' => ['Robes', 'Hauts', 'Pantalons'],
            'Homme' => ['Chemises', 'Pantalons homme', 'Vestes'],
            'Accessoires' => ['Sacs', 'Chaussures'],
        ];

        $leaves = [];
        foreach (array_keys($tree) as $i => $rootName) {
            $root = Category::firstOrCreate(['name' => $rootName], ['position' => $i]);
            foreach ($tree[$rootName] as $j => $childName) {
                $leaves[$childName] = Category::firstOrCreate(
                    ['name' => $childName],
                    ['parent_id' => $root->id, 'position' => $j],
                );
            }
        }

        $collections = [
            Collection::firstOrCreate(['name' => 'Héritage'], [
                'season' => 'Printemps-Été 2026',
                'description' => 'Coupes amples, lin et coton, inspirées des ateliers de couture traditionnels.',
                'is_featured' => true,
                'position' => 0,
            ]),
            Collection::firstOrCreate(['name' => 'Nocturne'], [
                'season' => 'Automne-Hiver 2026',
                'description' => 'Tons profonds et matières structurées pour la saison froide.',
                'is_featured' => true,
                'position' => 1,
            ]),
        ];

        $photos = $this->photoCatalog();

        foreach ($collections as $collection) {
            if (! $collection->cover_image) {
                $photo = $photos['@collection:'.$collection->name][0] ?? null;
                $collection->update([
                    'cover_image' => ($photo ? $this->downloadPhoto($photo, 'collections', 1600, 900) : null)
                        ?? $this->placeholder('collections', $collection->name, '#2B2B2B', 1600, 900),
                ]);
            }
        }

        $catalog = [
            ['Robe longue Amani', 'Robes', 0, self::SIZES_CLOTHES, 89],
            ['Robe portefeuille Zola', 'Robes', 1, self::SIZES_CLOTHES, 75],
            ['Blouse en lin Nia', 'Hauts', 0, self::SIZES_CLOTHES, 45],
            ['Top côtelé Imani', 'Hauts', 1, self::SIZES_CLOTHES, 29],
            ['Pantalon large Safi', 'Pantalons', 0, self::SIZES_CLOTHES, 65],
            ['Chemise col mao Kofi', 'Chemises', 0, self::SIZES_CLOTHES, 55],
            ['Chemise oxford Jabari', 'Chemises', 1, self::SIZES_CLOTHES, 49],
            ['Chino ajusté Tano', 'Pantalons homme', 1, self::SIZES_CLOTHES, 59],
            ['Veste workwear Baraka', 'Vestes', 1, self::SIZES_CLOTHES, 129],
            ['Sac cabas en cuir Lulu', 'Sacs', 0, [], 110],
            ['Pochette brodée Asha', 'Sacs', null, [], 39],
            ['Mocassins Duma', 'Chaussures', 1, self::SIZES_SHOES, 95],
        ];

        foreach ($catalog as $index => [$name, $categoryName, $collectionIndex, $sizes, $price]) {
            if (Product::where('name', $name)->exists()) {
                continue;
            }

            $product = Product::create([
                'category_id' => $leaves[$categoryName]->id,
                'collection_id' => $collectionIndex !== null ? $collections[$collectionIndex]->id : null,
                'name' => $name,
                'reference' => 'FA-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'description' => "{$name} : pièce confectionnée dans notre atelier.\nMatière douce, finitions soignées.\nEntretien : lavage à 30 °C.",
                'price' => $price,
                'is_published' => true,
                'is_featured' => $index % 4 === 0,
            ]);

            $colors = array_slice(self::COLORS, $index % 3, 2, true);

            // Le 3e produit est entièrement en rupture, pour voir l'état "rupture" sur le site.
            $outOfStock = $index === 2;

            if ($sizes === []) {
                foreach ($colors as $color => $hex) {
                    $product->variants()->create(['color' => $color, 'color_hex' => $hex, 'stock' => $outOfStock ? 0 : rand(1, 8)]);
                }
            } else {
                foreach ($sizes as $size) {
                    foreach ($colors as $color => $hex) {
                        $product->variants()->create([
                            'size' => $size,
                            'color' => $color,
                            'color_hex' => $hex,
                            'stock' => $outOfStock ? 0 : rand(0, 6),
                        ]);
                    }
                }
            }

            // Vraies photos (Unsplash) si disponibles, sinon images unies générées localement.
            $paths = collect($photos[$name] ?? [])
                ->map(fn (array $photo) => $this->downloadPhoto($photo, "products/{$product->id}", 1000, 1250))
                ->filter()
                ->values();

            if ($paths->isEmpty()) {
                $paths = collect(array_values($colors))->map(
                    fn (string $hex, int $i) => $this->placeholder("products/{$product->id}", "{$name} – vue ".($i + 1), $hex, 1000, 1250)
                );
            }

            foreach ($paths as $order => $path) {
                $product->images()->create([
                    'path' => $path,
                    'alt' => "{$name} – photo ".($order + 1),
                    'order' => $order,
                ]);
            }
        }

        // Pour la démo : prix visibles et un numéro WhatsApp fictif.
        Setting::set('show_prices_globally', true);
        if (blank(Setting::get('whatsapp_number'))) {
            Setting::set('whatsapp_number', '33600000000');
        }
    }

    /** @return array<string, array<int, array{id: string, raw: string, alt: ?string, author: string, page: string}>> */
    private function photoCatalog(): array
    {
        $file = database_path('seeders/data/demo-photos.json');

        return is_file($file) ? json_decode(file_get_contents($file), true) : [];
    }

    /**
     * Télécharge une photo Unsplash (licence Unsplash : usage libre, commercial compris) recadrée
     * au bon format, avec un cache local pour ne pas la retélécharger à chaque seed.
     * Renvoie null si le téléchargement échoue (hors ligne…) : on utilisera une image générée.
     */
    private function downloadPhoto(array $photo, string $dir, int $w, int $h): ?string
    {
        $cache = "demo-photos/{$photo['id']}-{$w}x{$h}.jpg";
        $local = Storage::disk('local');

        if (! $local->exists($cache)) {
            try {
                $response = Http::timeout(20)
                    // Certificats de composer/ca-bundle : fonctionne même sur un PHP sans `curl.cainfo` (WAMP),
                    // sans désactiver la vérification HTTPS.
                    ->withOptions(class_exists(CaBundle::class) ? ['verify' => CaBundle::getSystemCaRootBundlePath()] : [])
                    ->retry(2, 500, throw: false)
                    ->get($photo['raw'], [
                    'w' => $w, 'h' => $h, 'fit' => 'crop', 'crop' => 'entropy', 'q' => 80, 'fm' => 'jpg',
                ]);
            } catch (Throwable) {
                $response = null;
            }

            if (! $response?->successful() || ! str_starts_with((string) $response->header('Content-Type'), 'image/')) {
                $this->command?->warn("Photo {$photo['id']} indisponible, image générée à la place.");

                return null;
            }

            $local->put($cache, $response->body());
        }

        $path = trim($dir, '/').'/'.Str::uuid().'.jpg';
        Storage::disk(ProductImage::DISK)->put($path, $local->get($cache));

        return $path;
    }

    /** Crée une image JPEG unie avec un libellé et renvoie son chemin sur le disque public. */
    private function placeholder(string $dir, string $label, string $hex, int $w, int $h): string
    {
        $img = imagecreatetruecolor($w, $h);
        [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');
        imagefill($img, 0, 0, imagecolorallocate($img, $r, $g, $b));

        $luma = 0.299 * $r + 0.587 * $g + 0.114 * $b;
        $ink = $luma > 140 ? imagecolorallocate($img, 30, 30, 30) : imagecolorallocate($img, 245, 245, 245);
        $text = Str::ascii($label); // les polices GD intégrées ne gèrent pas les accents
        $font = 5;
        $x = (int) max(10, ($w - imagefontwidth($font) * strlen($text)) / 2);
        imagestring($img, $font, $x, (int) ($h / 2), $text, $ink);

        ob_start();
        imagejpeg($img, null, 82);
        $binary = ob_get_clean();

        $path = trim($dir, '/').'/'.Str::uuid().'.jpg';
        Storage::disk(ProductImage::DISK)->put($path, $binary);

        return $path;
    }
}
