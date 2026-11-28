<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use App\Models\Evaluation;
use App\Models\Offre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EvaluationController extends Controller
{
    /** Enregistre la conformité et la note technique d'une offre. */
    public function store(Request $r, Offre $offre)
    {
        $this->only($r, 'COMMISSION');

        $d = $r->validate([
            'conforme' => 'required|boolean',
            'note_technique' => 'nullable|numeric|min:0|max:20',
            'commentaire' => 'nullable|string|max:5000',
        ]);

        $result = DB::transaction(function () use ($r, $offre, $d) {
            $appel = AppelOffre::query()->lockForUpdate()->findOrFail($offre->appel_offre_id);
            $lockedOffre = Offre::query()->lockForUpdate()->findOrFail($offre->id);

            abort_unless($appel->statut === 'CLOTURE', 422, "L'appel doit être clôturé et pas encore classé avant son évaluation.");
            abort_unless($lockedOffre->statut === 'DEPOSEE', 422, 'Cette offre a déjà été évaluée.');

            if (! $d['conforme']) {
                $lockedOffre->update([
                    'conforme_administrativement' => false,
                    'statut' => 'REJETEE',
                    'note_finale' => null,
                    'rang' => null,
                ]);

                return $lockedOffre->fresh()->load('evaluations');
            }

            abort_if(! isset($d['note_technique']), 422, 'La note technique est obligatoire pour une offre conforme.');

            Evaluation::create([
                'offre_id' => $lockedOffre->id,
                'user_id' => $r->user()->id,
                'note_technique' => $d['note_technique'],
                'commentaire' => $d['commentaire'] ?? null,
                'date_evaluation' => now()->toDateString(),
            ]);

            $lockedOffre->update([
                'conforme_administrativement' => true,
                'statut' => 'CONFORME',
                'note_finale' => round((float) $lockedOffre->evaluations()->avg('note_technique'), 2),
            ]);

            return $lockedOffre->fresh()->load('evaluations');
        });

        return $result;
    }

    /** Classe les offres seulement lorsque toutes les offres ont été évaluées. */
    public function classer(Request $r, AppelOffre $appelOffre)
    {
        $this->only($r, 'COMMISSION');

        return DB::transaction(function () use ($appelOffre) {
            $lockedAppel = AppelOffre::query()->lockForUpdate()->findOrFail($appelOffre->id);
            abort_unless($lockedAppel->statut === 'CLOTURE', 422, "Seul un appel clôturé et non classé peut être classé.");

            $offres = $lockedAppel->offres()->lockForUpdate()->get();
            abort_if($offres->isEmpty(), 422, 'Aucune offre à classer.');
            abort_if($offres->contains(fn (Offre $offre) => $offre->statut === 'DEPOSEE'), 422, 'Toutes les offres doivent être évaluées avant le classement.');

            $conformes = $offres->where('statut', 'CONFORME');
            abort_if($conformes->isEmpty(), 422, 'Aucune offre conforme à classer.');

            $classees = $conformes->sort(function (Offre $a, Offre $b) {
                $noteOrder = ($b->note_finale ?? 0) <=> ($a->note_finale ?? 0);
                return $noteOrder !== 0 ? $noteOrder : ($a->montant <=> $b->montant);
            })->values();

            foreach ($classees as $index => $offre) {
                $offre->update(['rang' => $index + 1]);
            }

            $lockedAppel->update(['statut' => 'EVALUE']);

            return $lockedAppel->offres()
                ->with('soumissionnaire:id,raison_sociale')
                ->orderByRaw('rang IS NULL')
                ->orderBy('rang')
                ->get();
        });
    }
}
