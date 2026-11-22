<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use App\Models\MarchePublic;
use App\Models\Offre;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index(Request $r)
    {
        $offres = Offre::query();
        if ($r->user()->role === 'SOUMISSIONNAIRE') {
            $offres->where('soumissionnaire_id', $r->user()->soumissionnaire?->id);
        }

        return [
            'appels_actifs' => AppelOffre::where('statut', 'PUBLIE')->count(),
            'offres' => $offres->count(),
            'marches_en_cours' => MarchePublic::whereIn('statut', ['EN_ATTENTE', 'EN_COURS'])->count(),
        ];
    }
}
