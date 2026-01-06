# Portfolio ESGI 5IW1 - Airtable

Portfolio de la filière Ingénierie du Web pour présenter des projets étudiants, développé avec **React 19 + Vite 6** (frontend) et **Node.js + Express** (backend), utilisant Airtable comme base de données.

## 🚀 Technologies utilisées

### Frontend
- **React 19** - Bibliothèque JavaScript pour l'interface utilisateur
- **Vite 6** - Build tool et serveur de développement
- **React Router DOM** - Gestion de la navigation et des routes
- **Tailwind CSS** - Framework CSS utilitaire
- **Zod** - Validation des schémas et formulaires
- **React Hook Form** - Gestion des formulaires
- **Lucide React** - Bibliothèque d'icônes

### Backend
- **Node.js** avec **Express**
- **Airtable API** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hashage des mots de passe
- **Zod** pour la validation backend
- **CORS** pour la gestion des requêtes cross-origin

### Infrastructure
- **Docker Compose** pour l'orchestration des services

## 📋 Prérequis

- Node.js (version 23.11.0 ou supérieure)
- Docker et Docker Compose
- Un compte Airtable avec une base de données configurée

## 🔧 Installation

1. **Cloner le repository**
```bash
git clone <votre-repo-url>
cd 5IW1-Airtable
```

2. **Créer le fichier `.env` à la racine du projet**
```env
AIRTABLE_API_KEY=votre_api_key
AIRTABLE_BASE_ID=votre_base_id
JWT_SECRET=votre_secret_jwt
FRONTEND_URL=http://localhost:2000
PORT=3000
```

3. **Lancer avec Docker Compose**
```bash
docker-compose up
```

Le projet sera accessible sur :
- Frontend : http://localhost:2000
- Backend : http://localhost:3000

## 📁 Structure du projet

```
5IW1-Airtable/
├── front/                 # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── contexts/       # Contextes React
│   │   ├── services/      # Services API et hooks
│   │   └── schemas/       # Schémas de validation Zod
│   └── vite.config.js
├── back/                 # API Express
│   ├── src/
│   │   ├── authentification/  # Login, Register, VerifyToken
│   │   ├── bdd/CRUD/          # Opérations CRUD Airtable
│   │   ├── middleware/         # Middlewares (auth, validation, errors)
│   │   ├── schemas/            # Validation Zod backend
│   │   └── utils/              # Utilitaires
│   └── server.js
├── docker-compose.yml
└── .env
```

## 🗄️ Base de données Airtable

### Tables requises

1. **Users** (Utilisateurs)
   - `email` (Email)
   - `password` (Single line text)
   - `first_name` (Single line text)
   - `last_name` (Single line text)
   - `phone` (Phone number) - optionnel
   - `address` (Single line text) - optionnel
   - `formation_interest` (Single line text) - optionnel
   - `is_admin` (Checkbox)

2. **Projets** (Projets)
   - `name` (Single line text)
   - `created_by` (Single line text)
   - `description` (Long text)
   - `project_link` (URL) - optionnel
   - `image` (Attachment)
   - `category` (Link to Categories)
   - `technologies` (Link to Technologies - multiple)
   - `likes` (Link to Users - multiple)
   - `comments` (Link to Commentaires - multiple)
   - `publishing_status` (Single select: "publié", "caché")
   - `creation_date` (Date - automatique)

3. **Categories** (Catégories)
   - `category_name` (Single line text)
   - `description` (Long text)

4. **Technologies** (Technologies)
   - `name` (Single line text)

5. **Commentaires** (Commentaires)
   - `comment` (Long text)
   - `project` (Link to Projets)
   - `user` (Link to Users)
   - `creation_date` (Date - automatique)

### Accès à la base Airtable

[Lien de partage Airtable en lecture seule]

## 👥 Membres du groupe

- [SAIDOU, OMER, FAEZ, JOHNNY]

## 🔐 Compte administrateur

Pour créer un compte administrateur :
1. Créer un utilisateur via l'interface d'inscription
2. Dans Airtable, cocher la case `is_admin` pour cet utilisateur

## ✨ Fonctionnalités

### Pour les visiteurs (non connectés)
- ✅ Voir la liste des projets publiés
- ✅ Voir le détail d'un projet
- ✅ Rechercher des projets par mots-clés
- ✅ Filtrer par technologie
- ✅ Trier (populaires, nouveaux, anciens)

### Pour les utilisateurs connectés
- ✅ Créer un compte avec coordonnées
- ✅ Se connecter / Déconnecter
- ✅ Liker des projets
- ✅ Commenter des projets
- ✅ Modifier son profil
- ✅ Supprimer son compte

### Pour les administrateurs
- ✅ Gérer les projets (CRUD)
- ✅ Publier/Cacher des projets
- ✅ Gérer les catégories (CRUD)
- ✅ Gérer les technologies (CRUD)
- ✅ Voir tous les étudiants avec leurs coordonnées
- ✅ Promouvoir/Rétrograder des utilisateurs
- ✅ Supprimer des utilisateurs
- ✅ Modérer les commentaires

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ Validation des formulaires avec Zod (frontend + backend)
- ✅ Authentification JWT
- ✅ Protection des routes (ProtectedRoute, AdminRoute)
- ✅ Sanitization des entrées utilisateur
- ✅ Gestion centralisée des erreurs
- ✅ Pages 403 (Forbidden) et 404 (Not Found)

## 📝 Notes

- L'interface administrateur principale est Airtable
- Le portfolio permet la consultation publique des projets
- Les visiteurs peuvent laisser leurs coordonnées pour être contactés par le service admissions
