# Shopping List

A simple grocery list web app built with vanilla HTML, CSS and JavaScript. It uses [Supabase](https://supabase.com/) for user authentication and to store items in a shared table.
The database schema now uses a single **items** table that references a **lists** table via `list_id`.

## Features
- Login using Supabase credentials
- Add items with relative timestamps
- Click items to select them
- Delete selected items or clear all items with a confirmation dialog
- Responsive design with custom fonts and icons

## Running Locally
1. Clone this repository.
2. Provide your own Supabase project credentials in `user.js`.
3. Serve the files from a local web server, e.g.:
   ```bash
   npx serve .
   ```
   or
   ```bash
   python3 -m http.server
   ```
4. Open the served URL and log in using your Supabase user account.

If you are hosting under a different path adjust `SITE_SUBPATH` in `consts.js`.

## Deployment
The repository includes a GitHub Actions workflow that deploys the site to GitHub Pages from the `main` branch. It excludes the `.github` and `supabase` folders when publishing.

## Folder Structure
- `index.html` – main application
- `login.html` – login form
- `script.js`, `login.js`, `db.js`, `user.js` – application logic
- `styles.css` – base styling
- `supabase/migrations/` – SQL scripts for the database
