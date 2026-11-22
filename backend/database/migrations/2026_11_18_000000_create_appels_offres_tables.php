<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->string('role')->default('SOUMISSIONNAIRE')->after('password');
        });

        Schema::create('soumissionnaires', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('raison_sociale');
            $t->string('ice')->nullable();
            $t->string('rc')->nullable();
            $t->string('adresse')->nullable();
            $t->string('telephone')->nullable();
            $t->timestamps();
        });

        Schema::create('appel_offres', function (Blueprint $t) {
            $t->id();
            $t->string('reference')->unique();
            $t->string('titre');
            $t->text('description')->nullable();
            $t->decimal('budget_estime', 15, 2);
            $t->date('date_publication')->nullable();
            $t->dateTime('date_limite');
            $t->string('statut')->default('BROUILLON'); // BROUILLON PUBLIE CLOTURE EVALUE ATTRIBUE ANNULE
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->timestamps();
        });

        Schema::create('offres', function (Blueprint $t) {
            $t->id();
            $t->foreignId('appel_offre_id')->constrained('appel_offres')->cascadeOnDelete();
            $t->foreignId('soumissionnaire_id')->constrained()->cascadeOnDelete();
            $t->decimal('montant', 15, 2);
            $t->string('fichier_path')->nullable();
            $t->dateTime('date_depot');
            $t->string('statut')->default('DEPOSEE'); // DEPOSEE CONFORME REJETEE RETENUE NON_RETENUE
            $t->boolean('conforme_administrativement')->nullable();
            $t->decimal('note_finale', 5, 2)->nullable();
            $t->unsignedInteger('rang')->nullable();
            $t->timestamps();
            $t->unique(['appel_offre_id', 'soumissionnaire_id']);
        });

        Schema::create('evaluations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('offre_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->decimal('note_technique', 5, 2);
            $t->text('commentaire')->nullable();
            $t->date('date_evaluation');
            $t->timestamps();
            $t->unique(['offre_id', 'user_id']);
        });

        Schema::create('marche_publics', function (Blueprint $t) {
            $t->id();
            $t->foreignId('appel_offre_id')->unique()->constrained('appel_offres')->cascadeOnDelete();
            $t->foreignId('offre_id')->constrained()->cascadeOnDelete();
            $t->date('date_debut');
            $t->date('date_fin')->nullable();
            $t->decimal('montant_final', 15, 2);
            $t->unsignedTinyInteger('taux_avancement')->default(0);
            $t->string('statut')->default('EN_ATTENTE'); // EN_ATTENTE EN_COURS TERMINE SUSPENDU RESILIE
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marche_publics');
        Schema::dropIfExists('evaluations');
        Schema::dropIfExists('offres');
        Schema::dropIfExists('appel_offres');
        Schema::dropIfExists('soumissionnaires');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('role'));
    }
};
