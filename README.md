# Dynamic-Kanban-Board
A lightweight, modular Dynamic Kanban Board built with Core JavaScript. Supports task creation, drag-and-drop across columns, and persistence using localStorage.
🚀 Features

Create Tasks: Add tasks with a title & description.

Three Columns: To Do, In Progress, Done.

Drag & Drop: Move tasks between columns easily.

Persistence: Tasks remain saved after page reload (localStorage).

Modular Codebase:

storage.js → handles saving/loading tasks

dragdrop.js → drag & drop logic

dom.js → rendering helpers

util.js → reusable utilities

app.js → orchestrates everything

📂 Project Structure
dynamic-kanban/
│── index.html        # Entry point
│── styles.css        # Styling
│── package.json      # Dependencies & scripts
│── js/
│    ├── app.js       # Main app logic
│    ├── dom.js       # DOM rendering
│    ├── dragdrop.js  # Drag & drop module
│    ├── storage.js   # LocalStorage wrapper
│    └── util.js      # Reusable utilities

⚡ Getting Started
1. Clone the repo
git clone https://github.com/<your-username>/dynamic-kanban.git
cd dynamic-kanban

2. Install dependencies
npm install

3. Run locally
npm start


Open http://localhost:8000
 in your browser.

🛠 Tech Stack

HTML5 / CSS3

Vanilla JavaScript (ES Modules)

localStorage API

http-server (npm)

👉 Clean, modular, and scalable — ready for extension (e.g., user auth, multiple boards, APIs).
