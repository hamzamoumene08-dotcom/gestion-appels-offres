<?php

use App\Http\Controllers\AppelOffreController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\MarchePublicController;
use App\Http\Controllers\OffreController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/stats', [StatsController::class, 'index']);

    Route::apiResource('appels-offres', AppelOffreController::class)->parameters(['appels-offres' => 'appelOffre']);
    Route::post('/appels-offres/{appelOffre}/publier', [AppelOffreController::class, 'publier']);
    Route::post('/appels-offres/{appelOffre}/cloturer', [AppelOffreController::class, 'cloturer']);
    Route::post('/appels-offres/{appelOffre}/classer', [EvaluationController::class, 'classer']);
    Route::post('/appels-offres/{appelOffre}/attribuer', [MarchePublicController::class, 'attribuer']);

    Route::get('/offres', [OffreController::class, 'index']);
    Route::post('/offres', [OffreController::class, 'store']);
    Route::post('/offres/{offre}/evaluation', [EvaluationController::class, 'store']);

    Route::get('/marches', [MarchePublicController::class, 'index']);
    Route::patch('/marches/{marche}/avancement', [MarchePublicController::class, 'avancement']);

    Route::apiResource('users', UserController::class)->except('show');
});
