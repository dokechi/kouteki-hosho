---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.
---

# tasteskill: Anti-Slop Frontend Skill

> Landing pages, portfolios, and redesigns. Not dashboards, not data tables, not multi-step product UI.
> Every rule below is contextual. None of it fires automatically. First read the brief, then pull only what fits.

## Source

Manually installed from:
https://raw.githubusercontent.com/Leonxlnx/taste-skill/main/skills/taste-skill/SKILL.md

## Core operating rules

- Read the brief before making design changes.
- Infer the page kind, audience, brand assets, reference signals, and quiet constraints.
- State a one-line design read before generating UI.
- Tune three dials: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`.
- Use real design systems when the brief clearly maps to one.
- Work with the existing stack and verify dependencies before importing libraries.
- Do not default to AI-purple gradients, centered dark mesh heroes, generic glassmorphism, three equal feature cards, or excessive animations.
- Prefer purposeful typography, layout, spacing, motion, and hierarchy.
- For redesigns, audit before touching code and preserve information architecture, URLs, nav labels, accessibility wins, and analytics-sensitive names unless explicitly asked.
- Run a pre-flight check before shipping UI.

## Public-sector and trust-first guidance

For public-sector, regulated, or accessibility-critical surfaces:

- Trust and clarity override visual novelty.
- Use lower design variance and lower motion intensity.
- Favor accessible, readable layouts, restrained colors, clear hierarchy, and official-source credibility.
- Avoid hype, fear-based copy, decorative visual noise, and sales-like language.

## Redesign protocol

1. Detect whether the task is greenfield, redesign-preserve, or redesign-overhaul.
2. Audit brand tokens, information architecture, content blocks, patterns to preserve, patterns to retire, existing dial values, and SEO risks.
3. Propose focused changes.
4. Implement small, reviewable updates with the existing framework and styling system.
5. Test functionality, accessibility-relevant behavior, mobile layout, and reduced-motion behavior when motion is used.

## Pre-flight checklist

- Brief inference declared.
- Dial values are explicit and reasoned from the brief.
- One design system or aesthetic direction is selected.
- Redesign mode is detected and audited when applicable.
- One theme, one accent color, and one shape system are used consistently.
- Buttons, forms, and body text pass contrast requirements.
- Hero content fits the initial viewport and CTAs do not wrap on desktop.
- Navigation stays on one line on desktop.
- Layout repetition, excessive eyebrows, duplicate CTA intent, decorative dots, scroll cues, fake screenshots, generic names, and AI-slop patterns are avoided.
- Motion is motivated, reduced-motion safe, and isolated in client leaves when required.
- Core Web Vitals remain plausible.
