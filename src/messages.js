// ─── Skill Web Tracker — UI strings (en + uk) ────────────────────────────────

export const MESSAGES_EN = {
  // ── Header ─────────────────────────────────────────────────────────────────
  "app.subtitle": "tracker",
  "app.toggleTheme": "Toggle dark / light",
  "app.randomizeTame": "Randomize (tame · 20% freedom)",
  "app.randomize": "Randomize (balanced · 50% · R)",
  "app.randomizeChaos": "Randomize (chaos · 100% freedom)",
  "app.openSettings": "Open settings",

  // ── Window titles ──────────────────────────────────────────────────────────
  "window.canvas": "Canvas",
  "window.roles": "Roles",
  "window.progression": "Progression",
  "window.settings": "Settings",
  "window.stats": "Stats",
  "window.history": "History",
  "window.techniques": "Techniques",

  // ── Roles panel ────────────────────────────────────────────────────────────
  "roles.title": "Roles",
  "roles.add.placeholder": "New role...",
  "roles.add.title": "Add role",
  "roles.save": "Save",
  "roles.load": "Load",
  "roles.reset": "Reset All",
  "roles.reset.confirm":
    "Reset everything to defaults?\n\nThis will clear all roles, points, and connections.",

  // ── Role item ──────────────────────────────────────────────────────────────
  "role.level": "Lv.{n}",
  "role.open": "Open role card",
  "role.edit": "Edit role",
  "role.delete": "Delete role",
  "role.color.randomize": "Randomize color",
  "role.summary.placeholder": "Summary...",

  // ── Role card modal ────────────────────────────────────────────────────────
  "roleCard.summary": "Summary",
  "roleCard.techniques": "Techniques",
  "roleCard.origins": "Comes from",
  "roleCard.paths": "Evolves into",
  "roleCard.complexity": "Depth {n}/5",
  "roleCard.addTechnique": "Add technique...",
  "roleCard.addRole": "Add role...",

  // ── Techniques window ──────────────────────────────────────────────────────
  "techniques.title": "Techniques",
  "techniques.search": "Search techniques...",
  "techniques.empty": "No techniques found.",
  "techniques.new": "New technique",
  "techniques.add": "Add",
  "techniques.edit": "Edit technique",
  "techniques.delete": "Delete technique",
  "techniques.name.placeholder": "Technique name...",
  "techniques.description.placeholder": "What is this technique and how is it applied?",

  // ── Common actions ─────────────────────────────────────────────────────────
  "common.save": "Save",
  "common.cancel": "Cancel",

  // ── Canvas overlays ────────────────────────────────────────────────────────
  "canvas.active.label": "Active:",
  "canvas.timer.start": "Start",
  "canvas.timer.stop": "Stop",
  "canvas.timer.toggle": "Toggle timer (Enter)",
  "canvas.zoom.reset": "Reset zoom (100%)",
  "canvas.zoom.fit": "Fit all content in view",
  "canvas.shortcuts.button": "Keyboard shortcuts (?)",
  "canvas.undo": "Undo (Ctrl+Z)",
  "canvas.redo": "Redo (Ctrl+Shift+Z)",
  "canvas.help.title": "Keyboard shortcuts",
  "canvas.note.placeholder": "Note… (Enter to save, Esc to skip)",

  // ── Keyboard shortcuts table ───────────────────────────────────────────────
  "shortcut.enter": "Toggle timer",
  "shortcut.ctrlZ": "Undo",
  "shortcut.ctrlShiftZ": "Redo",
  "shortcut.ctrlS": "Save to file",
  "shortcut.ctrlO": "Open file",
  "shortcut.zoomIn": "Zoom in",
  "shortcut.zoomOut": "Zoom out",
  "shortcut.pinch": "Zoom",

  // ── Progression panel ──────────────────────────────────────────────────────
  "progression.title": "Progression",
  "progression.milestone": "Milestone: {n}",

  // ── Stats window ───────────────────────────────────────────────────────────
  "stats.title": "Stats",
  "stats.role": "Role",
  "stats.empty": "No activity recorded yet.",

  // ── History window ─────────────────────────────────────────────────────────
  "history.title": "History",
  "history.today": "Today",
  "history.yesterday": "Yesterday",
  "history.empty": "No activity recorded yet.",

  // ── Settings window ────────────────────────────────────────────────────────
  "settings.canvas.section": "Canvas",
  "settings.connectionRange": "Connection Range: {value}px",
  "settings.driftRadius": "Drift Radius: {value}",
  "settings.driftSpeed": "Drift Speed: {value}x",
  "settings.maxConnections": "Max Connections: {value}",
  "settings.durationScale": "Duration Scale: {value}",
  "settings.durationScale.off": "Duration Scale: off",
  "settings.timer.default": "Timer active by default",
  "settings.clusterLabels": "Show cluster labels",
  "settings.noteLabels": "Show notes on canvas",
  "settings.breathingStrength": "Breathing: {value}x",
  "settings.breathingStrength.off": "Breathing: off",

  // ── Theme presets ──────────────────────────────────────────────────────────
  "theme.dark": "Dark",
  "theme.light": "Light",
};

