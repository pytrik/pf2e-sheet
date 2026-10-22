# PF2e Character Sheet Builder — Specification

## 1. Architecture

### 1.1 Application Type
Single-page application (SPA) built with Svelte and TypeScript, compiled via esbuild into a single self-contained HTML file (all CSS and JS inlined).

### 1.2 Layout
Two-panel side-by-side layout:
- **Left panel**: Input form (scrollable, collapsible sections encouraged for UX)
- **Right panel**: Live A4 sheet preview (scaled to fit viewport, two pages stacked)

Both panels share a polished, cohesive visual style.

### 1.3 No Backend
The app is entirely client-side. No server, no API calls, no external resources at runtime.

---

## 2. Data Model

### 2.1 Character Identity
| Field        | Type   | Notes                        |
|-------------|--------|------------------------------|
| Name        | string | Character name               |
| Heritage    | string | Free text (ancestry+heritage)|
| Class       | string | Free text                    |
| Level       | number | 1–20                         |
| Background  | string | Free text                    |

### 2.2 Ability Modifiers
Six ability modifiers entered directly (no base scores):
- STR, DEX, CON, INT, WIS, CHA
- Each is a signed integer (e.g., +4, -1, 0)

### 2.3 Proficiency System
Proficiency is represented as a rank that determines the bonus:
| Rank       | Bonus            |
|-----------|------------------|
| Untrained | 0                |
| Trained   | level + 2        |
| Expert    | level + 4        |
| Master    | level + 6        |
| Legendary | level + 8        |

This formula is used consistently for AC, saves, skills, class DC, spell DC, spell attack, and weapon attacks.

### 2.4 Hit Points
Auto-calculated:
- **Ancestry HP**: manual number field
- **Class HP per level**: manual number field (e.g., 8 for Fighter)
- **CON modifier**: applied per level
- **Misc/extra HP**: manual field for flat bonuses (e.g., Toughness)
- **Formula**: `ancestryHP + (classHP + CON) × level + miscHP`

### 2.5 Armor Class
Auto-calculated:
- **Proficiency rank**: selectable (Untrained–Legendary)
- **DEX modifier**: auto-applied (capped by armor, but cap is a manual field)
- **Dex cap**: manual number field (null = no cap)
- **Item bonus**: manual number field (from armor)
- **Misc bonus**: manual number field
- **Formula**: `10 + proficiencyBonus + min(DEX, dexCap) + itemBonus + miscBonus`

### 2.6 Saving Throws
Three saves (Fortitude, Reflex, Will), each auto-calculated:
- **Proficiency rank**: selectable
- **Ability modifier**: Fort→CON, Ref→DEX, Will→WIS (auto-linked)
- **Misc bonus**: manual number field
- **Formula**: `proficiencyBonus + abilityMod + miscBonus`

### 2.7 Skills
The full PF2e skill list, each auto-calculated:

| Skill          | Key Ability |
|---------------|-------------|
| Acrobatics    | DEX         |
| Arcana        | INT         |
| Athletics     | STR         |
| Crafting      | INT         |
| Deception     | CHA         |
| Diplomacy     | CHA         |
| Intimidation  | CHA         |
| Lore (×N)     | INT         |
| Medicine      | WIS         |
| Nature        | WIS         |
| Occultism     | INT         |
| Performance   | CHA         |
| Religion      | WIS         |
| Society       | INT         |
| Stealth       | DEX         |
| Survival      | WIS         |
| Thievery      | DEX         |

Each skill has:
- **Proficiency rank**: selectable (Untrained–Legendary)
- **Misc bonus**: manual number field
- **Formula**: `proficiencyBonus + abilityMod + miscBonus`

**Lore skills** are special: the user can add multiple Lore entries, each with a custom name (e.g., "Lore (Warfare)"), its own proficiency, and misc bonus.

### 2.8 Class DC
Auto-calculated:
- **Proficiency rank**: selectable
- **Key ability modifier**: user selects which ability (dropdown)
- **Misc bonus**: manual number field
- **Formula**: `10 + proficiencyBonus + keyAbilityMod + miscBonus`

### 2.9 Languages
Free text list — user adds/removes language strings.

### 2.10 Perception
Auto-calculated:
- **Proficiency rank**: selectable
- **WIS modifier**: auto-applied
- **Misc bonus**: manual number field
- **Formula**: `proficiencyBonus + WIS + miscBonus`

### 2.11 Speed
Manual number field (in feet).

---

## 3. Attacks, Abilities, Spells & Formulas, Items

Attacks render on page 1; abilities, spells & formulas and items on page 2.

