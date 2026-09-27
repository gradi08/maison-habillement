<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Models\User;
use App\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VideoTest extends TestCase
{
    use RefreshDatabase;

    public static function youtubeLinks(): array
    {
        return [
            'watch' => ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', false],
            'watch + paramètres' => ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s&si=abc', 'dQw4w9WgXcQ', false],
            'mobile' => ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', false],
            'lien court' => ['https://youtu.be/dQw4w9WgXcQ?si=xyz', 'dQw4w9WgXcQ', false],
            'short' => ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ', true],
            'short sans https' => ['youtube.com/shorts/dQw4w9WgXcQ?feature=share', 'dQw4w9WgXcQ', true],
            'embed' => ['https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ', false],
            'identifiant seul' => ['dQw4w9WgXcQ', 'dQw4w9WgXcQ', false],
        ];
    }

    #[DataProvider('youtubeLinks')]
    public function test_youtube_links_are_recognized(string $url, string $id, bool $vertical): void
    {
        $this->assertSame(['id' => $id, 'vertical' => $vertical], Video::parseYoutube($url));
    }

    public function test_non_youtube_links_are_rejected(): void
    {
        foreach (['', 'https://vimeo.com/123456', 'https://youtube.com/watch?v=trop-court', 'https://evil.com/watch?v=dQw4w9WgXcQ', 'bonjour'] as $url) {
            $this->assertNull(Video::parseYoutube($url), $url);
        }
    }

    public function test_only_published_videos_are_listed(): void
    {
        $online = Video::factory()->create();
        Video::factory()->create(['is_published' => false]);
        Video::factory()->create(['published_at' => now()->addDay()]); // programmée

        $this->get(route('videos.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Videos/Index')
            ->has('videos.data', 1)
            ->where('videos.data.0.id', $online->id));
    }

    public function test_draft_and_scheduled_videos_are_not_reachable(): void
    {
        $draft = Video::factory()->create(['is_published' => false]);
        $scheduled = Video::factory()->create(['published_at' => now()->addDay()]);

        $this->get(route('videos.show', $draft->slug))->assertNotFound();
        $this->get(route('videos.show', $scheduled->slug))->assertNotFound();
    }

    public function test_videos_can_be_filtered_by_category_and_collection(): void
    {
        $femme = Category::factory()->create(['name' => 'Femme']);
        $homme = Category::factory()->create(['name' => 'Homme']);
        $heritage = Collection::factory()->create(['name' => 'Héritage']);

        $a = Video::factory()->create(['category_id' => $femme->id, 'collection_id' => $heritage->id]);
        $b = Video::factory()->create(['category_id' => $homme->id]);

        $ids = fn (array $query) => collect($this->get(route('videos.index', $query))->viewData('page')['props']['videos']['data'])->pluck('id')->all();

        $this->assertSame([$a->id], $ids(['category' => 'femme']));
        $this->assertSame([$b->id], $ids(['category' => 'homme']));
        $this->assertSame([$a->id], $ids(['collection' => 'heritage']));

        // Seules les catégories/collections qui ont des vidéos sont proposées en filtre.
        Category::factory()->create(['name' => 'Accessoires']);
        $this->get(route('videos.index'))->assertInertia(fn (Assert $page) => $page
            ->has('options.categories', 2)
            ->has('options.collections', 1));
    }

    public function test_video_page_shows_description_and_only_published_products(): void
    {
        $shown = Product::factory()->complete()->create();
        $draft = Product::factory()->draft()->complete()->create();
        $video = Video::factory()->create(['description' => "Ligne 1\nLigne 2"]);
        $video->products()->sync([$shown->id => ['position' => 0], $draft->id => ['position' => 1]]);

        $this->get(route('videos.show', $video->slug))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Videos/Show')
            ->where('video.description', "Ligne 1\nLigne 2")
            ->where('video.embed_url', fn ($url) => str_starts_with($url, 'https://www.youtube-nocookie.com/embed/'.$video->youtube_id))
            ->has('video.products', 1)
            ->where('video.products.0.id', $shown->id));
    }

    public function test_product_page_lists_its_videos(): void
    {
        $product = Product::factory()->complete()->create();
        $video = Video::factory()->create();
        $video->products()->attach($product->id);
        Video::factory()->create(['is_published' => false])->products()->attach($product->id);

        $this->get(route('products.show', $product->slug))->assertInertia(fn (Assert $page) => $page
            ->has('videos', 1)
            ->where('videos.0.id', $video->id));
    }

    public function test_admin_can_create_update_and_remove_a_video(): void
    {
        $admin = User::factory()->admin()->create();
        $p1 = Product::factory()->complete()->create();
        $p2 = Product::factory()->complete()->create();

        $this->actingAs($admin)->post(route('admin.videos.store'), [
            'youtube_url' => 'https://youtube.com/shorts/dQw4w9WgXcQ',
            'title' => 'La robe Amani portée',
            'description' => 'Présentation',
            'is_vertical' => true,
            'product_ids' => [$p2->id, $p1->id],
            'is_published' => true,
        ])->assertSessionHasNoErrors();

        $video = Video::firstWhere('slug', 'la-robe-amani-portee');
        $this->assertSame('dQw4w9WgXcQ', $video->youtube_id);
        $this->assertTrue($video->is_vertical);
        $this->assertSame([$p2->id, $p1->id], $video->products()->pluck('products.id')->all()); // ordre conservé

        $this->actingAs($admin)->put(route('admin.videos.update', $video), [
            'youtube_url' => 'https://youtu.be/aaaaaaaaaaa',
            'title' => 'Nouveau titre',
            'slug' => $video->slug,
            'product_ids' => [$p1->id],
        ])->assertSessionHasNoErrors();

        $video->refresh();
        $this->assertSame('aaaaaaaaaaa', $video->youtube_id);
        $this->assertSame('la-robe-amani-portee', $video->slug); // le lien partagé ne change pas
        $this->assertSame([$p1->id], $video->products()->pluck('products.id')->all());

        $this->actingAs($admin)->delete(route('admin.videos.destroy', $video))->assertRedirect(route('admin.videos.index'));
        $this->assertModelMissing($video);
        $this->assertModelExists($p1); // les articles ne sont pas touchés
    }

    public function test_invalid_youtube_link_is_rejected_with_french_message(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->post(route('admin.videos.store'), ['youtube_url' => 'https://vimeo.com/123', 'title' => 'X'])
            ->assertSessionHasErrors(['youtube_url' => 'Lien YouTube non reconnu. Collez l\'adresse de la vidéo : youtube.com/watch?v=…, youtu.be/… ou youtube.com/shorts/…']);
    }

    public function test_video_admin_is_protected(): void
    {
        $this->get(route('admin.videos.index'))->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->get(route('admin.videos.index'))->assertForbidden();
        $this->actingAs(User::factory()->create())->post(route('admin.videos.store'), [])->assertForbidden();
    }
}
