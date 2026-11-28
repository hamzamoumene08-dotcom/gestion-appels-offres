<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use App\Models\MarchePublic;
use App\Models\Offre;
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

    /** Attribue atomiquement le marché à l'offre classée première. */
    public function attribuer(Request $r, AppelOffre $appelOffre)
    {
        $this->only($r, 'GESTIONNAIRE', 'ADMINISTRATEUR');
        $d = $r->validate(['date_fin' => 'nullable|date|after:today']);

        $marche = DB::transaction(function () use ($appelOffre, $d) {
            $lockedAppel = AppelOffre::query()->lockForUpdate()->findOrFail($appelOffre->id);
            abort_unless($lockedAppel->statut === 'EVALUE', 422, "L'appel d'offres doit être évalué et classé avant attribution.");
            abort_if($lockedAppel->marche()->exists(), 422, 'Un marché a déjà été attribué pour cet appel.');

            $offreGagnante = $lockedAppel->offres()
                ->where('statut', 'CONFORME')
                ->where('rang', 1)
                ->lockForUpdate()
                ->first();
            abort_if(! $offreGagnante, 422, 'Aucune offre conforme classée première.');

            $lockedAppel->offres()
                ->where('statut', 'CONFORME')
                ->where('id', '!=', $offreGagnante->id)
                ->update(['statut' => 'NON_RETENUE']);

            $offreGagnante->update(['statut' => 'RETENUE']);
            $lockedAppel->update(['statut' => 'ATTRIBUE']);

            return MarchePublic::create([
                'appel_offre_id' => $lockedAppel->id,
                'offre_id' => $offreGagnante->id,
                'date_debut' => now()->toDateString(),
                'date_fin' => $d['date_fin'] ?? null,
                'montant_final' => $offreGagnante->montant,
                'taux_avancement' => 0,
                'statut' => 'EN_ATTENTE',
            ]);
        });

        return response()->json($marche->load(['appelOffre:id,reference,titre', 'offre.soumissionnaire:id,raison_sociale']), 201);
    }

    /** Met à jour l'avancement sans permettre de réouvrir un marché terminé ou résilié. */
    public function avancement(Request $r, MarchePublic $marche)
    {
        $this->only($r, 'GESTIONNAIRE', 'ADMINISTRATEUR');
        $d = $r->validate([
            'taux_avancement' => 'required|integer|min:0|max:100',
            'statut' => 'nullable|in:EN_ATTENTE,EN_COURS,TERMINE,SUSPENDU,RESILIE',
        ]);

        $updated = DB::transaction(function () use ($marche, $d) {
            $locked = MarchePublic::query()->lockForUpdate()->findOrFail($marche->id);
            $terminal = in_array($locked->statut, ['TERMINE', 'RESILIE'], true);
            abort_if($terminal, 422, 'Un marché terminé ou résilié ne peut plus être modifié.');
            abort_if($d['taux_avancement'] < $locked->taux_avancement, 422, 'Le taux d’avancement ne peut pas diminuer.');

            $statut = $d['statut'] ?? match (true) {
                $d['taux_avancement'] === 100 => 'TERMINE',
                $d['taux_avancement'] > 0 => 'EN_COURS',
                default => 'EN_ATTENTE',
            };

            $current = $locked->statut;
            $transitions = [
                'EN_ATTENTE' => ['EN_ATTENTE', 'EN_COURS', 'SUSPENDU', 'RESILIE'],
                'EN_COURS' => ['EN_COURS', 'SUSPENDU', 'TERMINE', 'RESILIE'],
                'SUSPENDU' => ['SUSPENDU', 'EN_COURS', 'RESILIE'],
            ];
            abort_unless(in_array($statut, $transitions[$current] ?? [], true), 422, 'Transition de statut du marché non autorisée.');
            abort_if($statut === 'TERMINE' && $d['taux_avancement'] !== 100, 422, 'Un marché terminé doit être à 100 % d’avancement.');
            abort_if($statut === 'EN_ATTENTE' && $d['taux_avancement'] !== 0, 422, 'Un marché en attente doit avoir un avancement de 0 %.');
            abort_if($statut === 'EN_COURS' && ($d['taux_avancement'] === 0 || $d['taux_avancement'] === 100), 422, 'Un marché en cours doit avoir un avancement compris entre 1 et 99 %.');

            $locked->update(['taux_avancement' => $d['taux_avancement'], 'statut' => $statut]);

            return $locked->fresh();
        });

        return $updated->load(['appelOffre:id,reference,titre', 'offre.soumissionnaire:id,raison_sociale']);
    }
}
