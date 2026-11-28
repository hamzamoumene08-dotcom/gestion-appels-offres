<?php

namespace App\Http\Controllers;

use App\Models\AppelOffre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppelOffreController extends Controller
{
    private const GESTION = ['GESTIONNAIRE', 'ADMINISTRATEUR'];

    public function index(Request $r)
    {
        $q = AppelOffre::withCount('offres')->orderByDesc('id');

        // Un soumissionnaire ne voit que les appels publiés.
        if ($r->user()->role === 'SOUMISSIONNAIRE') {
            $q->where('statut', 'PUBLIE');
            $sid = $r->user()->soumissionnaire?->id;
            $q->withExists(['offres as deja_depose' => fn ($o) => $o->where('soumissionnaire_id', $sid)]);
        }

        if ($r->filled('statut')) {
            $q->whereIn('statut', explode(',', $r->statut));
        }

        return $q->get();
    }

    public function show(AppelOffre $appelOffre)
    {
        abort_if($appelOffre->statut !== 'PUBLIE', 404);

        return $appelOffre->loadCount('offres');
    }

    public function store(Request $r)
    {
        $this->only($r, ...self::GESTION);
        $d = $r->validate([
            'reference' => 'required|string|max:50|unique:appel_offres,reference',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget_estime' => 'required|numeric|min:0',
            'date_limite' => 'required|date|after:now',
        ]);
        $d['user_id'] = $r->user()->id;
        $d['statut'] = 'BROUILLON';

        return response()->json(AppelOffre::create($d), 201);
    }

    public function update(Request $r, AppelOffre $appelOffre)
    {
        $this->only($r, ...self::GESTION);
        abort_unless(in_array($appelOffre->statut, ['BROUILLON', 'PUBLIE'], true), 422, "Cet appel d'offres ne peut plus être modifié.");

        $d = $r->validate([
            'reference' => 'required|string|max:50|unique:appel_offres,reference,' . $appelOffre->id,
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget_estime' => 'required|numeric|min:0',
            'date_limite' => 'required|date|after:now',
        ]);

        $appelOffre->update($d);

        return $appelOffre->fresh();
    }

    public function destroy(Request $r, AppelOffre $appelOffre)
    {
        $this->only($r, ...self::GESTION);
        abort_unless($appelOffre->statut === 'BROUILLON', 422, 'Seul un brouillon peut être supprimé.');
        abort_if($appelOffre->offres()->exists(), 422, "Impossible de supprimer : des offres ont déjà été déposées.");
        $appelOffre->delete();

        return response()->noContent();
    }

    public function publier(Request $r, AppelOffre $appelOffre)
    {
        $this->only($r, ...self::GESTION);

        $updated = DB::transaction(function () use ($appelOffre) {
            $locked = AppelOffre::query()->lockForUpdate()->findOrFail($appelOffre->id);
            abort_unless($locked->statut === 'BROUILLON', 422, 'Seul un brouillon peut être publié.');
            abort_unless($locked->date_limite->isFuture(), 422, 'La date limite doit être dans le futur pour publier cet appel.');

            $locked->update([
                'statut' => 'PUBLIE',
                'date_publication' => now()->toDateString(),
            ]);

            return $locked;
        });

        return $updated->fresh();
    }

    public function cloturer(Request $r, AppelOffre $appelOffre)
    {
        $this->only($r, ...self::GESTION);

        $updated = DB::transaction(function () use ($appelOffre) {
            $locked = AppelOffre::query()->lockForUpdate()->findOrFail($appelOffre->id);
            abort_unless($locked->statut === 'PUBLIE', 422, 'Seul un appel publié peut être clôturé.');

            $locked->update(['statut' => 'CLOTURE']);

            return $locked;
        });

        return $updated->fresh();
    }
}
