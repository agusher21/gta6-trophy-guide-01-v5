# Leonida Trophy Ledger — GTA VI Trophy Guide & Tracker

![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/agusher21/gta6-trophy-guide-01-v5/rank.svg)
![reward](https://make.fun/badge/agusher21/gta6-trophy-guide-01-v5/reward.svg)

The offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every official name, description and grade, an own-words guide with steps and cited sources for each trophy, a 7-stage roadmap to the platinum, missable flags, kind and grade filters, a spoiler setting that hides story trophies until earned, and a checklist saved in the browser with export and import.

Enter the bounty: https://make.fun/bounty/gta6-trophy-guide-01

## How it works

Open `app/index.html` in desktop Chrome. It works offline and loads nothing over the network. Click a trophy to read its guide, tick trophies as you earn them, and use the YOUR COUNT stepper to check the next trophy in roadmap order. The GOAL bar tracks progress to the platinum.

## Roadmap to the platinum

1. **S1 · Arrival** — the opening mission, Chapter 1, and the one missable meditation
2. **S2 · First Scores** — Chapter 2 and the story missions that open the map
3. **S3 · Vice City** — Chapter 3, the shooting range, races and drone races
4. **S4 · The Crew** — Chapter 4 and the contact mission strands
5. **S5 · Side Stories** — stranger strands and the secret one-off feats
6. **S6 · The Grind** — 100% completion, stunts, collectibles and the economy trophies
7. **S7 · Heists & Platinum** — the final mission, then the platinum

One trophy can be missed: **Positive Mental Attitude**. Do the Chapter 1 balcony meditation with Lucia after the mission Down to Earth, before Chapter 1 ends.

## Files

- `app/index.html` — the guide's page: checklist, guide, sources and roadmap
- `app/app.js` — checklist, filters, spoiler setting, export/import, stepper
- `app/style.css` — the dark-navy ledger look
- `app/data/trophies.json` — all 55 official trophies with guides, steps, sources, kind, roadmap stage, missable and hidden flags
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` and writes `dossier.json`
