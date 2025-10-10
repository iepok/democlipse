# Democlipse

Multiplayer party game dashboard (Mafia/Werewolf style) with Next.js, PostgreSQL, and NextAuth.

## Tech Stack

Next.js 15, React, Tailwind CSS, PostgreSQL (AWS RDS), NextAuth (Google OAuth), Terraform

## Features

- Two game variants: Standard (3-8 players) and Apocalypse (3 players)
- Google authentication
- Real-time game state via polling
- Infrastructure as code with Terraform

## Setup

Install dependencies:

```
npm install
```

Create `.env.local`:

```
DATABASE_URL=postgresql://user:password@host:5432/democlipse
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

Deploy infrastructure:

```
cd terraform
terraform init
terraform apply
```

Run schema and start:

```
psql $DATABASE_URL < schema.sql
npm run dev
```

## Status

Backend complete. Building frontend.