### 3.1 Attacks / Strikes
Each attack entry has:
| Field          | Type    | Notes                                      |
|---------------|---------|---------------------------------------------|
| Name          | string  | Weapon/attack name                          |
| Actions       | string  | Free text (e.g., "1", "2", "free", etc.)   |
| Ability       | enum    | Which ability mod to use (STR or DEX typically) |
| Proficiency   | rank    | Untrained–Legendary                         |
| Item bonus    | number  | Weapon potency rune bonus (+1/+2/+3)        |
| Misc bonus    | number  | Any other attack modifier                   |
| Damage        | string  | Free text (e.g., "2d8+4 slashing")         |
| Traits        | string  | Free text (e.g., "Forceful, Sweep")         |
| **Total bonus** | computed | `proficiencyBonus + abilityMod + itemBonus + miscBonus` |

### 3.2 Abilities List
A flat, ordered list of ability entries. Each entry has:
| Field       | Type             | Required | Notes                                           |
|------------|------------------|----------|--------------------------------------------------|
| Name       | string           | yes      | Ability/feat name                                |
| Actions    | string           | no       | Free text (e.g., "1", "2", "3", "free", "reaction", etc.) |
| Type       | tag/enum         | yes      | One of: Class, Ancestry, Feat, Skill, General, Other |
| Level      | number or null   | no       | Level at which the ability was gained            |
| Description| string           | yes      | Plain-text description                           |

Abilities are displayed as a flat list with type shown as a small tag/badge, sorted by: entries with an action cost first, then action cost (1, 2, 3, free, reaction), then level (nulls last), then name.

### 3.3 Spells & Formulas
A list of **casting sources**, each of one kind. A character usually has none or one; the rare character with both spells and alchemy (or an archetype second tradition) simply adds another. Everything that differs per kind lives in one config table (`CASTING_KINDS`), so further kinds (focus spells, innate spells, rituals, ...) are a single new entry.

| Kind     | Name field | Levels            | Extra stats                                   |
|----------|-----------|-------------------|-----------------------------------------------|
| Spells   | Tradition | Cantrips, 1st–10th rank | Ability, proficiency, misc → **DC** and **attack**; slots per rank (not cantrips) |
| Formulas | Source (e.g. Alchemist, Munitions Crafter) | Item level 0–20 | Optional per-day count (versatile vials, daily munitions) |

