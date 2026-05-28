# Deployment

This project is a static Vite app. GitHub Pages can serve the built files directly through GitHub Actions.

## Public URLs

- GitHub repository: https://github.com/ferminfm/ideal-momentum-jet-explorer
- GitHub Pages app: https://ferminfm.github.io/ideal-momentum-jet-explorer/
- Maintainer affiliation: Fermín Franco-Medrano — Ensenada Campus, Autonomous University of Baja California / Institute of Mathematics for Industry, Kyushu University

## Local Checks

```bash
npm install
npm run test
npm run build
npm run lint
```

## Create The Public GitHub Repository

Target repository:

```text
https://github.com/ferminfm/ideal-momentum-jet-explorer
```

If GitHub CLI is authenticated:

```bash
cd /home/franco/Documents/GitHub/ideal-momentum-jet-explorer
gh auth status
gh repo create ideal-momentum-jet-explorer --public --source=. --remote=origin --push
```

If GitHub CLI is not authenticated, do not enter credentials in this project. Create the public repository manually on GitHub, then run:

```bash
cd /home/franco/Documents/GitHub/ideal-momentum-jet-explorer
git remote add origin https://github.com/ferminfm/ideal-momentum-jet-explorer.git
git branch -M main
git push -u origin main
```

## Enable GitHub Pages

After the repository exists and the workflow has been pushed:

```text
GitHub -> repository -> Settings -> Pages -> Source: GitHub Actions
```

The expected Pages URL is:

```text
https://ferminfm.github.io/ideal-momentum-jet-explorer/
```

Manual Pages path:

```text
https://github.com/ferminfm/ideal-momentum-jet-explorer/settings/pages
```

## Public-Asset Constraint

GitHub Pages is public. Keep private PDFs, unpublished manuscripts, credential files, tokens, sensitive notes, and non-public datasets out of this repository and especially out of `public/`.

## Build Configuration

`vite.config.ts` sets:

```ts
base: '/ideal-momentum-jet-explorer/'
```

This is required for project Pages rather than a user root Pages site.

Production preview:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```
