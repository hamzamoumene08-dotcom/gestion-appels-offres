<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /** Inscription = création d'un compte Soumissionnaire. */
    public function register(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:30',
        ]);

        $user = DB::transaction(function () use ($d) {
            $user = User::create([
                'name' => $d['name'], 'email' => $d['email'],
                'password' => $d['password'], 'role' => 'SOUMISSIONNAIRE',
            ]);
            $user->soumissionnaire()->create([
                'adresse' => $d['adresse'] ?? null,
                'telephone' => $d['telephone'] ?? null,
            ]);
            return $user;
        });

        return response()->json([
            'token' => $user->createToken('api')->plainTextToken,
            'user' => $user->load('soumissionnaire'),
        ], 201);
    }

    public function login(Request $r)
    {
        $d = $r->validate(['email' => 'required|email', 'password' => 'required']);

        if (!Auth::attempt($d)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 422);
        }

        $user = Auth::user();
        return response()->json([
            'token' => $user->createToken('api')->plainTextToken,
            'user' => $user->load('soumissionnaire'),
        ]);
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $r)
    {
        return $r->user()->load('soumissionnaire');
    }
}
