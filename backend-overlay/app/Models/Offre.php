<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offre extends Model
{
    protected $fillable = ['appel_offre_id', 'soumissionnaire_id', 'montant', 'fichier_path', 'date_depot', 'statut', 'conforme_administrativement', 'note_finale', 'rang'];

    protected $casts = [
        'montant' => 'float',
        'note_finale' => 'float',
        'conforme_administrativement' => 'boolean',
        'date_depot' => 'datetime',
    ];

    public function appelOffre() { return $this->belongsTo(AppelOffre::class); }
    public function soumissionnaire() { return $this->belongsTo(Soumissionnaire::class); }
    public function evaluations() { return $this->hasMany(Evaluation::class); }
}
