<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppelOffre extends Model
{
    protected $fillable = ['reference', 'titre', 'description', 'budget_estime', 'date_publication', 'date_limite', 'statut', 'user_id'];

    protected $casts = [
        'budget_estime' => 'float',
        'date_publication' => 'date:Y-m-d',
        'date_limite' => 'datetime',
    ];

    public function createur() { return $this->belongsTo(User::class, 'user_id'); }
    public function offres() { return $this->hasMany(Offre::class); }
    public function marche() { return $this->hasOne(MarchePublic::class); }
}
