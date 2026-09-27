<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

/**
 * Vidéo de présentation. Deux sources possibles :
 *  - `youtube` : seul l'identifiant YouTube (11 caractères) est stocké ;
 *  - `file`    : fichier envoyé sur le site (disque `public`, dossier videos/{id}/), avec son image d'aperçu.
 */
class Video extends Model
{
    use HasFactory, HasSlug;

    public const SOURCE_YOUTUBE = 'youtube';

    public const SOURCE_FILE = 'file';

    public const DISK = 'public';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'source',
        'youtube_id',
        'file_path',
        'file_mime',
        'file_size',
        'poster_path',
        'duration',
        'is_vertical',
        'category_id',
        'collection_id',
        'is_published',
        'published_at',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'is_vertical' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'position' => 'integer',
            'file_size' => 'integer',
            'duration' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        // Les fichiers (vidéo + aperçu) sont supprimés avec la vidéo.
        static::deleted(fn (Video $video) => Storage::disk(self::DISK)->deleteDirectory($video->storageDirectory()));
    }

    public function isFile(): bool
    {
        return $this->source === self::SOURCE_FILE;
    }

    /** Dossier des fichiers de cette vidéo sur le disque public. */
    public function storageDirectory(): string
    {
        return "videos/{$this->id}";
    }

    public function slugSource(): string
    {
        return 'title';
    }

    /* ---------------------------------------------------------------- Relations */

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)->withPivot('position')->orderByPivot('position');
    }

    /* ------------------------------------------------------------------- Scopes */

    /** Publiée et dont la date de publication (si programmée) est passée. */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
    }

    /** Ordre d'affichage : position choisie par l'admin, puis les plus récentes d'abord. */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('position')->orderByDesc('published_at')->orderByDesc('id');
    }

    /** @param  array{category?: string, collection?: string}  $filters */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            // Comme pour les articles : une catégorie principale inclut ses sous-catégories.
            ->when($filters['category'] ?? null, fn ($q, $slug) => $q->whereHas('category', fn ($c) => $c
                ->where(fn ($w) => $w
                    ->where('slug', $slug)
                    ->orWhereHas('parent', fn ($p) => $p->where('slug', $slug)))))
            ->when($filters['collection'] ?? null, fn ($q, $slug) => $q->whereHas('collection', fn ($c) => $c
                ->where('slug', $slug)));
    }

    /* ------------------------------------------------------- Adresses (URL) */

    /** Image d'aperçu : celle envoyée pour un fichier, la miniature YouTube sinon. */
    protected function thumbnailUrl(): Attribute
    {
        return Attribute::get(function () {
            if ($this->isFile()) {
                return $this->poster_path ? Storage::disk(self::DISK)->url($this->poster_path) : null;
            }

            // hqdefault existe pour toutes les vidéos YouTube (maxresdefault n'est pas garanti).
            return $this->youtube_id ? "https://i.ytimg.com/vi/{$this->youtube_id}/hqdefault.jpg" : null;
        });
    }

    /** Fichier vidéo lisible directement par le navigateur (source `file`). */
    protected function fileUrl(): Attribute
    {
        return Attribute::get(fn () => $this->isFile() && $this->file_path
            ? Storage::disk(self::DISK)->url($this->file_path)
            : null);
    }

    protected function embedUrl(): Attribute
    {
        // youtube-nocookie : pas de cookie publicitaire tant que la vidéo n'est pas lue.
        return Attribute::get(fn () => ! $this->isFile() && $this->youtube_id
            ? "https://www.youtube-nocookie.com/embed/{$this->youtube_id}?autoplay=1&rel=0&playsinline=1&modestbranding=1"
            : null);
    }

    protected function youtubeUrl(): Attribute
    {
        return Attribute::get(fn () => match (true) {
            $this->isFile() || ! $this->youtube_id => null,
            $this->is_vertical => "https://www.youtube.com/shorts/{$this->youtube_id}",
            default => "https://www.youtube.com/watch?v={$this->youtube_id}",
        });
    }

    /**
     * Reconnaît toutes les formes de lien YouTube collées par l'admin :
     * youtube.com/watch?v=…, youtu.be/…, youtube.com/shorts/…, /embed/…, /live/…, m.youtube.com, ou l'identifiant seul.
     *
     * @return array{id: string, vertical: bool}|null
     */
    public static function parseYoutube(?string $input): ?array
    {
        $input = trim((string) $input);
        $isId = fn (?string $id) => is_string($id) && preg_match('/^[A-Za-z0-9_-]{11}$/', $id) === 1;

        if ($isId($input)) {
            return ['id' => $input, 'vertical' => false];
        }

        $parts = parse_url(str_contains($input, '://') ? $input : "https://{$input}");
        if (! $parts || empty($parts['host'])) {
            return null;
        }

        $host = strtolower((string) preg_replace('/^(www\.|m\.|music\.)/', '', $parts['host']));
        $path = $parts['path'] ?? '';
        $id = null;
        $vertical = false;

        if ($host === 'youtu.be') {
            $id = explode('/', trim($path, '/'))[0] ?? null;
        } elseif (in_array($host, ['youtube.com', 'youtube-nocookie.com'], true)) {
            if (preg_match('#^/(shorts|embed|live|v)/([A-Za-z0-9_-]{11})#', $path, $m)) {
                $id = $m[2];
                $vertical = $m[1] === 'shorts';
            } else {
                parse_str($parts['query'] ?? '', $query);
                $id = is_string($query['v'] ?? null) ? $query['v'] : null;
            }
        }

        return $isId($id) ? ['id' => $id, 'vertical' => $vertical] : null;
    }
}
