<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use App\Models\Evaluation;
use App\Models\Offre;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    /** Vérifie la conformité administrative + note technique d'une offre. */
    public function store(Request $r, Offre $offre)
    {
        $this->only($r, 'COMMISSION');
        abort_unless(in_array($offre->appelOffre->statut, ['CLOTURE', 'EVALUE']), 422, "L'appel d'offres doit être clôturé avant l'évaluation.");

        $d = $r->validate([
            'conforme' => 'required|boolean',
            'note_technique' => 'nullable|numeric|min:0|max:20',
            'commentaire' => 'nullable|string',
        ]);

        if (!$d['conforme']) {
            $offre->update(['conforme_administrativement' => false, 'statut' => 'REJETEE', 'note_finale' => null, 'rang' => null]);
            return $offre->fresh()->load('evaluations');
        }
        abort_if(!isset($d['note_technique']), 422, 'La note technique est obligatoire pour une offre conforme.');

        Evaluation::updateOrCreate(
            ['offre_id' => $offre->id, 'user_id' => $r->user()->id],
            ['note_technique' => $d['note_technique'], 'commentaire' => $d['commentaire'] ?? null, 'date_evaluation' => now()->toDateString()]
        );
        $offre->update([
            'conforme_administrativement' => true,
            'statut' => 'CONFORME',
            'note_finale' => round($offre->evaluations()->avg('note_technique'), 2),
        ]);

        return $offre->fresh()->load('evaluations');
    }

    /** Classe les offres conformes (meilleure note, puis moins-disant). */
    public function classer(Request $r, AppelOffre $appelOffre)
    {
        $this->only($r, 'COMMISSION');
        abort_unless(in_array($appelOffre->statut, ['CLOTURE', 'EVALUE']), 422, "L'appel d'offres doit être clôturé.");

        $offres = $appelOffre->offres()->where('statut', 'CONFORME')->get()
            ->sortBy([['note_finale', 'desc'], ['montant', 'asc']])->values();
        abort_if($offres->isEmpty(), 422, 'Aucune offre conforme à classer.');

        foreach ($offres as $i => $o) {
            $o->update(['rang' => $i + 1]);
        }
        $appelOffre->update(['statut' => 'EVALUE']);

        return $appelOffre->offres()->with('soumissionnaire:id,raison_sociale')->orderBy('rang')->get();
    }
}
