# NutriPlan

Personalized nutrition, meal planning and a care team in one app. This is the working prototype: a static web app (HTML, CSS and JavaScript modules) with a small built-in dev server. No frameworks, no build tools, no dependencies to install.

## Quick start

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm i
npm start
```

Your browser opens at **http://localhost:5173**. Edit any file and the page reloads on save.

| URL | What's there |
|---|---|
| http://localhost:5173/ | The app |
| http://localhost:5173/docs/ | UML diagrams (use cases, components, data model, sequences, states, deployment) |

If port 5173 is busy, the server picks the next free one and prints it.

## Scripts

| Command | What it does |
|---|---|
| `npm start` (or `npm run dev`) | Dev server with live reload; opens the browser |
| `npm run start:phone` | Same, plus a link for your phone on the same Wi-Fi (great for testing the mobile layout) |
| `npm run build` | Copies the app into `dist/`, ready to host |
| `npm run preview` | Serves `dist/` to check the build |
| `npm run uml` | Re-renders the UML diagrams after you edit a `docs/uml/*.mmd` file (first run downloads the Mermaid CLI) |

Options for the server: `PORT=3000 npm start` or `npm start -- --no-open`.

## Get a real link

1. `npm run build`
2. Go to https://app.netlify.com/drop, sign in, and drag the `dist` folder onto the page.
3. Netlify gives you a public link like `your-name.netlify.app`. Rename it in Site settings, or add a custom domain such as `demo.wellcookbook.com`.

`dist/` also works on GitHub Pages or any static host.

## Put it on GitHub

**Upload the project (VS Code):**
1. Open this folder in VS Code and click the **Source Control** icon in the left bar.
2. Click **Publish to GitHub**, sign in when asked, and choose a **public** repository named `nutriplan`.

**Turn on the website (one time):**
1. On GitHub, open the repo › **Settings** › **Pages**.
2. Under **Source**, choose **GitHub Actions**.
3. Go to the **Actions** tab and wait for "Deploy to GitHub Pages" to turn green (about a minute). If it ran before you changed the setting, click it and choose **Re-run all jobs**.

Your app is then live at `https://YOUR-USERNAME.github.io/nutriplan/`, and the diagrams at `/nutriplan/docs/`. Every time you push to `main`, the site updates by itself (`.github/workflows/deploy.yml`).

**Working as a team:** add your teammates under Settings › Collaborators. Each person clones the repo, runs `npm i` and `npm start`, and pushes changes from VS Code's Source Control panel.

## Project structure

```
nutriplan/
├── index.html            Page shell: screens container, tab bar, chat panel, pop-up panel
├── favicon.svg           Leaf logo
├── css/styles.css        All styles (dark theme, layout, cards, charts)
├── js/data.js            Content: cuisines, goals, 35 recipes, photo credits, care-team examples (ES module)
├── js/app.js             App: state, screens, planner, shopping list, care team, Smart Chef (imports data.js)
├── photos/               35 recipe photos (Wikimedia Commons, free licenses)
├── docs/
│   ├── index.html        UML diagram viewer (served at /docs/)
│   ├── ARCHITECTURE.md   The same diagrams as Mermaid, with explanations
│   ├── mermaid.config.json  Diagram theme
│   └── uml/              Diagram sources (.mmd) and rendered images (.svg)
├── server.js             Dev server: static files, live reload, port fallback, phone mode
├── scripts/build.js      Builds dist/
├── scripts/uml.js        Renders the diagrams
├── .github/workflows/    Auto-deploy to GitHub Pages
├── CREDITS.md            Photographer and license for every photo
├── ISSUES.md             Known issues and next steps
└── package.json
```

The app uses `<script type="module">`, so open it through `npm start` rather than double-clicking `index.html`.

## Features

- **Home:** greeting, Magic Chef Studio (find recipes from ingredients you have), calorie ring with protein, carbs and fat bars, today's meals, care team preview, recommendations, cuisines
- **Recipes:** 35 recipes from Chinese, Greek, Italian, Japanese, Mexican, Middle Eastern and other kitchens, sorted A to Z with letter jump buttons; filter by cuisine, meal and goals; search
- **Planner:** 7-day week with breakfast, lunch, dinner and snack; Auto-Fill Week; mark meals eaten; daily goal status
- **Shop:** shopping list built from the week's plan, ingredients combined and grouped by aisle, tick off and copy
- **Care Team:** messages, workout program and daily habits, weekly check-ins with a weight chart, session booking, per-provider sharing controls, provider directory
- **Profile:** daily calorie goal, 11 target goals, photo credits, reset demo data
- **Smart Chef:** chat button that searches recipes by cuisine, meal, ingredient or words like "quick" and "high protein"

## Architecture

Full diagrams: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), or http://localhost:5173/docs/ while the server runs.

| Layer | What's in it |
|---|---|
| Screens | Home, Recipes, Planner, Shop, Care Team, Profile, Smart Chef chat, recipe pop-up |
| App logic | Recommendations, Auto-fill, Ingredient matcher, Shopping list builder, Macro targets, Messaging and check-ins |
| Data | Recipe library, goals and profile, meal plan, care team data, photos |

**Data flow:** goals → recommended recipes → meal plan → shopping list. The plan and check-ins can be shared with the care team, only for the items the user ticks in Sharing.

**Key pieces in `js/app.js`:**

| Function / object | Job |
|---|---|
| `S` / `save()` / `defaults()` | All app state, saved to `localStorage` under `nutriplan-v2` |
| `VIEWS.today`, `.recipes`, `.planner`, `.shop`, `.care`, `.profile` | Build each screen's HTML |
| `render()` / `show()` / `go()` | Draw the current screen; tabs use the URL hash (`#planner`, `#care`…) |
| `ACT` | Every button action, wired through `data-act="…"` attributes |
| `recs()` | Recommended recipes that match the user's goals, mixed across cuisines |
| `autofill()` | Fills empty meal slots from today to Sunday, no repeats in a day |
| `studio()` | Magic Chef Studio ingredient matching |
| `shopList()` | Combines the week's ingredients and groups them by aisle |
| `targets()` | Protein / carbs / fat targets from the calorie goal (25% / 45% / 30%) |
| `chatReply()` | Smart Chef keyword search |
| `CARE.*` | Care Team tabs: messages, program, check-ins, sessions, sharing, find |

## Add a recipe

In `js/data.js`, add a line to `RECIPES`:

```js
R("id","Recipe Name","Cuisine","meal",minutes,kcal,[protein,carbs,fat],"goal goal",
  "qty|ingredient|Aisle;qty|ingredient|Aisle",
  ["Step one.","Step two."],
  ["#color1","#color2","#color3"])
```

- `meal`: `breakfast`, `lunch`, `dinner` or `snack`
- `Cuisine`: one of the keys in `CUI` (add a key with a color to create a new cuisine)
- goals: `heart lowgi protein antiinf bone cognitive immune weight energy family growth`
- Aisles: `Produce`, `Meat & Fish`, `Dairy & Eggs`, `Bakery`, `Pantry`, `Spices`, `Frozen`
- The three colors draw the illustrated plate shown when there's no photo
- To add a photo, put `id.jpg` in `photos/` and add an entry to `PHOTOS` with its credit

Recipes are sorted A to Z automatically. Nutrition values are approximate, per serving.

## Production plan

| Area | Prototype now | Production |
|---|---|---|
| Front end | HTML, CSS, JavaScript web app | Mobile app for iOS and Android, plus web |
| Data | Saved in the browser | Cloud database with user accounts |
| Sign-in | One demo user | Email and Google sign-in |
| Smart Chef | Keyword recipe search | AI assistant, including fridge photos |
| Nutrition | Approximate values | Verified nutrition database |
| Care Team | Example providers | Real-time chat, scheduling, provider portal |
| Privacy | Data stays on the device | Encryption, consent, health-privacy rules |

See [ISSUES.md](ISSUES.md) for the issue list and [CREDITS.md](CREDITS.md) for photo credits.
