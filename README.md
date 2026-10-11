# Glossix 0.2.56

Application source, assets, licence notices and Windows build workflows. Preview pages, statistics dashboards, review archives and database deployment files are excluded. Existing database setup is managed separately.

Use Node.js 22. Run `npm ci`, `npm run build:translations`, then `npm run dist:win`. On GitHub, run Build Glossix Windows installer. The workflow scans the build and attaches files to a draft release for review.

When replacing an existing Git checkout, retain its `.git` directory. Copy all contents of this folder, including `.github` and `.gitignore`, into the checkout root. Keep local secrets and data outside the replacement. Review changes in GitHub Desktop before committing.
