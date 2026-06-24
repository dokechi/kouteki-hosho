name: public-benefit-design
description: Design rules for a Japanese public-benefit discovery app. Prioritizes trust, readability, official-source clarity, and safe UI improvements without changing policy data or calculation logic.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Public Benefit Design Skill

This project is a Japanese public-benefit discovery app.
The purpose is to help general users understand which public systems may apply to them.

## Highest priorities

* Trust over visual novelty.
* Clarity over decoration.
* Readability over density.
* Official-source credibility over marketing tone.
* Do not make the app feel like insurance sales.
* Do not create fear-based or exaggerated copy.
* Do not imply guaranteed eligibility when the result is only an estimate.

## Absolute no-change areas

Never change these unless explicitly requested:

* Calculation logic
* JSON data structure
* Benefit names
* Official links
* Eligibility conditions
* Input meanings
* Result logic
* Public-system terminology
* Disclaimer text
* URL structure
* Data loading behavior

## Visual direction

* White background.
* Large readable Japanese text.
* Generous spacing.
* Calm editorial layout.
* Minimal color.
* Use blue only as a trust/accent color.
* Use red only for important warnings or risk notes.
* Avoid gradients, glassmorphism, neon, decorative illustrations, and AI-looking SaaS visuals.
* Avoid excessive cards, boxes, borders, and shadows.
* Prefer whitespace, typography, thin separators, and clear hierarchy.

## Form design rules

* Inputs must be easy for non-experts to answer.
* Labels must be visible above inputs.
* Do not use placeholder-only labels.
* Keep the form lightweight.
* Explain difficult terms only when needed.
* Do not add unnecessary questions.
* Do not reorder inputs if it could change user understanding.

## Result display rules

* Results should answer: “What can I use?”, “When?”, “How much roughly?”, and “What should I check next?”
* Show estimated amounts carefully.
* If uncertain, say “目安” or “可能性”.
* Keep official source links visible but not noisy.
* Important caveats should be near the relevant benefit, not hidden at the bottom.
* Avoid making uncertain benefits look guaranteed.

## Copy rules

* Use plain Japanese.
* Avoid insurance-sales-like wording.
* Avoid emotional pressure.
* Avoid hype.
* Avoid vague phrases like “安心を届ける”.
* Prefer concrete phrases like “病気で働けないとき”, “出産したとき”, “介護で休むとき”.
* Do not invent policy facts.
* Do not simplify rules so much that they become misleading.

## Redesign protocol

Before changing UI:

1. Read the current HTML/CSS/JS/data structure.
2. Identify which files control UI only.
3. Confirm that app.js, data JSON, official links, and calculation logic do not need to change.
4. Audit the current UI.
5. Propose changes.
6. Only then implement small, reviewable UI changes.

## Done checklist

Before finishing, confirm:

* Calculation logic was not changed.
* JSON data was not changed.
* Official links were not changed.
* Benefit names were not changed.
* Input meanings were not changed.
* Disclaimer text was not weakened.
* The site still feels like a public-benefit information tool, not an insurance sales page.
* Mobile readability improved.