- **Spell DC** = `10 + proficiencyBonus + abilityMod + miscBonus`, **spell attack** = `proficiencyBonus + abilityMod + miscBonus`. Formulas have no DC of their own (alchemical items use the class DC).
- Each source has a list of entries:
  | Field       | Type   | Notes |
  |------------|--------|-------|
  | Name       | string | |
  | Level      | number | Spell rank or item level; changeable per entry (moves it to that level's group) |
  | Actions    | string | 1, 2, 3, free, reaction |
  | Description| string | Brief description or notes |
- Input: entries are grouped by level; only levels with entries are shown, each with its own add button, plus a level picker to start a new level. Removing a whole source asks for inline confirmation.
- Sheet: one section per source that has a name or entries, titled "Spells — Primal", "Formulas — Munitions Crafter", entries grouped by level ascending.
- Data before format version 3 had one fixed spellcasting block; it is migrated into a spells source on load.

### 3.4 Items
A flat, ordered list of item entries. Items are displayed after spells & formulas on page 2 and overflow to a new page if needed. Items are displayed in manual order (the order the user adds/arranges them).

Each item has:
| Field       | Type   | Required | Notes                                              |
|------------|--------|----------|-----------------------------------------------------|
| Name       | string | yes      | Item name                                           |
| Weight     | number | no       | Bulk/weight value (raw number)                      |
| Value      | number | no       | Monetary value (raw number, user interprets unit)    |
| Amount     | number | no       | Quantity carried (e.g., 5 arrows)                   |
| Uses       | number | no       | Remaining uses for consumables (e.g., wand charges). Not for daily-recharge abilities — intended for tracking across a campaign. |
| Description| string | no       | Free text description or notes                      |

---

## 4. Persistence

### 4.1 Auto-save
- Character data is automatically saved to `localStorage` on every change (debounced)
- On app load, the last saved character is restored automatically
- Pending changes are flushed on `pagehide` so edits made just before closing the tab are not lost

### 4.2 JSON Export/Import
- **Export**: download the full character data as a `.json` file
- **Import**: upload a `.json` file to load a character (replaces current data)
- **Pathbuilder import**: Import also accepts a Pathbuilder 2e "Export JSON" file (`{ success, build }` or the bare build), converted in `stores/pathbuilder.ts` and then validated like any other import:
  - Ability scores → modifiers; proficiency values 0/2/4/6/8 → ranks; lores → Lore skills; `mods` → misc bonuses
  - AC proficiency from the worn armor's category, item bonus from `acTotal`; the Dex cap is inferred when `acAbilityBonus` is below the Dex modifier
  - Weapons → attacks: proficiency from specific or category proficiency, ability (STR/DEX) inferred from Pathbuilder's attack total with any rest as misc, damage from striking dice + die + bonus + extra damage
  - Feats and class features → abilities; armor and equipment → items, money as a "Money" item
  - Spellcasters → spells sources (slots per rank); focus spells → a spells source per tradition at rank ⌈level/2⌉; formula books → formulas sources
  - Pathbuilder doesn't export descriptions or formula levels (formulas land at level 0); after importing, a dialog lists what couldn't be imported
- The JSON format is versioned (`version` field, currently 3; v2 had a single fixed spellcasting block, v1 had no items list)

### 4.4 Validation
Data from localStorage, imported files and share links is untrusted. It is rebuilt field by field on top of the defaults (`sanitizeCharacter`): wrong types fall back to defaults, numbers are coerced and clamped (level 1–20), enums (ability, proficiency rank, ability type) are checked, and unknown versions are rejected.

### 4.3 Sharing
- **Share**: compresses the full character data into the URL hash (`#char=...`) and copies it to the clipboard. No external services involved.
- Only available when the app is hosted on a public URL (not on `file:`, `localhost`, or private/link-local IP ranges), since the link would not be reachable by others.
- **Opening a share link**: the hash is cleared immediately. If a different, non-empty character is already saved in the browser, a confirmation dialog asks before replacing it. A link that cannot be decoded shows an error.

---

## 5. Sheet Preview & Printing

### 5.1 Preview
- The right panel shows a scaled-down live preview of the sheet
- Pages are rendered at actual A4 proportions (210mm × 297mm)
- The preview updates in real time as inputs change
- Empty sections are hidden automatically in all render modes

### 5.2 Render Modes
A toolbar button cycles between three render modes:
| Mode     | Description |
|----------|-------------|
| Standard | Spacious two-page A4 layout optimized for readability, with a Notes section and forced page breaks |
| Dense    | Compact two-column CSS auto-flow layout across a single continuous page. Tighter spacing, descriptions truncated to ~2 lines, no Notes section, no forced page breaks |
| Mobile   | Compact single-column full-width layout with larger font sizes. No A4 framing or scaling. Full descriptions shown (no truncation). Auto-activates on narrow screens (≤1024px) but can be overridden manually |

### 5.3 Print
- Ctrl+P / browser print produces output matching the selected render mode
- Print CSS hides the input panel and all app chrome
- **Standard mode**: clean two-page A4 document
- **Dense mode**: compact two-column layout with natural page flow
- **Mobile mode**: single-column layout with type scaled back down to paper size
- No headers/footers from the browser (instruct user to disable these if needed)

### 5.4 Sheet Style
- Clean, minimal design
- Clear typography with good hierarchy
- Subtle borders and section dividers
- High information density without clutter
- Black-and-white friendly (prints well without color)

---

## 6. UI / UX

### 6.1 Input Panel
- Polished, cohesive design that matches the overall app aesthetic
- Sections for each data group (Identity, Abilities, Defenses, Skills, etc.)
- Collapsible sections to manage complexity
- Clear labels and helpful placeholder text
- Proficiency selectors are compact segmented controls labeled U/T/E/M/L (ARIA radio group with full rank names and arrow-key navigation)
- Dynamic lists (Lore skills, abilities, attacks, casting sources and their entries, items) support add/remove

### 6.2 Responsiveness
- Optimized for desktop use (side-by-side panels)
- Minimum supported width: 1024px (desktop layout)
- Below 1024px, panels stack vertically with the preview on top
- Mobile render mode auto-activates on narrow screens for a readable single-column view

### 6.3 Accessibility
- Proper form labels and ARIA attributes
- Keyboard navigable
- Sufficient color contrast

---

## 7. Build System

### 7.1 Development
- `npm run dev` — starts a development server (http://localhost:3000) that reloads the page on every rebuild
- Uses esbuild for fast compilation; `npm run check` runs `svelte-check` for type checking (esbuild only strips types)

### 7.2 Production Build
- `npm run build` — produces a single `dist/index.html` (intermediates go to `.build/`, so `dist/` holds only that file)
- Pushing a `vX.Y.Z` tag runs `.github/workflows/deploy.yml`: deploys to GitHub Pages and attaches a zip (index.html, LICENSE, README) to a GitHub Release
- All JavaScript and CSS must be inlined into the HTML file
- No external resource references (fonts, images, etc.)
- The output file should work when opened directly from the filesystem (file:// protocol)

---

## 8. Non-Goals (Explicitly Out of Scope)

- **No rules enforcement**: the app does not validate game rules, feat prerequisites, or legal builds
- **No game data**: no feat/spell/class databases — all content is user-entered (except the skill list)
- **No other external integrations**: no Foundry or other tool integration (Pathbuilder JSON import is the one exception)
- **No multi-character management**: one character at a time (use export/import to switch)
- **No server/cloud sync**: entirely local
- **No full mobile optimization**: desktop-first, but a dedicated Mobile render mode provides a readable single-column view on narrow screens
