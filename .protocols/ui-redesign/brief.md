# UI Redesign Protocol

## Goal
Redesign the AlfaVoice client interface to match the "Flow" style requested by the user, localized to Russian.

## Requirements
1.  **Style**: Clean, minimalist, "Flow"-like aesthetic.
2.  **Layout**:
    *   Left Sidebar (Navigation)
    *   Main Content Area (Dashboard)
3.  **Components**:
    *   **Sidebar**:
        *   Logo: "AlfaVoice" + "Basic" badge.
        *   Menu Items: Главная, Словарь, Сниппеты, Стиль, Заметки.
        *   Footer: Настройки, Помощь.
    *   **Dashboard**:
        *   Header with greeting ("С возвращением, Евгений").
        *   Stats row (Daily streak, Words count, WPM).
        *   Hero Banner ("Настройте AlfaVoice под себя").
        *   Action Cards ("Вернуться к работе").
        *   History List.
4.  **Tech Stack**: SvelteKit + Tailwind CSS.

## Exclusions
*   The "Try Flow Pro" marketing section in the sidebar.