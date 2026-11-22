<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarchePublic extends Model
{
    protected $fillable = ['appel_offre_id', 'offre_id', 'date_debut', 'date_fin', 'montant_final', 'taux_avancement', 'statut'];
    protected $casts = ['montant_final' => 'float', 'date_debut' => 'date:Y-m-d', 'date_fin' => 'date:Y-m-d', 'taux_avancement' => 'integer'];

    public function appelOffre() { return $this->belongsTo(AppelOffre::class); }
    public function offre() { return $this->belongsTo(Offre::class); }
}
