# Public header and footer refinement

The public header is transparent, without its previous rounded background. The
white solution dropdown and mobile menu retain a readable surface. The compact,
dark navy footer groups the brand, two-column navigation, and contact information.
The supplied `SCS Full Logo.png` is preserved byte-for-byte as
`public/assets/scs-full-logo.png` and displayed in the header and footer. Its
transparent margins are framed with CSS; the artwork is not modified. The floating
WhatsApp action remains visible with reserved space around footer links.

The extracted frontend imports `src/app/navigation-refinement.css` and renders
`FooterContent` through `SiteFooter`. The footer uses the existing site-settings
loader: bundled settings in the extracted demo, CMS settings in the legacy app.

After applying the Services refinement to the isolated legacy Payload app, run
from the repository root:

```powershell
node cms-ui/navigation-refinement/apply.mjs
```

An optional first argument selects another legacy checkout. This idempotent patch
copies the public header, footer, shared logo, asset, and stylesheet, and adds the frontend layout import. It
does not change the Payload admin, database, media, published content, contact
form, or preview/publish hooks. Rebuild the target app after applying it for a
production-mode local preview.

Presentation checks are included in `scripts/render-public.test.mjs` (CMS contact
values, navigation links, and the existing WhatsApp action). Run:

```powershell
node --test --test-isolation=none scripts/services.test.mjs scripts/render-public.test.mjs
pnpm typecheck
pnpm build
```
