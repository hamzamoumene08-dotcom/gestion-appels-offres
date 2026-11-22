<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    protected $fillable = ['offre_id', 'user_id', 'note_technique', 'commentaire', 'date_evaluation'];
    protected $casts = ['note_technique' => 'float', 'date_evaluation' => 'date:Y-m-d'];

    public function offre() { return $this->belongsTo(Offre::class); }
    public function evaluateur() { return $this->belongsTo(User::class, 'user_id'); }
}
