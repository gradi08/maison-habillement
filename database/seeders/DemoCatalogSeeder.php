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
 * Catalogue de départ : 3 catégories, 2 collections, 12 articles.
 *
 * Source unique des données : database/seeders/data/catalogue.json
 * (présentation lisible générée à partir de ce fichier : docs/CATALOGUE.md).
 * Photos libres de droits (Unsplash ; auteurs dans data/demo-photos.json), téléchargées au premier
 * seed puis gardées en cache (disque `local`, dossier demo-photos). Sans internet : images unies générées.
 *
 * Peut être lancé en production (php artisan db:seed --class=DemoCatalogSeeder --force) :
 * ce qui existe déjà (même slug) n'est ni dupliqué ni modifié, et les réglages ne sont pas touchés.
 */
class DemoCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(database_path('seeders/data/catalogue.json')), true, flags: JSON_THROW_ON_ERROR);
        $photos = $this->photoCatalog();

        $categories = [];
        foreach ($data['categories'] as $c) {
            $categories[$c['slug']] = Category::firstOrCreate(
                ['slug' => $c['slug']],
                ['name' => $c['name'], 'position' => $c['position'], 'description' => $c['description'], 'is_active' => true],
            );
        }

        $collections = [];
        foreach ($data['collections'] as $c) {
            $collection = Collection::firstOrCreate(
                ['slug' => $c['slug']],
                [
                    'name' => $c['name'],
                    'season' => $c['season'],
                    'description' => $c['description'],
                    'is_featured' => $c['is_featured'],
                    'is_active' => true,
                    'position' => $c['position'],
                ],
            );

            if (! $collection->cover_image) {
                $photo = $photos['@collection:'.$collection->name][0] ?? null;
                $collection->update([
                    'cover_image' => ($photo ? $this->downloadPhoto($photo, 'collections', 1600, 900) : null)
                        ?? $this->placeholder('collections', $collection->name, '#2B2B2B', 1600, 900),
                ]);
            }

            $collections[$c['slug']] = $collection;
        }

        foreach ($data['products'] as $p) {
            if (Product::where('slug', $p['slug'])->exists()) {
                $this->command?->line("Déjà présent, ignoré : {$p['name']}");

                continue;
            }

            $product = Product::create([
                'category_id' => $categories[$p['category']]->id,
                'collection_id' => $p['collection'] ? $collections[$p['collection']]->id : null,
                'name' => $p['name'],
                'slug' => $p['slug'],
                'reference' => $p['reference'],
                'description' => $p['description'],
                'price' => $p['price'],
                'is_published' => true,
                'is_featured' => $p['is_featured'],
            ]);

            // Une variante par taille × couleur (ou par couleur pour un article sans taille).
            foreach ($p['sizes'] ?: [null] as $size) {
                foreach ($p['colors'] as $color) {
                    $product->variants()->create([
                        'size' => $size,
                        'color' => $color['name'],
                        'color_hex' => $color['hex'],
                        'stock' => $p['stock_per_variant'],
                    ]);
                }
            }

            // Vraies photos (Unsplash) si disponibles, sinon images unies générées localement.
            $paths = collect($photos[$p['name']] ?? [])
                ->map(fn (array $photo) => $this->downloadPhoto($photo, "products/{$product->id}", 1000, 1250))
                ->filter()
                ->values();

            if ($paths->isEmpty()) {
                $paths = collect($p['colors'])->map(
                    fn (array $color, int $i) => $this->placeholder("products/{$product->id}", "{$p['name']} – vue ".($i + 1), $color['hex'], 1000, 1250)
                );
            }

            foreach ($paths as $order => $path) {
                $product->images()->create([
                    'path' => $path,
                    'alt' => "{$p['name']} – photo ".($order + 1),
                    'order' => $order,
                ]);
            }

            $this->command?->info("Ajouté : {$p['name']} ({$paths->count()} photos)");
        }

        // En local uniquement : prix visibles et numéro WhatsApp fictif pour tester.
        // Jamais en ligne, pour ne pas écraser les vrais réglages de la boutique.
        if (app()->isLocal()) {
            Setting::set('show_prices_globally', true);
            if (blank(Setting::get('whatsapp_number'))) {
                Setting::set('whatsapp_number', '33600000000');
            }
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
