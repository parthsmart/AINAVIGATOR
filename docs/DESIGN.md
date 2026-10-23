# AI Navigator frontend design

## Direction

A calm, trustworthy workspace for Indian students. The interface uses warm paper, sage, moss, and orange signal colors instead of a generic dashboard blue. Content is sentence case, direct, and encouraging.

## Foundation

- **Type**: Manrope for interface copy, DM Mono for metadata and status labels.
- **Color**: paper `#f7f8f3`, ink `#20251f`, muted `#737b70`, sage `#dcebd3`, moss `#53684e`, orange `#e88957`, lime `#d8ef8f`.
- **Layout**: persistent workspace navigation on desktop; navigation becomes a horizontal, touch-friendly row on phones.
- **Interaction**: visible keyboard focus, 44px minimum interactive targets where applicable, reduced-motion support, semantic links for navigation.
- **Voice**: plain verbs, active voice, no shame or diagnosis claims. All future user-facing copy goes through i18n.

## Performance budget proposal (F2)

- Initial JS: <= 180 KB compressed for the workspace shell.
- Largest contentful paint: <= 2.5s on a mid-tier mobile profile.
- Cumulative layout shift: <= 0.1.
- Assessment API response: render a useful loading state immediately and never block the shell on AI-backed fields.
