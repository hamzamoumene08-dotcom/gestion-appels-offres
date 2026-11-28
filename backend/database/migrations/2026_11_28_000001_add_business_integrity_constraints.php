<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appel_offres', function (Blueprint $table) {
            $table->index(['statut', 'date_limite'], 'appel_offres_statut_date_limite_index');
        });

        Schema::table('offres', function (Blueprint $table) {
            $table->index(['appel_offre_id', 'statut'], 'offres_appel_statut_index');
        });

        Schema::table('evaluations', function (Blueprint $table) {
            $table->index(['offre_id', 'user_id'], 'evaluations_offre_user_index');
        });

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $version = DB::selectOne('SELECT VERSION() AS version')->version;
        preg_match('/^(\d+\.\d+\.\d+)/', $version, $matches);
        $versionNumber = $matches[1] ?? '0.0.0';

        if (stripos($version, 'MariaDB') !== false) {
            if (version_compare($versionNumber, '10.2.1', '<')) {
                throw new RuntimeException('Les contraintes CHECK nécessitent MariaDB 10.2.1 ou plus récent.');
            }
        } elseif (version_compare($versionNumber, '8.0.16', '<')) {
            throw new RuntimeException('Les contraintes CHECK nécessitent MySQL 8.0.16 ou plus récent.');
        }

        DB::statement("
            ALTER TABLE users
            ADD CONSTRAINT users_role_check
            CHECK (role IN ('ADMINISTRATEUR', 'GESTIONNAIRE', 'SOUMISSIONNAIRE', 'COMMISSION'))
        ");

        DB::statement("
            ALTER TABLE appel_offres
            ADD CONSTRAINT appel_offres_budget_check
                CHECK (budget_estime >= 0),
            ADD CONSTRAINT appel_offres_statut_check
                CHECK (statut IN ('BROUILLON', 'PUBLIE', 'CLOTURE', 'EVALUE', 'ATTRIBUE', 'ANNULE'))
        ");

        DB::statement("
            ALTER TABLE offres
            ADD CONSTRAINT offres_montant_check
                CHECK (montant >= 0),
            ADD CONSTRAINT offres_note_finale_check
                CHECK (note_finale IS NULL OR (note_finale >= 0 AND note_finale <= 20)),
            ADD CONSTRAINT offres_rang_check
                CHECK (rang IS NULL OR rang >= 1),
            ADD CONSTRAINT offres_statut_check
                CHECK (statut IN ('DEPOSEE', 'CONFORME', 'REJETEE', 'RETENUE', 'NON_RETENUE'))
        ");

        DB::statement("
            ALTER TABLE evaluations
            ADD CONSTRAINT evaluations_note_check
                CHECK (note_technique >= 0 AND note_technique <= 20)
        ");

        DB::statement("
            ALTER TABLE marche_publics
            ADD CONSTRAINT marches_montant_check
                CHECK (montant_final >= 0),
            ADD CONSTRAINT marches_avancement_check
                CHECK (taux_avancement >= 0 AND taux_avancement <= 100),
            ADD CONSTRAINT marches_dates_check
                CHECK (date_fin IS NULL OR date_fin >= date_debut),
            ADD CONSTRAINT marches_statut_check
                CHECK (statut IN ('EN_ATTENTE', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'RESILIE'))
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE marche_publics DROP CHECK marches_statut_check');
            DB::statement('ALTER TABLE marche_publics DROP CHECK marches_dates_check');
            DB::statement('ALTER TABLE marche_publics DROP CHECK marches_avancement_check');
            DB::statement('ALTER TABLE marche_publics DROP CHECK marches_montant_check');

            DB::statement('ALTER TABLE evaluations DROP CHECK evaluations_note_check');

            DB::statement('ALTER TABLE offres DROP CHECK offres_statut_check');
            DB::statement('ALTER TABLE offres DROP CHECK offres_rang_check');
            DB::statement('ALTER TABLE offres DROP CHECK offres_note_finale_check');
            DB::statement('ALTER TABLE offres DROP CHECK offres_montant_check');

            DB::statement('ALTER TABLE appel_offres DROP CHECK appel_offres_statut_check');
            DB::statement('ALTER TABLE appel_offres DROP CHECK appel_offres_budget_check');

            DB::statement('ALTER TABLE users DROP CHECK users_role_check');
        }

        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropIndex('evaluations_offre_user_index');
        });

        Schema::table('offres', function (Blueprint $table) {
            $table->dropIndex('offres_appel_statut_index');
        });

        Schema::table('appel_offres', function (Blueprint $table) {
            $table->dropIndex('appel_offres_statut_date_limite_index');
        });
    }
};
