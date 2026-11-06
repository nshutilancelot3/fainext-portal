# Artefact Documentary — Shooting Script

**Artefact:** Fainext Client Portal
**Runtime target:** 3 min 38 s (brief asks for 3–4 min)
**Narrator:** Nshuti Lancelot
**Format:** screen recording of the live portal + voice-over, with on-screen captions for citations

Narration is written to be read at roughly 140 words per minute. Read it at a normal
speaking pace — do not rush. Each block's duration assumes that pace.

---

## The footage is already cut

`fainext-demo.mp4` in this folder is a **silent 3 min 40 s screen recording** of the
portal, cut to the timeline below. Every timecode in this script matches the video
frame-for-frame, so you can drop the MP4 onto a timeline, record your voice over the
top, and the picture will already be on the right beat.

It has **no audio track** — that is deliberate. Add your narration and music in the
editor.

| What the video contains | Timecode |
|---|---|
| Title card over the login page, then signing in | 0:00 – 0:22 |
| Statistics slide with the two FinScope citations | 0:22 – 0:57 |
| Registration, password strength, inline validation | 0:57 – 1:06 |
| Dashboard, insights, category breakdown, savings goal contribution | 1:06 – 1:43 |
| Transactions: category filter, stacked status filter, live totals | 1:43 – 1:52 |
| Transaction detail dialog, then the printable statement | 1:52 – 2:00 |
| Dark mode toggle | 2:00 – 2:03 |
| Wireframes, then the code and the test checklist | 2:03 – 2:48 |
| Slow scroll down the finished dashboard (room for the reflection) | 2:48 – 3:26 |
| Closing card with all four references | 3:26 – 3:40 |

If you would rather shoot your own footage, the section below still applies and the
stills in `screenshots/` are numbered in script order.

---

## Before you record

1. Start the site. From the project folder:

```bash
python3 -m http.server 8123
```

2. Open `http://localhost:8123` and sign in with the account in
   `sample-account.example.json` (register it first if you have not already).
3. Set your screen to 1440 × 900 or larger, close other tabs, hide bookmarks.
4. Record at 1080p. OBS Studio and Loom both do this free.
5. Record the **screen** and the **voice** in one pass, then trim — it is much easier
   than syncing them afterwards.

If a step goes wrong on camera, keep talking and fix it in the edit. Everything you
need is also pre-captured in `screenshots/`, so you can cut to a still at any point.

---

## SECTION 1 — Title and summary
**0:00 – 0:22** · 52 words

> **ON SCREEN:** Open on the login page (`01-login.png` or live). At 0:04, title card
> over it: **"Fainext Client Portal"** / *Nshuti Lancelot — Software Developer Intern*.
> Then sign in live so the dashboard appears as you finish the line.

**NARRATION:**

"This is the Fainext Client Portal. It's a web application I built during my internship
at Fainext, a financial services company in Kigali. It takes a list of transactions and
turns it into something a person can actually make decisions from. Let me show you how
it got here."

---

## SECTION 2 — The problem it solves
**0:22 – 0:57** · 82 words

> **ON SCREEN:** Cut away from the app. Hold on a plain slide with the two figures
> (96% / 86%) appearing as you say them, then the 15% figure. Keep it simple — large
> numerals on the brand blue `#0b5394`.
>
> **CAPTIONS (bottom third, as each claim is spoken):**
> `Ministry of Finance and Economic Planning. (2024). 96% of Rwandans are financially included: FinScope Survey 2024.`
> `Kuria, D., Cyusa, C. E., & Kamau, V. N. (2026, May 25). Digital financial inclusion in Rwanda. MicroSave Consulting.`

**NARRATION:**

"Rwanda has largely solved access to finance. The FinScope 2024 survey found ninety-six
percent of Rwandan adults are financially included, and eighty-six percent use mobile
money. But access isn't the same as use. A 2026 analysis of that same data found people
treat digital accounts as a way to move money, not as a tool to manage it. Only fifteen
percent receive income digitally. So the gap I set out to close wasn't access. It was
understanding."

---

## SECTION 3 — What the artefact is
**0:57 – 2:00** · 148 words

> **ON SCREEN — follow the narration beat for beat:**
>
> | Time | Show |
> |---|---|
> | 0:57 | Registration page, type a weak password so the strength bar moves, submit empty to trigger the red validation |
> | 1:05 | Dashboard loads — let the four summary cards and the bar chart land |
> | 1:13 | Slow scroll to **"What this means"**; let each insight sit on screen as you read it |
> | 1:30 | Pan left to **"Where your money goes"**, bars filling |
> | 1:38 | Scroll to **Savings goals**. Type `50000` into Emergency fund and press **Add** — the bar visibly moves |
> | 1:45 | Jump to the Transactions page. Pick **Category → Utilities & Bills**, then **Status → Failed**. Let the totals row recalculate on camera |
> | 1:54 | Click one row so the detail dialog opens. Close it with Escape |
> | 1:56 | Press **Print / PDF** to reveal the statement preview, then cancel |
> | 1:58 | Press the **Dark** button in the navbar — the whole app flips theme |

**NARRATION:**

"The portal opens with registration and login. Passwords are hashed with the browser's
Web Crypto API before anything is stored, and the dashboard is unreachable without a
session.

Inside, four cards give the headline figures, and a six-month chart shows the shape of
spending. But the part I care about most is this panel. Every transaction is categorised
automatically from its description, so the portal can say in plain language what changed:
your biggest spend is housing, at fifty-eight percent. You're spending sixty-five percent
less than last month. Sixty-five thousand francs is still pending.

Underneath, savings goals — set a target, add to it, watch it fill.

