<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Soumissionnaire extends Model
{
    protected $fillable = ['user_id', 'raison_sociale', 'ice', 'rc', 'adresse', 'telephone'];

    public function user() { return $this->belongsTo(User::class); }
    public function offres() { return $this->hasMany(Offre::class); }
}
