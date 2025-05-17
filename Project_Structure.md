# Space Mission Control

**Space Mission Control** est une plateforme microservices cloud-native pour la gestion complète de missions spatiales : planification, exécution, suivi et analyse en temps réel.

---

## Table des matières

1. [Description](#description)  
2. [Technologies utilisées](#technologies-utilisées)  
3. [Architecture haute-niveau](#architecture-haute-niveau)  
4. [Services back-end](#services-back-end)  
5. [Front-end](#front-end)  
6. [Communication inter-services](#communication-inter-services)  
7. [Télémétrie & visualisation](#télémétrie--visualisation)  
8. [Déploiement — Docker Compose](#déploiement--docker-compose)  
9. [Démarrage en dev](#démarrage-en-dev)  

---

## Description

Cette plateforme permet de :

- Gérer **les entreprises** (organisations spatiales)  
- Créer, modifier et clôturer **les missions** (cycle de vie complet)  
- Assigner des **opérateurs** (rôles `ADMIN`/`VIEWER`)  
- Traiter et visualiser **les vaisseaux** grâce à la télémétrie (2D & 3D)  
- Sécuriser l’accès via **JWT/OAuth2** et une **API Gateway**

Le back-end est développé en **Spring Boot / Spring Cloud**, exposé via **Spring Cloud Gateway**, et communique par **OpenFeign**, **Kafka** et **WebSockets**.  
Le front-end, en **Next.js 15** + **React 19**, offre un dashboard riche avec **Three.js**, **React Three Fiber**, **Nivo** et **Recharts**.

---

## Technologies utilisées

| Couche                        | Stack                                                                 |
|-------------------------------|-----------------------------------------------------------------------|
| **Back-end**                  | Java 17, Spring Boot 3, Spring Cloud 2024.x, Spring Security, JWT     |
| **API Gateway**               | Spring Cloud Gateway                                                  |
| **Inter-service & événements**| Spring Cloud OpenFeign, Kafka                                        |
| **Front-end**                 | Next.js 15, React 19, TypeScript, Tailwind v4                         |
| **Visualisation**             | Three.js, React Three Fiber, Nivo, Recharts                           |
| **Temps réel**                | WebSockets                                                            |
| **Conteneurs**                | Docker                                                               |
| **Orchestration locale**      | Docker Compose v2                                                     |

---

## Architecture haute-niveau

```text
┌───────────┐   HTTPS    ┌──────────────────┐   REST / WS   ┌─────────────────┐
│ Navigateur│◀──────────▶│ API Gateway      │◀────────────▶│ Micro-services  │
│  (UI 3D)  │            │ (Spring + JWT)   │              │ (Auth, Mission…)│
└───────────┘            └──────────────────┘              └─────────────────┘
```

Chaque micro-service est dockerisé et relié via Docker Compose, avec un broker Kafka et une base PostgreSQL.

---

## Services back-end

| Port | Service                    | Description                                           |
|-----:|----------------------------|-------------------------------------------------------|
| 8081 | **auth-service**           | CRUD opérateurs, login/OAuth2, JWT                    |
| 8082 | **enterprise-service**     | CRUD entreprises + endpoints agrégés (Feign)          |
| 8083 | **mission-service**        | CRUD missions, assignations, logs d’activité (Kafka)  |
| 8084 | **spacecraft-service**     | CRUD vaisseaux, ingestion télémétrie brute            |
| 8085 | **telemetry-service**      | Traitement Kafka-Streams & WebSocket server           |
| 8080 | **gateway**                | Spring Cloud Gateway (routage + auth)                 |
| 3000 | **frontend**               | Next.js dashboard                                     |
| 9092 | **kafka**                  | Broker d’événements                                   |
| 5432 | **postgres** (5 bases)     | Stockage relationnel (un schema par service)          |

Tous ces composants sont décrits et configurés dans le fichier `docker-compose.yaml` à la racine.

---

## Front-end

- **Next.js** (SSR / SSG) & **React Hooks**  
- **State & cache** : TanStack React Query v5  
- **Styling** : TailwindCSS v4, Radix UI  
- **Auth** : NextAuth.js + JWT  
- **Visualisations** :  
  - **2D** : Nivo, Recharts  
  - **3D** : Three.js + React Three Fiber (`@react-three/drei`)  
- **Realtime** : `useWebSocket` & `useTelemetry`  

---

## Communication inter-services

1. **Feign clients**  
   - Intercepteur pour propager le JWT au header `Authorization`  
2. **ErrorDecoder** Feign  
   - Journalise et remonte les erreurs HTTP  
3. **WebSockets**  
   - Endpoint : `ws://localhost:8080/telemetry/live`

---

## Télémétrie & visualisation

```text
Spacecraft → Kafka `telemetry.raw`
                ↓
      Telemetry Service (Streams) → PostgreSQL (historique)
                ↓
   WebSocket Server → Front-end (Three.js / Recharts)
```

- Les données brutes sont enrichies, stockées, puis diffusées en temps réel au client via WebSocket.

---

## Déploiement — Docker Compose

> **Lancez l’intégralité de la plateforme en une commande** :

```bash

# Construction des images + démarrage des conteneurs
docker compose up --build -d
```

- Le fichier `docker-compose.yaml` définit tous les services, la base PostgreSQL et le broker Kafka.  
- **Dashboard** accessible sur <http://localhost:3000>.  
- Pour consulter les logs :
  ```bash
  docker compose logs -f mission-service
  ```
- Pour tout arrêter et nettoyer :
  ```bash
  docker compose down -v
  ```

---

## Démarrage en dev

### Back-end avec hot-reload
```bash
cd auth-service && ./mvnw spring-boot:run
cd enterprise-service && ./mvnw spring-boot:run
# etc.
```

### Front-end en mode dev
```bash
cd frontend
npm install
npm run dev   # → http://localhost:3000
```

Les services non lancés localement sont automatiquement résolus via le stack Docker Compose.

---