The transactions page filters by search, type, status, category and date, all at once,
and totals whatever you're looking at. Export it as CSV, or print a proper statement. And
the whole thing has a dark theme."

---

## SECTION 4 — Research, building and testing
**2:00 – 2:48** · 113 words

> **ON SCREEN:**
>
> | Time | Show |
> |---|---|
> | 2:00 | The three SVG wireframes from `wireframes/` — cross-fade between them |
> | 2:08 | Scroll `js/data.js` so the Rwandan sample rows are legible (MTN MoMo, WASAC, RSSB) |
> | 2:16 | Scroll `js/ui.js` or `css/style.css` — show real code, not a logo |
> | 2:26 | Split screen or quick cuts: filters firing, a calculator beside the totals row |
> | 2:36 | Tab through the transactions table with the keyboard, dialog opening on Enter |
> | 2:42 | The dark dashboard (`12-dashboard-dark.png`) |
>
> **CAPTION at 2:42:**
> `W3C. (2024). Web Content Accessibility Guidelines (WCAG) 2.2, SC 1.4.3.`

**NARRATION:**

"Getting here took three passes. First, research: I read the FinScope data, then mapped
what a Rwandan account actually looks like — MTN MoMo, Airtel Money, bank transfers,
cards, RSSB contributions, cash power.

Then I built it, deliberately with no frameworks. Plain HTML, CSS and JavaScript — no
build step, no dependencies. That constraint was the point: it has to open on a low-end
laptop with no internet.

Then testing. I checked every filter combination against hand-calculated totals, confirmed
the balance reconciles across three different screens, tested the keyboard path through
every dialog, and checked the dark theme's contrast against WCAG's four-point-five-to-one
minimum."

---

## SECTION 5 — How this changed my approach to my mission
**2:48 – 3:26** · 90 words

> **ON SCREEN:** Slow down here. Hold on the dashboard, scrolling gently — or cut to
> yourself on camera if you are comfortable on screen. This is the section the rubric
> weights most heavily, so let it breathe. Drop the music a few dB under the voice.
>
> **CAPTION at 3:02:**
> `Nielsen, J. (2024). 10 usability heuristics for user interface design. Nielsen Norman Group. (Original work published 1994)`

**NARRATION:**

"What changed in me was smaller and more useful than I expected.

I started out wanting to add features. I finished caring about whether a number could be
trusted. The moment that stuck was finding my balance disagreeing with my own transaction
totals by a few thousand francs — in a financial product, that's not a rounding error,
that's a reason to leave.

My mission is building financial tools for people in Rwanda. This taught me that the hard
part isn't the building. It's earning the right to be believed."

---

## SECTION 6 — Close
**3:26 – 3:40** · 33 words

> **ON SCREEN:** The README's security note on screen, then fade to a closing card:
> **Fainext Client Portal** / *Nshuti Lancelot* / repository URL. Hold the references
> list on screen for the last four seconds.

**NARRATION:**

"The portal is a prototype — the data is sample data, and real deployment would need a
backend and proper server-side authentication. But the thinking behind it is the part
I'm taking forward."

---

## References (APA 7)

Hold these on screen in the closing card, and also paste them into the YouTube
description.

Kuria, D., Cyusa, C. E., & Kamau, V. N. (2026, May 25). *Digital financial inclusion in
Rwanda: Successes, usage gaps, and the next priorities*. MicroSave Consulting.
https://www.microsave.net/2026/05/25/digital-financial-inclusion-in-rwanda-successes-usage-gaps-and-the-next-priorities/

Ministry of Finance and Economic Planning. (2024, June 20). *96% of Rwandans are
financially included — FinScope Survey 2024*. Government of Rwanda.
https://www.minecofin.gov.rw/news-detail/96-of-rwandans-are-financially-included-finscope-survey-2024

Nielsen, J. (2024). *10 usability heuristics for user interface design*. Nielsen Norman
Group. https://www.nngroup.com/articles/ten-usability-heuristics/ (Original work
published 1994)

World Wide Web Consortium. (2024, December 12). *Web content accessibility guidelines
(WCAG) 2.2* (W3C Recommendation). https://www.w3.org/TR/WCAG22/

---

## Production notes

**Timing.** Total narration is 491 words: 3 min 30 s at 140 words per minute, 3 min 46 s
at a slower 130. Both sit inside the brief's 3–4 minute window, so read at whichever pace
feels natural. If you land under 3 minutes you are rushing — slow down rather than adding
material.

**Audio.** Record voice separately from the room if you can; a phone's voice recorder
held 15 cm away beats a laptop mic. Background music should sit at about −20 dB under
the voice, and should drop out entirely under Section 5.

**Captions.** The rubric rewards "a variety of media." The four citation captions, the
title card, the statistics slide in Section 2 and the closing card are enough to satisfy
that without the video feeling cluttered.

**Cut-ins.** Every beat in this script has a matching still in `screenshots/`, numbered
in the order the script uses them. If a live take goes wrong, cut to the still rather
than re-recording the whole section.

**Adding your voice to `fainext-demo.mp4`.** Any free editor works — DaVinci Resolve,
CapCut, Shotcut, or even Clipchamp on Windows. Import the MP4, record or import your
voice on an audio track, add music underneath, export at 1080p. If your editor asks,
the video is 1440 × 900 at 30 fps with no audio stream.

To merge a finished voice track from the command line instead:

```bash
ffmpeg -i fainext-demo.mp4 -i narration.m4a -c:v copy -c:a aac -shortest fainext-documentary.mp4
```

**Upload.** YouTube → Unlisted. Not Public, not Private. Paste the four references into
the description before you submit the link.
