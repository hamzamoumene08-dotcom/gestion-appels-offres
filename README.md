# Gestion des appels d'offres et des marchés publics
React (Vite) + Laravel (Sanctum) + MySQL

## Structure du dépôt
```
Projet-web/
├── frontend/   (React)
├── backend/    (Laravel)   <- créé à l'étape 1 ci-dessous
├── docs/       (diagrammes UML, rapport)
└── README.md
```

## Backend (Laravel 11/12, PHP 8.2+, Composer, MySQL)
```bash
composer create-project laravel/laravel backend
cd backend
php artisan install:api            # installe Sanctum + routes/api.php
# copier le contenu de backend-overlay/ par-dessus backend/ (app, database, routes)
```
Dans `backend/.env` :
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=appels_offres
DB_USERNAME=root
DB_PASSWORD=
```
Créer la base `appels_offres` (phpMyAdmin / `CREATE DATABASE appels_offres;`) puis :
```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve                  # http://localhost:8000
```
Comptes de test (mot de passe `password`) : admin@test.com, gest@test.com, comm@test.com, soum@test.com

## Frontend
```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```
Si l'API n'est pas sur localhost:8000 : `VITE_API_URL=http://.../api` dans `frontend/.env`.

## Scénario de démonstration
1. gest@test.com : créer un appel d'offres -> Publier
2. soum@test.com (ou inscription) : Consulter les appels -> Déposer une offre (montant + fichier)
3. gest@test.com : Clôturer l'appel
4. comm@test.com : Évaluer chaque offre (conformité + note) -> Classer les offres
5. gest@test.com : Suivi des marchés -> Attribuer -> Mettre à jour l'avancement
6. admin@test.com : Gérer les utilisateurs
