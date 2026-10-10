import { defineConfig } from 'vite';

// Chemins relatifs : le site fonctionne à la racine comme sous
// https://<compte>.github.io/<dépôt>/ sans connaître le nom du dépôt.
export default defineConfig({
  base: './',
  worker: { format: 'es' },
});
