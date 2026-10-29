# NutriPlan issue list

Tick items off as they're fixed (`- [x]`).

## Known issues

- [ ] **No real accounts or database.** Everything is saved in each person's browser (`localStorage`), so nothing syncs between people or devices.
- [ ] **Smart Chef isn't AI yet.** It searches recipes by keyword (`chatReply()` in `js/app.js`).
- [ ] **Care Team is example data.** Providers, messages and auto-replies are made up (`TEAM`, `DIRECTORY`, `AUTO` in `js/data.js`).
- [ ] **Nutrition numbers are approximate.** Not checked against a verified nutrition database.
- [ ] **Some photos are close matches, not the exact dish:** yogurt bowl, fasolada, salmon teriyaki, cold soba salad, baigan chokha.
- [ ] **Sign Out does nothing.** It only shows a message (`ACT.signout`).
- [ ] **No custom domain yet.** Run `npm run build` and host `dist/` (Netlify Drop, GitHub Pages, or wellcookbook.com).
- [ ] **Fonts need internet.** Offline, headings fall back to basic system fonts. Fix: bundle the font files in the project.
- [ ] **Magic Chef Camera and Gallery.** Replaced with Fridge Staples and Surprise Me; real photo-to-ingredients needs the AI step.

## Next steps

- [ ] Interview 5+ users and 2 providers to test the problem and pricing
- [ ] Add sign-in and a cloud database
- [ ] Connect a verified nutrition data source
- [ ] Replace keyword Smart Chef with an AI assistant
- [ ] Pilot the Care Team with one dietitian and their clients
- [ ] Host the app at a real link
