<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use App\Models\MarchePublic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MarchePublicController extends Controller
{
    public function index(Request $r)
    {
        $this->only($r, 'GESTIONNAIRE', 'ADMINISTRATEUR');
        return MarchePublic::with(['appelOffre:id,reference,titre', 'offre.soumissionnaire:id,raison_sociale'])
            ->orderByDesc('id')->get();
    }

    /** Attribue le marché à l'offre classée 1re. */
    public function attribuer(Request $r, AppelOffre $appelOffre)
    {
        $this->only($r, 'GESTIONNAIRE');
        abort_unless($appelOffre->statut === 'EVALUE', 422, "L'appel d'offres doit être évalué et classé.");
        $d = $r->validate(['date_fin' => 'nullable|date|after:today']);

        $gagnante = $appelOffre->offres()->where('statut', 'CONFORME')->where('rang', 1)->first();
        abort_if(!$gagnante, 422, 'Aucune offre classée première.');

        $marche = DB::transaction(function () use ($appelOffre, $gagnante, $d) {
            $appelOffre->offres()->where('id', '!=', $gagnante->id)->where('statut', 'CONFORME')->update(['statut' => 'NON_RETENUE']);
            $gagnante->update(['statut' => 'RETENUE']);
            $appelOffre->update(['statut' => 'ATTRIBUE']);

            return MarchePublic::create([
                'appel_offre_id' => $appelOffre->id,
                'offre_id' => $gagnante->id,
                'date_debut' => now()->toDateString(),
                'date_fin' => $d['date_fin'] ?? null,
                'montant_final' => $gagnante->montant,
                'taux_avancement' => 0,
                'statut' => 'EN_ATTENTE',
            ]);
        });

        return response()->json($marche->load(['appelOffre:id,reference,titre', 'offre.soumissionnaire:id,raison_sociale']), 201);
    }

    public function avancement(Request $r, MarchePublic $marche)
    {
        $this->only($r, 'GESTIONNAIRE');
        $d = $r->validate([
            'taux_avancement' => 'required|integer|min:0|max:100',
            'statut' => 'nullable|in:EN_ATTENTE,EN_COURS,TERMINE,SUSPENDU,RESILIE',
        ]);
        $statut = $d['statut'] ?? match (true) {
            $d['taux_avancement'] >= 100 => 'TERMINE',
            $d['taux_avancement'] > 0 => 'EN_COURS',
            default => 'EN_ATTENTE',
        };
        $marche->update(['taux_avancement' => $d['taux_avancement'], 'statut' => $statut]);

        return $marche->load(['appelOffre:id,reference,titre', 'offre.soumissionnaire:id,raison_sociale']);
    }
}
