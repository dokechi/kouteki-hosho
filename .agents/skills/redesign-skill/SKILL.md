---
name: redesign-existing-projects
description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.
---

# Redesign Skill

## Source

Manually installed from:
https://raw.githubusercontent.com/Leonxlnx/taste-skill/main/skills/redesign-skill/SKILL.md

## How This Works

When applied to an existing project, follow this sequence:

1. Scan. Read the codebase. Identify the framework, styling method (Tailwind, vanilla CSS, styled-components, etc.), and current design patterns.
2. Diagnose. Run through the audit below. List every generic pattern, weak point, and missing state you find.
3. Fix. Apply targeted upgrades working with the existing stack. Do not rewrite from scratch. Improve what's there.

## Design Audit

### Typography

Check for these problems and fix them:

- Browser default fonts or Inter everywhere. Replace with a font that has character when appropriate.
- Headlines lack presence. Increase size for display text, tighten letter-spacing, reduce line-height.
- Body text too wide. Limit paragraph width to roughly 65 characters. Increase line-height for readability.
- Only Regular and Bold weights used. Introduce Medium and SemiBold for subtle hierarchy.
- Numbers in proportional font. Use monospace or tabular figures for data-heavy interfaces.
- Missing letter-spacing adjustments.
- All-caps subheaders everywhere.
- Orphaned words.

### Color and surfaces

- Avoid pure black backgrounds and pure white defaults when depth is needed.
- Desaturate accents and use one accent color.
- Do not mix warm and cool grays.
- Avoid generic purple/blue AI-gradient aesthetics.
- Tint shadows to match the background hue.
- Add subtle texture only when it serves the design.
- Avoid random dark sections inside light pages or random light sections inside dark pages.

### Layout

- Break generic symmetry when appropriate.
- Replace three equal feature cards with more deliberate layouts.
- Use `min-height: 100dvh` instead of `height: 100vh` for full-screen sections.
- Prefer CSS Grid over complex flexbox percentage math.
- Add max-width containers.
- Let variable content have natural height.
- Add whitespace and optical rhythm.
- Align shared elements across side-by-side cards or panels.

### Interactivity and states

- Add hover, active, focus, loading, empty, and error states where relevant.
- Use smooth transitions on interactive elements.
- Avoid `window.alert()` for user-facing errors.
- Avoid dead links.
- Use transform and opacity for animations.

### Content

- Avoid generic names, fake perfect numbers, placeholder company names, and AI copywriting cliches.
- Remove unnecessary exclamation marks and vague marketing language.
- Use active voice and specific language.
- Never ship lorem ipsum.
- Prefer sentence case.

### Component patterns

- Avoid generic cards unless elevation communicates hierarchy.
- Avoid default filled-plus-ghost button pairs when text links or tertiary styles are better.
- Replace generic badges, FAQ accordions, carousel testimonials, pricing towers, unnecessary modals, and link-farm footers when better patterns fit.

### Iconography

- Avoid default icon choices when they make the UI generic.
- Standardize icon stroke widths.
- Include a favicon when working on production UI.
- Avoid uncanny stock imagery.

### Code quality

- Use semantic HTML.
- Keep styling in the project styling system.
- Use flexible units.
- Provide meaningful alt text for meaningful images.
- Avoid arbitrary z-index values and commented-out dead code.
- Check imports against dependencies.
- Add proper metadata when working on a page shell.

## Upgrade Techniques

### Typography upgrades

- Variable font animation.
- Outlined-to-fill transitions.
- Text mask reveals.

### Layout upgrades

- Broken grid and asymmetry.
- Whitespace maximization.
- Parallax card stacks.
- Split-screen scroll.

### Motion upgrades

- Smooth scroll with inertia.
- Staggered entry.
- Spring physics.
- Scroll-driven reveals.

### Surface upgrades

- True glassmorphism only when appropriate.
- Spotlight borders.
- Grain and noise overlays.
- Colored, tinted shadows.

## Fix Priority

Apply changes in this order for maximum visual impact with minimum risk:

1. Font swap.
2. Color palette cleanup.
3. Hover and active states.
4. Layout and spacing.
5. Replace generic components.
6. Add loading, empty, and error states.
7. Polish typography scale and spacing.

## Rules

- Work with the existing tech stack. Do not migrate frameworks or styling libraries.
- Do not break existing functionality. Test after every change.
- Before importing any new library, check the project's dependency file first.
- If the project uses Tailwind, check the version before modifying config.
- If the project has no framework, use vanilla CSS.
- Keep changes reviewable and focused. Small, targeted improvements over big rewrites.
