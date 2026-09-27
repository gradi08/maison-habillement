<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Video;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Vidéos envoyées en fichier : envoi par morceaux, vérification du contenu, rangement, suppression. */
class VideoFileUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Storage::fake('public');
        config(['media.video_chunk_mb' => 1]); // petits morceaux pour tester l'assemblage
        $this->admin = User::factory()->admin()->create();
    }

    /** MP4 minimal reconnu par finfo (boîte ftyp) + données. */
    private function mp4(int $bytes): string
    {
        $head = pack('N', 32).'ftypisom'.pack('N', 512).'isomiso2avc1mp41';

        return $head.pack('N', $bytes - strlen($head)).'mdat'.random_bytes($bytes - strlen($head) - 8);
    }

    /** Envoie un contenu en morceaux comme le fait le navigateur ; renvoie l'identifiant d'envoi. */
    private function upload(string $content, string $type = 'video/mp4'): string
    {
        $start = $this->actingAs($this->admin)
            ->postJson(route('admin.video-uploads.start'), ['name' => 'defile.mp4', 'size' => strlen($content), 'type' => $type])
            ->assertCreated()
            ->json();

        $offset = 0;
        foreach (str_split($content, $start['chunk_bytes']) as $chunk) {
            $received = $this->actingAs($this->admin)
                ->call('PUT', route('admin.video-uploads.chunk', $start['id']).'?offset='.$offset, [], [], [], [
                    'CONTENT_TYPE' => 'application/octet-stream',
                    'HTTP_ACCEPT' => 'application/json',
                ], $chunk)
                ->assertOk()
                ->json('received');
            $this->assertSame($offset + strlen($chunk), $received);
            $offset = $received;
        }

        return $start['id'];
    }

    public function test_video_file_is_uploaded_in_chunks_and_published(): void
    {
        $content = $this->mp4(2_600_000); // 3 morceaux de 1 Mo
        $id = $this->upload($content);

        $this->actingAs($this->admin)->post(route('admin.videos.store'), [
            'source' => 'file',
            'upload_id' => $id,
            'poster' => UploadedFile::fake()->image('apercu.webp', 720, 1280),
            'duration' => 28,
            'title' => 'Défilé Héritage',
            'is_vertical' => true,
        ])->assertSessionHasNoErrors();

        $video = Video::firstWhere('slug', 'defile-heritage');
        $this->assertTrue($video->isFile());
        $this->assertSame('video/mp4', $video->file_mime);
        $this->assertSame(strlen($content), $video->file_size);
        $this->assertSame(28, $video->duration);
        Storage::disk('public')->assertExists($video->file_path);
        Storage::disk('public')->assertExists($video->poster_path);
        $this->assertStringStartsWith("videos/{$video->id}/", $video->file_path);
        $this->assertStringEndsWith('.mp4', $video->file_path);
        $this->assertSame($content, Storage::disk('public')->get($video->file_path)); // assemblage exact
        $this->assertSame([], Storage::disk('local')->files('video-uploads')); // morceaux nettoyés

        $this->get(route('videos.show', $video->slug))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('video.source', 'file')
            ->where('video.file_url', fn ($url) => str_ends_with($url, $video->file_path))
            ->where('video.embed_url', null)
            ->where('video.thumbnail_url', fn ($url) => str_ends_with($url, $video->poster_path)));
    }

    public function test_upload_resumes_at_the_server_position(): void
    {
        $content = $this->mp4(1_500_000);
        $start = $this->actingAs($this->admin)
            ->postJson(route('admin.video-uploads.start'), ['name' => 'a.mp4', 'size' => strlen($content), 'type' => 'video/mp4'])
            ->json();
        $first = substr($content, 0, $start['chunk_bytes']);
        $url = route('admin.video-uploads.chunk', $start['id']);
        $headers = ['CONTENT_TYPE' => 'application/octet-stream', 'HTTP_ACCEPT' => 'application/json'];

        $this->actingAs($this->admin)->call('PUT', "{$url}?offset=0", [], [], [], $headers, $first)->assertJson(['received' => strlen($first)]);
        // Le navigateur renvoie le même morceau (réponse perdue) : le serveur ne le duplique pas et indique où reprendre.
        $this->actingAs($this->admin)->call('PUT', "{$url}?offset=0", [], [], [], $headers, $first)->assertJson(['received' => strlen($first)]);
    }

    public function test_non_video_content_is_rejected_even_with_a_video_name(): void
    {
        $id = $this->upload('%PDF-1.4 '.str_repeat('x', 5000)); // « défilé.mp4 » qui est en réalité un PDF

        $this->actingAs($this->admin)->post(route('admin.videos.store'), [
            'source' => 'file', 'upload_id' => $id, 'title' => 'Piège',
        ])->assertSessionHasErrors(['upload_id' => 'Ce fichier n\'est pas une vidéo MP4, WebM ou MOV.']);

        $this->assertSame(0, Video::count());
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_size_limit_and_format_are_checked_before_upload(): void
    {
        config(['media.video_max_mb' => 1]);

        $this->actingAs($this->admin)
            ->postJson(route('admin.video-uploads.start'), ['name' => 'long.mp4', 'size' => 2 * 1024 * 1024, 'type' => 'video/mp4'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['size']);

        $this->actingAs($this->admin)
            ->postJson(route('admin.video-uploads.start'), ['name' => 'film.avi', 'size' => 1000, 'type' => 'video/x-msvideo'])
            ->assertUnprocessable();
    }

    public function test_file_video_requires_an_upload(): void
    {
        $this->actingAs($this->admin)->post(route('admin.videos.store'), ['source' => 'file', 'title' => 'Sans fichier'])
            ->assertSessionHasErrors(['upload_id' => 'Choisissez le fichier vidéo et attendez la fin de l\'envoi.']);
    }

    public function test_replacing_and_deleting_remove_old_files(): void
    {
        $this->actingAs($this->admin)->post(route('admin.videos.store'), [
            'source' => 'file', 'upload_id' => $this->upload($this->mp4(300_000)), 'title' => 'Vidéo',
        ]);
        $video = Video::first();
        $oldFile = $video->file_path;

        // Remplacement du fichier (POST + _method=put, comme le formulaire)
        $this->actingAs($this->admin)->post(route('admin.videos.update', $video), [
            '_method' => 'put', 'source' => 'file', 'upload_id' => $this->upload($this->mp4(400_000)), 'title' => 'Vidéo', 'slug' => $video->slug,
        ])->assertSessionHasNoErrors();
        $video->refresh();
        $this->assertNotSame($oldFile, $video->file_path);
        Storage::disk('public')->assertMissing($oldFile);
        Storage::disk('public')->assertExists($video->file_path);

        // Modification sans nouveau fichier : le fichier actuel est gardé.
        $this->actingAs($this->admin)->post(route('admin.videos.update', $video), [
            '_method' => 'put', 'source' => 'file', 'title' => 'Nouveau titre', 'slug' => $video->slug,
        ])->assertSessionHasNoErrors();
        Storage::disk('public')->assertExists($video->fresh()->file_path);

        // Suppression : fichiers effacés
        $path = $video->fresh()->file_path;
        $this->actingAs($this->admin)->delete(route('admin.videos.destroy', $video));
        Storage::disk('public')->assertMissing($path);
    }

    public function test_switching_to_youtube_deletes_the_file(): void
    {
        $this->actingAs($this->admin)->post(route('admin.videos.store'), [
            'source' => 'file', 'upload_id' => $this->upload($this->mp4(300_000)), 'title' => 'Vidéo',
        ]);
        $video = Video::first();
        $path = $video->file_path;

        $this->actingAs($this->admin)->put(route('admin.videos.update', $video), [
            'source' => 'youtube', 'youtube_url' => 'https://youtu.be/dQw4w9WgXcQ', 'title' => 'Vidéo', 'slug' => $video->slug,
        ])->assertSessionHasNoErrors();

        $video->refresh();
        $this->assertFalse($video->isFile());
        $this->assertSame('dQw4w9WgXcQ', $video->youtube_id);
        $this->assertNull($video->file_path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_upload_endpoints_are_admin_only(): void
    {
        $this->postJson(route('admin.video-uploads.start'), ['name' => 'a.mp4', 'size' => 10])->assertUnauthorized();
        $this->actingAs(User::factory()->create())
            ->postJson(route('admin.video-uploads.start'), ['name' => 'a.mp4', 'size' => 10])
            ->assertForbidden();
    }
}
