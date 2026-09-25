<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    protected function prepareForValidation(): void
    {
        // "+33 6 12 34 56 78" → "33612345678" (format attendu par wa.me)
        if ($this->has('whatsapp_number')) {
            $this->merge([
                'whatsapp_number' => preg_replace('/\D+/', '', (string) $this->input('whatsapp_number')),
            ]);
        }

        if ($this->filled('currency')) {
            $this->merge(['currency' => strtoupper((string) $this->input('currency'))]);
        }
    }

    public function rules(): array
    {
        return [
            'show_prices_globally' => ['required', 'boolean'],
            'currency' => ['required', 'string', 'size:3', 'alpha'],
            'whatsapp_number' => ['nullable', 'regex:/^[1-9]\d{7,14}$/'],
            'whatsapp_message_template' => ['required', 'string', 'max:1000'],
            'contact_email' => ['nullable', 'email', 'max:150'],
            'contact_phone' => ['nullable', 'string', 'max:40'],
            'contact_address' => ['nullable', 'string', 'max:300'],
            'about_text' => ['nullable', 'string', 'max:10000'],
            'instagram_url' => ['nullable', 'url:https', 'max:255'],
            'facebook_url' => ['nullable', 'url:https', 'max:255'],
            'tiktok_url' => ['nullable', 'url:https', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'whatsapp_number.regex' => 'Numéro au format international, indicatif pays inclus (ex. 33612345678).',
        ];
    }
}
