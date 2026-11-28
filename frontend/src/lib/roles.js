export const ROLES = {
  ADMIN: 'ADMINISTRATEUR',
  GESTIONNAIRE: 'GESTIONNAIRE',
  COMMISSION: 'COMMISSION',
  SOUMISSIONNAIRE: 'SOUMISSIONNAIRE',
};

export const ROLE_LABELS = {
  ADMINISTRATEUR: 'Administrateur',
  GESTIONNAIRE: 'Gestionnaire',
  COMMISSION: 'Commission',
  SOUMISSIONNAIRE: 'Soumissionnaire',
};

const { ADMIN, GESTIONNAIRE, COMMISSION, SOUMISSIONNAIRE } = ROLES;

// Source unique pour les routes protégées, le menu latéral et les accès rapides.
export const NAV_ITEMS = [
  { to: '/appels-offres', label: "Gérer les Appels d'Offres", roles: [GESTIONNAIRE, ADMIN], description: 'Consulter et piloter les procédures' },
  { to: '/marches', label: 'Suivi des Marchés', roles: [GESTIONNAIRE, ADMIN], description: "Voir l'avancement des contrats" },
  { to: '/utilisateurs', label: 'Gérer les utilisateurs', roles: [ADMIN], description: 'Administrer les comptes et les accès' },
  { to: '/appels-offres-dispo', label: "Consulter les Appels d'Offres", roles: [SOUMISSIONNAIRE], description: 'Trouver une procédure à laquelle répondre' },
  { to: '/mes-offres', label: 'Mes Offres', roles: [SOUMISSIONNAIRE], description: 'Suivre vos candidatures déposées' },
  { to: '/evaluations', label: 'Évaluer les Offres', roles: [COMMISSION], description: 'Accéder aux dossiers à évaluer' },
];

export const navFor = (role) => NAV_ITEMS.filter((item) => item.roles.includes(role));
