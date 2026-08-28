# Bookmark Merge Map — visual thesis

## Direction: topographic reconciliation

Bookmark exports are treated as two surveyed landscapes, not as piles of browser data. Thin contour lines, coordinate ticks, route marks, and a bright “safe path” make comparison feel careful and reversible. The interface is intentionally closer to a field map and a survey notebook than to a generic SaaS dashboard: generous paper-colored space, irregular contour texture, squared data readouts, and a single vermilion survey marker for actions.

The product uses one deliberate light treatment. The warm map-paper canvas is painted explicitly; browser/UI chrome uses the same color so the app still feels composed when installed. A dark theme is not used because paper, graphite, and high-visibility trail markings are the core identity, and the merge tables need the stable legibility of a printed proof sheet.

## Tokens

- `paper` `#F4F0E6`: the surveyed field sheet and page background.
- `paper-raised` `#FFFCF5`: inputs, drawers, and focused work surfaces.
- `ink` `#17211D`: primary type, 13.7:1 on paper.
- `ink-muted` `#54625B`: secondary type, 5.7:1 on paper.
- `contour` `#A8B4A2`: quiet rules and contour lines.
- `forest` `#174C3C`: primary controls, selected routes, 8.0:1 with white.
- `vermilion` `#A83B2C`: survey pins and warning emphasis; 5.4:1 on paper and paired with labels/icons, never color alone.
- `moss` `#DCE5D5`: confirmed/shared areas.
- `ochre` `#F1D58D`: review/choice areas.
- `danger` `#8B3027`: errors and destructive state.

## Type and spacing

- Display/labels: `Arial Narrow`, `Aptos Narrow`, system sans-serif; condensed like marginal map labels. No font downloads.
- Body/data: `Inter`, `Aptos`, `Segoe UI`, system sans-serif. URL and count readouts use the system monospace stack with tabular numerals.
- Scale: 0.75rem annotation, 0.875rem metadata, 1rem body, 1.25rem section lead, clamp(2.25rem–4.5rem) display.
- 4/8px base rhythm. Major intervals are 16, 24, 32, 48, 64, and 96px. Text measure caps at 70 characters.

## Interaction grammar

- The flow is a four-leg survey route: Import → Compare → Review → Export. The route bar always tells the user where they are.
- Imported files become labeled map sheets. Results are a field ledger, filtered by shared, one-sided, and URL-conflict “terrain.”
- Choices are explicit checkboxes; the source path remains visible. Removing a link is reversible until export. Original files are never modified.
- Controls depress by 1px; focus is a 3px ochre/forest double ring. Touch targets are at least 44px.

## Motion policy

State changes use 180–240ms opacity and short vertical translations, like laying one transparent map sheet over another. The route marker advances once per completed step. No looping motion. Under `prefers-reduced-motion`, transforms and smooth scrolling are removed and updates are instant.

## Asset plan and provenance

- Hero: original generated aerial paper-relief landscape showing two green contour systems converging into one vermilion route, used as an explanatory backdrop—not as evidence of a feature.
- UI marks, logo, pins, compass, and contour texture: hand-authored CSS/SVG by the factory worker, 2026-08-28, released with the app under MIT.
- Generated-image disclosure appears in the footer.

### Prompt sheet

Subject: an abstract topographic paper map where two separately surveyed trail networks converge safely into a single coherent route. World: archival field cartography, no real place. Materials: embossed recycled paper, graphite contour ink, tiny punched registration holes, a single painted vermilion trail, forest-green elevation bands. Light: soft raking daylight from upper left. Lens: straight overhead, flat lay. Palette words: warm map paper, deep forest ink, muted sage, vermilion survey paint, small ochre markers. Negative list: no words, no labels, no letters, no numbers, no logos, no watermark, no UI, no people, no recognizable country, no neon, no glossy 3D plastic, no generic gradient.

Generation: Azure AI Foundry `factory-image` through `/opt/fleet/lib/gen-image.sh`, 2026-08-28. Generated assets are original to this product. Production derivatives are optimized locally to WebP/AVIF.
