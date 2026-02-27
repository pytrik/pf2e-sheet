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
Manual number field (in feet). Optional misc field for modifiers.

---

## 3. Page 2 — Attacks, Abilities, Spells

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
| Type       | tag/enum         | yes      | One of: Class Feature, Ancestry Feat, Class Feat, Skill Feat, General Feat, Bonus Feat, Other |
| Level      | number or null   | no       | Level at which the ability was gained            |
| Description| string (rich)    | yes      | Free text description, supports basic formatting |

Abilities are displayed as a flat list, sorted by level (nulls last), with type shown as a small tag/badge.

### 3.3 Spells
Spell configuration:
| Field              | Type   | Notes                              |
|-------------------|--------|------------------------------------|
| Tradition         | string | Free text (Arcane, Divine, etc.)   |
| Spellcasting ability | enum | Which ability mod                  |
| Proficiency       | rank   | Untrained–Legendary                |
| Misc bonus        | number | Extra bonus to DC and attack       |
| **Spell DC**      | computed | `10 + proficiencyBonus + abilityMod + miscBonus` |
| **Spell attack**  | computed | `proficiencyBonus + abilityMod + miscBonus`      |

Spell slots per level (cantrips, 1st–10th):
- Each level has a number of slots (manual entry)
- Each level has a list of spell entries:
  | Field       | Type   |
  |------------|--------|
  | Name       | string |
  | Actions    | string | (Free text: 1, 2, 3, free, reaction, etc.) |
  | Description| string | Brief description or notes |

### 3.4 Items
A flat, ordered list of item entries. Items are displayed after spells on page 2 and overflow to a new page if needed. Items are displayed in manual order (the order the user adds/arranges them).

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

### 4.2 JSON Export/Import
- **Export**: download the full character data as a `.json` file
- **Import**: upload a `.json` file to load a character (replaces current data)
- The JSON format should be documented and versioned (include a `version` field) for future compatibility

---

## 5. Sheet Preview & Printing

### 5.1 Preview
- The right panel shows a scaled-down live preview of the two A4 pages
- Pages are rendered at actual A4 proportions (210mm × 297mm)
- The preview updates in real time as inputs change

### 5.2 Print
- Ctrl+P / browser print produces a clean two-page A4 document
- Print CSS hides the input panel and all app chrome
- Only the sheet pages are printed, at full A4 size
- No headers/footers from the browser (instruct user to disable these if needed)

### 5.3 Sheet Style
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
- Proficiency selectors should be compact (e.g., radio buttons or segmented controls labeled U/T/E/M/L)
- Dynamic lists (Lore skills, abilities, attacks, spells) support add/remove

### 6.2 Responsiveness
- Optimized for desktop use (side-by-side panels)
- Minimum supported width: 1024px
- Below minimum width, panels may stack vertically

### 6.3 Accessibility
- Proper form labels and ARIA attributes
- Keyboard navigable
- Sufficient color contrast

---

## 7. Build System

### 7.1 Development
- `npm run dev` — starts a development server with hot module reload
- Uses esbuild for fast compilation

### 7.2 Production Build
- `npm run build` — produces a single `dist/index.html`
- All JavaScript and CSS must be inlined into the HTML file
- No external resource references (fonts, images, etc.)
- The output file should work when opened directly from the filesystem (file:// protocol)

---

## 8. Non-Goals (Explicitly Out of Scope)

- **No rules enforcement**: the app does not validate game rules, feat prerequisites, or legal builds
- **No game data**: no feat/spell/class databases — all content is user-entered (except the skill list)
- **No external imports**: no Pathbuilder, Foundry, or other tool integration
- **No multi-character management**: one character at a time (use export/import to switch)
- **No server/cloud sync**: entirely local
- **No mobile optimization**: desktop-first (functional but not optimized on mobile)
