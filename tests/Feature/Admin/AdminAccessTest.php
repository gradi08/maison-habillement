<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public static function adminUrls(): array
    {
        return [
            ['/admin'],
            ['/admin/products'],
            ['/admin/products/create'],
            ['/admin/categories'],
            ['/admin/collections'],
            ['/admin/settings'],
        ];
    }

    #[DataProvider('adminUrls')]
    public function test_guests_are_redirected_to_login(string $url): void
    {
        $this->get($url)->assertRedirect('/login');
    }

    #[DataProvider('adminUrls')]
    public function test_non_admin_users_are_forbidden(string $url): void
    {
        $this->actingAs(User::factory()->create())->get($url)->assertForbidden();
    }

    #[DataProvider('adminUrls')]
    public function test_admins_can_access(string $url): void
    {
        $this->actingAs(User::factory()->admin()->create())->get($url)->assertOk();
    }

    public function test_non_admin_cannot_write(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->complete()->create();

        $this->actingAs($user)->delete(route('admin.products.destroy', $product))->assertForbidden();
        $this->actingAs($user)->put(route('admin.settings.update'), ['show_prices_globally' => true])->assertForbidden();
        $this->assertModelExists($product);
    }

    public function test_role_cannot_be_mass_assigned(): void
    {
        $user = User::create(['name' => 'X', 'email' => 'x@example.com', 'password' => 'secret-password', 'role' => 'admin']);

        $this->assertFalse($user->fresh()->isAdmin());
    }

    public function test_public_registration_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [
            'name' => 'X', 'email' => 'x@example.com', 'password' => 'password', 'password_confirmation' => 'password',
        ])->assertNotFound();
    }

    public function test_login_redirects_admin_to_back_office(): void
    {
        $admin = User::factory()->admin()->create();

        $this->post('/login', ['email' => $admin->email, 'password' => 'password'])
            ->assertRedirect('/dashboard');
        $this->get('/dashboard')->assertRedirect('/admin');
    }
}
