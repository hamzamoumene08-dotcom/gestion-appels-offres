<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private const ROLES = 'ADMINISTRATEUR,GESTIONNAIRE,SOUMISSIONNAIRE,COMMISSION';

    public function index(Request $r)
    {
        $this->only($r, 'ADMINISTRATEUR');
        return User::orderBy('id')->get();
    }

    public function store(Request $r)
    {
        $this->only($r, 'ADMINISTRATEUR');
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:' . self::ROLES,
        ]);
        return response()->json(User::create($d), 201);
    }

    public function update(Request $r, User $user)
    {
        $this->only($r, 'ADMINISTRATEUR');
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|in:' . self::ROLES,
        ]);
        if (empty($d['password'])) unset($d['password']);
        $user->update($d);
        return $user;
    }

    public function destroy(Request $r, User $user)
    {
        $this->only($r, 'ADMINISTRATEUR');
        abort_if($user->id === $r->user()->id, 422, 'Vous ne pouvez pas supprimer votre propre compte.');
        $user->delete();
        return response()->noContent();
    }
}
