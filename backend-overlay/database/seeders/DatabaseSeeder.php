<?php

namespace Database\Seeders;

use App\Models\AppelOffre;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'password', 'role' => 'ADMINISTRATEUR']);
        $gest = User::create(['name' => 'Gestionnaire', 'email' => 'gest@test.com', 'password' => 'password', 'role' => 'GESTIONNAIRE']);
        User::create(['name' => 'Commission', 'email' => 'comm@test.com', 'password' => 'password', 'role' => 'COMMISSION']);
        $s = User::create(['name' => 'Société Atlas', 'email' => 'soum@test.com', 'password' => 'password', 'role' => 'SOUMISSIONNAIRE']);
        $s->soumissionnaire()->create(['raison_sociale' => 'Atlas Informatique SARL', 'ice' => '001234567000089', 'rc' => 'RC-4521', 'adresse' => 'Agadir', 'telephone' => '0528000000']);

        AppelOffre::create(['reference' => 'AO-2026-001', 'titre' => 'Achat de matériel informatique', 'description' => 'Fourniture de 50 postes de travail.', 'budget_estime' => 150000, 'date_publication' => now(), 'date_limite' => now()->addDays(20), 'statut' => 'PUBLIE', 'user_id' => $gest->id]);
        AppelOffre::create(['reference' => 'AO-2026-002', 'titre' => "Construction d'un centre de santé", 'budget_estime' => 500000, 'date_limite' => now()->addDays(45), 'statut' => 'BROUILLON', 'user_id' => $gest->id]);
    }
}
