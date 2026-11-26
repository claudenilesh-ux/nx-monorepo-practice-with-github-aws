# UI Context

## Theme
Dark technical workspace based on the provided editor screenshot. These are proposed reference-inspired values, not exact sampled colors. Dark only initially. Light theme may be a later exercise.

## Colors
All UI components consume shared CSS variables. Define values in `libs/design-tokens/src/tokens.css` only.
| Role | Variable | Value |
|---|---|---|
| Page | --bg-base | #050506 |
| Surface | --bg-surface | #101019 |
| Hover / selected | --bg-hover | #25252F |
| Primary text | --text-primary | #FFFFFF |
| Muted text | --text-muted | #92929F |
| Accent | --accent-primary | #06C4D4 |
| Accent hover | --accent-hover | #30D5E2 |
| Text on accent | --text-on-accent | #052B32 |
| Border | --border-default | #27272F |
| Focus | --focus-ring | #06C4D4 |
| Error | --state-error | #EF4444 |
| Success | --state-success | #22C55E |
| Overlay | --bg-overlay | rgb(0 0 0 / 65%) |

## Typography and spacing
- `--font-sans`: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; `--font-mono`: ui-monospace, monospace. No remote font dependency.
- `--font-size-sm`: 12px; `--font-size-md`: 14px; `--font-size-lg`: 18px; `--font-size-xl`: 22px.
- `--font-weight-normal`: 400; `--font-weight-medium`: 500; `--font-weight-bold`: 600; `--line-height-base`: 1.5.
- `--space-1` through `--space-8`: 4, 8, 12, 16, 24, 32, 48, 64px respectively.
- `--radius-sm`: 4px; `--radius-md`: 8px; `--radius-lg`: 12px; `--radius-xl`: 16px; `--radius-full`: 9999px.
- `--sidebar-width`: 280px; `--nav-height`: 52px; `--control-height`: 40px; `--icon-sm`: 16px; `--icon-md`: 20px; `--avatar-size`: 32px.
- `--border-width`: 1px; `--focus-width`: 2px.

## Global styles
`global.css` loads tokens and defines body margin, background, text, typography and box sizing. Lit components explicitly consume tokens and apply necessary local box sizing inside shadow DOM. No hardcoded theme colors, font sizes, spacing or radii in application or component styles. Structural values such as 0, 100%, flex and grid fractions are allowed. CSS custom properties pass through shadow boundaries; global element selectors do not. Express does not import CSS.

## Component library
Use Lit, not separate Angular/React UI implementations. UIC = reusable UI element; SIC = composite section. Proposed public contracts (finalize per unit before implementation):
| Tag | Properties / slots | Events |
|---|---|---|
| uic-button | variant, disabled, default slot | native click |
| uic-icon-button | icon, label, disabled, optional expanded | native click |
| uic-nav | left/center/right slots | none |
| uic-avatar | src, label; initials fallback | none |
| uic-tabs | items `{id,label}[]`, value, optional `panels`; named `panel-<id>` slots | uic-change `{value}` |
| uic-list-item | label, selected | uic-select, uic-edit, uic-delete |
| uic-input | label, placeholder, value, disabled | uic-change `{value}` |
| uic-modal | heading, open, default/description/footer slots | uic-close |
| uic-empty-state | heading, description, action slot | action provided by caller |
| sic-component-library | readonly catalog entries | component-library-close |
| sic-editor-navbar | sidebarOpen | sidebar-toggle |
| sic-sidebar | isOpen, activeTab (`mine` or `shared`) | project-create, tab-change `{value}`, sidebar-close |
Complex values use properties, not stringified attributes. Events are typed, bubble and are composed where crossing shadow boundaries is required. Do not emit both a native and a duplicate custom action for one click.
When `panels` is enabled, tabs and labelled tab panels share the component's shadow root; only the selected panel is visible. Arrow keys, Home and End change selection and focus.

## Layout patterns
- `/editor`: full viewport; left sidebar with header, tabs, scrollable list, bottom create button. Main area has top nav and centered empty workspace. Selected project shows its name, not a full diagram editor.
- Feature 02 uses a non-modal sidebar over the empty canvas; the page controls its open state and tab. Its approved `--motion-sidebar` duration is 150ms, disabled for reduced motion. The New Project action emits intent only.
- Both frontend pages use shared components; page grid and routing belong to the applications. Narrow screens (below 768px) collapse the sidebar by default with a clearly labelled open control. Use same layout behavior in both apps; desktop sidebar may close and reopen too.
- Modal centered, native dialog where appropriate, backdrop token, explicit close, accessible name and focus restoration. Create/rename require a nonblank name; delete requires confirmation.
- Icons: shared stroke-based SVG icons (use a minimal shared icon map or approved framework-neutral package). No React-only icon dependency in Lit.
- Keyboard support, visible focus, labelled icon buttons, semantic controls, accessible tabs with arrow-key navigation, no horizontal overflow. Loading/error/empty states are distinguishable; do not show empty state while fetching.
