<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * Pages statiques : leur contenu (texte "À propos", coordonnées, réseaux sociaux)
 * vient des réglages publics déjà partagés par HandleInertiaRequests.
 */
class PageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('About');
    }

    public function contact(): Response
    {
        return Inertia::render('Contact');
    }
}
