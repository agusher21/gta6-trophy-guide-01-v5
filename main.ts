// Leonida Trophy Ledger — GTA VI trophy guide & tracker (Node 22, stdlib only).
// This program hands the entry in: it copies the guide's own app/ and
// screenshots/ folders into the output directory and writes dossier.json
// with the vendored make.fun library, exactly as the scorer rebuilds it.
// Run it outside the grader with MAKEFUN_OUTPUT_DIR set, e.g.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The guide itself is plain static files: app/index.html opens in desktop
// Chrome and works offline, and app/data/trophies.json holds all 55
// official PlayStation 5 trophies with an own-words guide each.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
}

// The caps below mirror the scorer's own limits: at most 4 screenshots,
// each at most 256 KiB, app/ at most 993 files and 48 MiB in all.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Leonida Trophy Ledger: dossier written (${dossier.length} bytes) to ${outputDir}`);