export const MESSAGES_UK = {
  // ── Header ─────────────────────────────────────────────────────────────────
  "app.subtitle": "трекер",
  "app.toggleTheme": "Перемкнути темну / світлу",
  "app.randomizeTame": "Рандомізувати (м'яко · 20% свободи)",
  "app.randomize": "Рандомізувати (збалансовано · 50% · R)",
  "app.randomizeChaos": "Рандомізувати (хаос · 100% свободи)",
  "app.openSettings": "Відкрити налаштування",

  // ── Window titles ──────────────────────────────────────────────────────────
  "window.canvas": "Полотно",
  "window.roles": "Ролі",
  "window.progression": "Прогрес",
  "window.settings": "Налаштування",
  "window.stats": "Статистика",
  "window.history": "Історія",
  "window.techniques": "Техніки",

  // ── Roles panel ────────────────────────────────────────────────────────────
  "roles.title": "Ролі",
  "roles.add.placeholder": "Нова роль...",
  "roles.add.title": "Додати роль",
  "roles.save": "Зберегти",
  "roles.load": "Завантажити",
  "roles.reset": "Скинути все",
  "roles.reset.confirm":
    "Скинути все до початкових?\n\nЦе видалить усі ролі, точки та зв'язки.",

  // ── Role item ──────────────────────────────────────────────────────────────
  "role.level": "Рів.{n}",
  "role.open": "Відкрити картку ролі",
  "role.edit": "Редагувати роль",
  "role.delete": "Видалити роль",
  "role.color.randomize": "Випадковий колір",
  "role.summary.placeholder": "Короткий опис...",

  // ── Role card modal ────────────────────────────────────────────────────────
  "roleCard.summary": "Опис",
  "roleCard.techniques": "Техніки",
  "roleCard.origins": "Базується на",
  "roleCard.paths": "Розвивається в",
  "roleCard.complexity": "Рівень {n}/5",
  "roleCard.addTechnique": "Додати техніку...",
  "roleCard.addRole": "Додати роль...",

  // ── Techniques window ──────────────────────────────────────────────────────
  "techniques.title": "Техніки",
  "techniques.search": "Пошук технік...",
  "techniques.empty": "Нічого не знайдено.",
  "techniques.new": "Нова техніка",
  "techniques.add": "Додати",
  "techniques.edit": "Редагувати техніку",
  "techniques.delete": "Видалити техніку",
  "techniques.name.placeholder": "Назва техніки...",
  "techniques.description.placeholder": "Що це за техніка і як вона застосовується?",

  // ── Common actions ─────────────────────────────────────────────────────────
  "common.save": "Зберегти",
  "common.cancel": "Скасувати",

  // ── Canvas overlays ────────────────────────────────────────────────────────
  "canvas.active.label": "Активна:",
  "canvas.timer.start": "Старт",
  "canvas.timer.stop": "Стоп",
  "canvas.timer.toggle": "Перемкнути таймер (Enter)",
  "canvas.zoom.reset": "Скинути масштаб (100%)",
  "canvas.zoom.fit": "Вмістити все",
  "canvas.shortcuts.button": "Клавіші (?)",
  "canvas.undo": "Відмінити (Ctrl+Z)",
  "canvas.redo": "Повторити (Ctrl+Shift+Z)",
  "canvas.help.title": "Клавіатурні скорочення",
  "canvas.note.placeholder": "Нотатка… (Enter — зберегти, Esc — пропустити)",

  // ── Keyboard shortcuts table ───────────────────────────────────────────────
  "shortcut.enter": "Перемкнути таймер",
  "shortcut.ctrlZ": "Відмінити",
  "shortcut.ctrlShiftZ": "Повторити",
  "shortcut.ctrlS": "Зберегти у файл",
  "shortcut.ctrlO": "Відкрити файл",
  "shortcut.zoomIn": "Збільшити",
  "shortcut.zoomOut": "Зменшити",
  "shortcut.pinch": "Масштаб",

  // ── Progression panel ──────────────────────────────────────────────────────
  "progression.title": "Прогрес",
  "progression.milestone": "Рубіж: {n}",

  // ── Stats window ───────────────────────────────────────────────────────────
  "stats.title": "Статистика",
  "stats.role": "Роль",
  "stats.empty": "Активності ще немає.",

  // ── History window ─────────────────────────────────────────────────────────
  "history.title": "Історія",
  "history.today": "Сьогодні",
  "history.yesterday": "Вчора",
  "history.empty": "Активності ще немає.",

  // ── Settings window ────────────────────────────────────────────────────────
  "settings.canvas.section": "Полотно",
  "settings.connectionRange": "Дальність зв'язків: {value}пкс",
  "settings.driftRadius": "Радіус дрейфу: {value}",
  "settings.driftSpeed": "Швидкість дрейфу: {value}x",
  "settings.maxConnections": "Макс. зв'язків: {value}",
  "settings.durationScale": "Масштаб тривалості: {value}",
  "settings.durationScale.off": "Масштаб тривалості: вимк.",
  "settings.timer.default": "Таймер увімкнений за замовчуванням",
  "settings.clusterLabels": "Показувати мітки кластерів",
  "settings.noteLabels": "Показувати нотатки на полотні",
  "settings.breathingStrength": "Дихання: {value}x",
  "settings.breathingStrength.off": "Дихання: вимк.",

  // ── Theme presets ──────────────────────────────────────────────────────────
  "theme.dark": "Темна",
  "theme.light": "Світла",
};
