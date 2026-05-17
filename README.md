# dailyboard

Tablero de gestión de dailys para equipos de desarrollo. Las tareas viven en el board hasta que se resuelven y se deployan.

## Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL
- **IA**: Anthropic Claude (extracción automática de tareas)
- **Deploy**: Render

## Setup local

### 1. Base de datos

Crear una base de datos PostgreSQL (local o en Render) y copiar la connection string.

### 2. Backend

```bash
cd server
cp .env.example .env
# Editar .env con tu DATABASE_URL y ANTHROPIC_API_KEY
npm install
npm run dev
```

El servidor corre en `http://localhost:3000`.

### 3. Frontend

```bash
cd client
cp .env.example .env
# Editar .env si el backend no está en localhost:3000
npm install
npm run dev
```

La app corre en `http://localhost:5173`.

## Deploy en Render

### Base de datos
1. Crear un **PostgreSQL** en Render
2. Copiar la **Internal Database URL**

### Backend (Web Service)
- **Root directory**: `server`
- **Build command**: `npm install`
- **Start command**: `node server.js`
- **Variables de entorno**:
  - `DATABASE_URL` → Internal Database URL de Render
  - `ANTHROPIC_API_KEY` → tu API key de Anthropic
  - `CLIENT_URL` → URL del frontend en Render

### Frontend (Static Site)
- **Root directory**: `client`
- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist`
- **Variables de entorno**:
  - `VITE_API_URL` → URL del backend en Render

## Estructura

```
├── client/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.jsx
│   │   │   ├── MemberRow.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── AIImport.jsx
│   │   │   ├── AIPreview.jsx
│   │   │   ├── Team.jsx
│   │   │   └── BlockerModal.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/          # Node + Express
│   ├── routes/
│   │   ├── members.js
│   │   ├── tasks.js
│   │   └── ai.js
│   ├── db.js
│   ├── init.sql
│   └── server.js
└── README.md
```
