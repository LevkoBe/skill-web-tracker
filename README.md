# Skill Web Tracker

A minimal, canvas-based skill tracking tool built with **React**, **Vite**, and **Tailwind CSS**.

Visually map skills as points in a dynamic web, group them by roles, and track progression using simple milestones.

## Features

- Interactive canvas with animated nodes and connections
- Role-based skill grouping
- Progression tracking with Fibonacci milestones
- Drag to pan the canvas
- Save / load state as JSON
- Minimal UI, no backend

## Tech Stack

- React
- Vite
- Tailwind CSS
- Canvas API
- lucide-react (icons)

## Project Structure

```
src/
├─ components/        # Reusable UI components
│  └─ RoleItem.jsx
│
├─ panels/            # Main UI panels
│  ├─ RolesPanel.jsx
│  ├─ ProgressionPanel.jsx
│  ├─ SettingsPanel.jsx
│  └─ WebCanvas.jsx
│
├─ data/              # Static (initial) data
│  └─ roles.js
│
├─ SkillWebTracker.jsx # Main feature container
├─ App.jsx
├─ main.jsx
└─ index.css
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Usage

- Select a role, then click on the canvas to add skill points
- Drag the canvas to pan (double-click or MMB)
- Track progression per role in the right panel
- Save / load your progress as a `.json` file

## Notes

- All state is local (no persistence unless exported)
- Designed as an experimental / personal visualization tool
- Layout and visuals rely heavily on Tailwind utilities

## License

MIT
