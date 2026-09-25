<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Settings', [
            'values' => Setting::allCached(),
            // Aide affichée sous le champ "modèle de message"
            'placeholders' => ['{product}', '{size}', '{color}', '{url}', '{reference}'],
        ]);
    }

    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            foreach ($request->validated() as $key => $value) {
                Setting::set($key, $value ?? '');
            }
        });

        return back()->with('success', 'Réglages enregistrés.');
    }
}
