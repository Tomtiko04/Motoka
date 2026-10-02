# Motoka Admin Style Guide

Single source of truth for admin UI chrome. The shared components live in
`src/components/admin/ui.jsx` — compose them instead of hand-rolling markup.

## Tokens

| Concern | Standard | Never |
|---|---|---|
| Primary action | `blue-600`, hover `blue-700` | hex blues (`#2284DB`, `#2389E3`), indigo, purple |
| Success | `green-*` | `emerald-*` |
| Warning | `amber-*` | `yellow-*`, `orange-*` |
| Danger | `red-*` | — |
| Icons | `@heroicons/react/24/outline` only | iconify (`mdi:`, `solar:`), emoji, inline SVG |
| Cards | `bg-white rounded-xl border border-gray-100 shadow-sm` (`CARD` / `<Card>`) | `rounded-2xl`, borderless `shadow`, grey cards |
| Badges | `<StatusBadge tone>` pill (`rounded-full`) | `rounded-md` chips, bare colored text |
| Page wrapper | `space-y-6`, no extra padding (AdminLayout pads) | `min-h-screen`, `p-6`, `px-4 py-6` on page roots |

## Components (from `../../components/admin/ui`)

- `<PageHeader icon={Icon} title subtitle actions />` — every page's first child. Left-aligned, icon tile, `text-2xl font-bold text-gray-900` title, `text-sm text-gray-500` subtitle.
- `<StatCard icon label value hint color loading />` — KPI cards. Numbers gray-900; color is only the icon tile.
- `<StatusBadge tone="green|amber|red|blue|gray">` — all status indicators.
- `<Spinner size>` / `<PageLoader />` — the only loading spinners.
- `<EmptyState icon title body action />` — all empty lists.
- Class constants: `BTN_PRIMARY`, `BTN_SECONDARY`, `BTN_DANGER`, `INPUT`, `TH`, `TD`, `CARD`.

## Tables

```jsx
<thead className="bg-gray-50">
  <th className={TH}>…</th>   // px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
</thead>
<tbody className="divide-y divide-gray-100">
  <td className={`${TD} …`}>…</td>
</tbody>
```

## Notes

- Tailwind v4: tokens go in the `@theme` block of `src/index.css` if ever needed. `tailwind.config.js` is dead — never edit it.
- Global CSS forces `img { width: 100% }` — size every `<img>` explicitly.
- Errors surface via `react-hot-toast`; loading via `Spinner`/skeletons, never bare "Loading" text.
- Disabled state is `disabled:opacity-50` everywhere.
