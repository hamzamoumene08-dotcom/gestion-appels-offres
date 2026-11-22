<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    /** Réserve l'action aux rôles indiqués (sinon 403). */
    protected function only(Request $r, string ...$roles): void
    {
        abort_unless(in_array($r->user()->role, $roles, true), 403, 'Accès refusé pour votre rôle.');
    }
}
