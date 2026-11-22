<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use App\Models\Offre;
use Illuminate\Http\Request;

class OffreController extends Controller
{
    public function index(Request $r)
    {
        $q = Offre::with(['appelOffre:id,reference,titre,statut', 'soumissionnaire:id,raison_sociale', 'evaluations'])
            ->orderByDesc('id');

        if ($r->user()->role === 'SOUMISSIONNAIRE') {
            $q->where('soumissionnaire_id', $r->user()->soumissionnaire?->id);
        } else {
            $this->only($r, 'COMMISSION', 'GESTIONNAIRE', 'ADMINISTRATEUR');
        }
        if ($r->filled('appel_offre_id')) {
            $q->where('appel_offre_id', $r->appel_offre_id);
        }

        return $q->get();
    }

    public function store(Request $r)
    {
        $this->only($r, 'SOUMISSIONNAIRE');
        $d = $r->validate([
            'appel_offre_id' => 'required|exists:appel_offres,id',
            'montant' => 'required|numeric|min:0',
            'fichier' => 'nullable|file|mimes:pdf,doc,docx,zip|max:10240',
        ]);

        $appel = AppelOffre::findOrFail($d['appel_offre_id']);
        abort_unless($appel->statut === 'PUBLIE' && $appel->date_limite->isFuture(), 422, "Cet appel d'offres n'accepte plus d'offres.");

        $sou = $r->user()->soumissionnaire;
        abort_if(!$sou, 422, 'Profil soumissionnaire introuvable.');
        abort_if(Offre::where('appel_offre_id', $appel->id)->where('soumissionnaire_id', $sou->id)->exists(), 422, 'Vous avez déjà déposé une offre pour cet appel.');

        $offre = Offre::create([
            'appel_offre_id' => $appel->id,
            'soumissionnaire_id' => $sou->id,
            'montant' => $d['montant'],
            'fichier_path' => $r->file('fichier')?->store('offres', 'public'),
            'date_depot' => now(),
            'statut' => 'DEPOSEE',
        ]);

        return response()->json($offre, 201);
    }
}
