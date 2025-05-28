# 🧠 Coup sur Coup

> Une application web (et bientôt mobile) multijoueur inspirée du jeu télévisé **Les 12 Coups de Midi**, développée par Quantiq Studio.

## 🎯 Concept

**Coup sur Coup** est un jeu de quiz multijoueur en ligne où les joueurs s’affrontent à travers plusieurs manches à thème, chacune avec ses propres mécaniques et types de questions. L'application repose sur un système de parties, de scores, et de progression, avec la possibilité d'affronter d'autres joueurs ou des bots.

## 🚀 Fonctionnalités principales

- 🔐 Connexion par email et mot de passe (Appwrite Auth)
- 🎮 Création et jointure de parties (salle d’attente dynamique)
- 🧠 Phases de jeu inspirées des 12 Coups de Midi :
    - **Phase Sélective** (`phase_selective`) : 2 choix visibles, 1 réponse masquée
    - **Duel** (`duel`) : 2 thèmes au choix, 4 propositions, 1 fausse
    - **Coup par Coup** (`liste_piegee`) : 7 propositions, 6 vraies, 1 fausse
    - **Coup Fatal** (`chrono_pression`) : série de QCM rapides, 2 choix, 1 réponse vraie, 1 fausse
    - **Coup de Maître** (`grille_indices`) : 5 questions à 3 choix, avec une réponse masquée
- 📊 Statistiques de joueurs, niveaux, scores et pièces
- 🤖 Prise en charge des **bots** pour compléter une partie
- 🧱 Architecture solide en React + TypeScript + Tailwind + Appwrite
- ⚙️ Backend personnalisé via **Appwrite Functions** :
    - Import de questions
    - Suppression des parties terminées
    - Nettoyage des utilisateurs inactifs

## 🗂️ Structure du projet
```
s📁 src/
├── 📁 components/       # Composants UI personnalisés
├── 📁 context/          # Context React : état du jeu et joueur
├── 📁 data/             # Données statiques (ex. : avatars, emojis, etc.)
├── 📁 hooks/            # Hooks personnalisés (ex. : useQuestion)
├── 📁 lib/              # Fonctions utilitaires réutilisables
├── 📁 pages/            # Pages principales de l’app (layout, accueil, profil…)
├── 📁 routes/           # Routage par type d’écran (ex. partie, lobby…)
├── App.tsx             # Composant racine
├── main.tsx            # Point d’entrée de l’app React
├── App.css / index.css # Feuilles de style globales
├── vite-env.d.ts       # Types Vite
```

### 🛠️ Et aussi à la racine du projet
```
📄 .gitignore
📄 README.md
📄 bun.lockb / package-lock.json
📄 components.json
📄 eslint.config.js
📄 index.html
📄 package.json
```

## 🧩 Base de données (Appwrite)

- `players` : Infos utilisateur, bot ou non, stats (score, coins, xp), avatar
- `games` : Partie en cours, hôte, joueurs, round, statut, question actuelle
- `questions` : Toutes les questions du jeu avec type, thème, propositions, indices
- `coin_transactions` : Historique des gains/dépenses des joueurs

## 🔐 Authentification

Gérée par Appwrite. Création automatique d’un document `players` à l’inscription.

## ⚙️ Backend Appwrite Functions

| Fonction                          | Description                                |
|----------------------------------|--------------------------------------------|
| `Import questions`               | Import en masse depuis JSON ou API         |
| `Delete games when finished`     | Cron job pour nettoyer les parties closes  |
| `Delete inactive anonymous users`| Nettoyage périodique des invités inactifs  |

## 🛠️ Stack technique

- **Frontend** : React 18 + TypeScript + Vite + TailwindCSS
- **Backend** : Appwrite DB, Auth, Functions (Node.js)
- **CI/CD** : (à venir)
- **Multijoueur** : Repos sur des documents Appwrite mis à jour en temps réel

## 📦 Installation locale

```bash
git clone https://github.com/Quantiq-Studio/CoupsurCoup.git
cd CoupsurCoup
npm install
npm run dev
