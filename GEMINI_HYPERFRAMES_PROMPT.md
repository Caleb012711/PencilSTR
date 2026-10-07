# Prompt for Gemini 3.8 — PencilSTR × Hyperframes: three 60-second motion-graphics videos

> Copy everything below the line into Gemini 3.8 (Antigravity, `/goal` mode recommended), with the workspace set to the PencilSTR project.

---

## ROLE

You're a senior motion designer and creative technologist. Build **three separate 60-second, light-mode motion-graphics launch videos** for **PencilSTR**, the web app in this workspace. Use **Hyperframes** (HTML/CSS/JS compositions rendered to MP4). Narration comes from an **OpenRouter text-to-speech model**. The finished videos should feel like the best-performing product videos on X/Twitter: lots of motion, fast cuts, kinetic type, a hook in the first second, and readable with the sound off. Every frame should be good enough to screenshot and post.

They must **not look like AI slop**. That means:
- No stock-footage montages.
- No Ken Burns pans over static screenshots.
- No glowing purple gradients or floating 3D blobs.
- No generic SaaS language ("streamline your workflow", "unlock", "revolutionize", "seamless", "game-changer").
- No invented stats.
- Every number on screen must come from the data in this prompt. That data was computed with the app's own calculator.

Workspace: `/Users/caleblickteig/antigravity/PencilSTR-—-Autonomous-STR-Underwriting-&-DSCR-Engine`
Output dir: `brag-output-hyperframes/`. Create it, and put every intermediate file in `brag-output-hyperframes/work/`. Don't touch the existing `brag-output/` folder.

---

## 0. READ FIRST (mandatory)

1. Read the `/brag` skill: `/Users/caleblickteig/.gemini/config/skills/brag/SKILL.md` and all its `references/` files (`step-1-inspect.md`, `step-2-plan.md`, `step-3-compose.md`, `step-4-deliver.md`, `audio.md`, `tones.md`). Follow its workflow and creative laws, with these **user overrides**:
   - Duration is **60 s per video** (overrides 15–25 s).
   - Make **3 videos**.
   - **Narration is ON** and uses **OpenRouter**, not Kokoro. Ignore the skill's "single provider" voice rule; the user explicitly asked for OpenRouter.
   - Ignore the "switch to brag-slim" dispatch. Use the full Hyperframes workflow.
2. Install and learn **Hyperframes**:
   - Check `npx hyperframes --help`. If the Hyperframes agent skills (`hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`) aren't installed locally, install them from the official Hyperframes repo/docs and read them before writing any composition.
   - Use Hyperframes' own conventions for composition structure, timing attributes, GSAP/timeline usage, asset loading, `check`, `preview`, and `render`. Don't invent APIs. If you're unsure, read the docs or the CLI help.
3. Read the product so the videos are specific:
   - `src/index.css`: theme tokens
   - `index.html`: fonts and meta copy
   - `src/components/ScannerHero.tsx`: hero headline "*Underwrite the truth* in seconds.", input placeholder "Paste Zillow, Redfin, or MLS listing URL..."
   - `src/components/FeatureModules.tsx`, `src/components/common/MuseCompCard.tsx`, `src/components/dashboard/CompComparisonDrawer.tsx`, `src/components/common/CommandPalette.tsx`, `src/components/dashboard/AgentTeamView.tsx`, `src/components/LenderMemoModal.tsx`
   - `src/data/mockDeals.ts`: deals, photos, seasonality, permits, HOA clauses
   - `src/utils/calculator.ts`: the DSCR math

   **Reuse the real UI.** Rebuild product moments (search bar, comp cards, compare drawer, ⌘K palette, memo) in the composition with the app's exact colors, fonts, radii, and copy, and animate them. Don't pan over flat screenshots.

---

## 1. BRAND SYSTEM (light mode only)

| Token | Value | Use |
|---|---|---|
| Alabaster | `#F9F8F5` | Canvas background |
| Bone | `#F1EFEB` | Cards, panels |
| Hairline | `#E5E4DF` | 1 px borders, grid lines |
| Charcoal | `#111110` | Primary type, primary buttons |
| Muted | `#8F8D88` / `#666562` | Labels, secondary text |
| Emerald | `#059669` (light `#E8F5EE`, deep `#0B3B24`) | Pass / DSCR ≥ 1.25 |
| Amber | `#D97706` (light `#FEF3C7`, dark `#92400E`) | Accent, italic headline words, warnings |
| Rose | `#DC2626` | Fail (< 1.0) only |

Fonts (Google Fonts, the same ones the app loads):
- **Fraunces**: display headlines, 800 weight, tight tracking (-0.03em). Italic accent words in `#92400E`.
- **Instrument Serif**: occasional editorial italic.
- **Plus Jakarta Sans**: UI and body.
- **JetBrains Mono**: labels, numbers, tickers, uppercase micro-labels with +0.08em tracking.

Visual language:
- Warm off-white canvas, very subtle paper grain, hairline grids.
- Soft, real shadows: `0 1px 2px rgba(17,17,16,.06), 0 12px 32px -12px rgba(17,17,16,.18)`.
- Radii: 12–20 px.
- Glass badges (`backdrop-blur`, `bg-black/60`, white text) only on top of photos, matching MuseCompCard.

Format: **1920×1080, 30 fps**. Optionally also export a 1080×1350 (4:5) cut of each, which performs better in the X feed.

---

## 2. REAL DATA (use only these numbers)

Computed with `computeUnderwriting()` from `src/utils/calculator.ts` using default DSCR financing (20% down, 30-year).

| Deal | Location | Price | ADR | Occ | NOI | Annual debt service | DSCR | CoC | Cap | Cash flow/mo | Permit |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Timberline Ridge Lodge | Gatlinburg, TN | $625,000 | $485 | 64% | $73,907 | $40,524 | **1.82x** | 18.5% | 11.8% | $2,782 | UNRESTRICTED |
| Kierland Hideaway | Scottsdale, AZ | $890,000 | $590 | 66% | $92,196 | $58,285 | 1.58x | 13.6% | 10.4% | $2,826 | CONDITIONAL |
| Blue Ridge View Retreat | Blue Ridge, GA | $550,000 | $420 | 68% | $69,723 | $35,483 | **1.96x** | 21.7% | 12.7% | $2,853 | UNRESTRICTED |
| Broken Bow Ridge Pines | Broken Bow, OK | $740,000 | $510 | 62% | $75,830 | $48,221 | 1.57x | 13.2% | 10.2% | $2,301 | UNRESTRICTED |
| Gulf Shores Sandcastle Villa | Gulf Shores, AL | $940,000 | $680 | 68% | $112,333 | $60,949 | 1.84x | 19.3% | 12.0% | **$4,282** | UNRESTRICTED |

**Timberline details:**
- Loan $500,000 at 7.15%. MLS #248190. Permit STR-2024-0418-SEV (Sevier County).
- HOA "§4.1 — 0-Night Minimum Stay — UNRESTRICTED STR", note "Max 4 Vehicles".
- Was $650,000, now $625,000 (−$25,000 price drop).
- Monthly revenue Jan→Dec: 5800, 5200, 7600, 8400, 9900, 12400, 13200, 11500, 9100, **14200 (Oct, peak)**, 10400, 12100. Occupancy Jan→Dec: 42, 40, 58, 62, 66, 82, 86, 76, 64, 91, 70, 80.
- Annual waterfall: gross rent $113,490 + cleaning revenue $13,505. Costs: management $17,024, platform $3,405, cleaning $13,505, taxes $4,850, insurance $2,750, utilities $4,680, HOA $1,200, CapEx reserve $5,675. **NOI = $73,907.**
- Rate-shock DSCR (+0 / +100 / +200 / +300 bps): 1.82 / 1.66 / 1.51 / 1.39
- Stress grid DSCR (rows = occupancy, columns = rate +0/+1/+2/+3 pts):

  | Occ | +0 | +1 | +2 | +3 |
  |---|---|---|---|---|
  | 64% | 1.82 | 1.66 | 1.51 | 1.39 |
  | 58% | 1.62 | 1.47 | 1.34 | 1.23 |
  | 52% | 1.42 | 1.29 | 1.17 | 1.08 |
  | 46% | 1.22 | 1.10 | 1.01 | 0.92 |

  Colors: ≥1.25 emerald, 1.0–1.25 amber, <1.0 rose. Lender line = 1.25x.

Photos: use the real Unsplash URLs in `src/data/mockDeals.ts` (`imageUrl` and `imageGallery`). **Download them into `work/assets/`** and reference the local files so renders are deterministic.

The app really has 4 scribe agents (Agent Team view), a ⌘K command palette, Muse comp cards with a compare drawer, an HOA/CC&R audit, and lender memo export. Show only features that exist.

---

## 3. VOICE: OpenRouter TTS bridge

- Bridge script (already built): `/Users/caleblickteig/.gemini/config/skills/openrouter-voice-bridge/scripts/voice_bridge.py`. A copy lives in `.agents/skills/openrouter_voice_bridge/`.
- **API key:** the bridge resolves the key from `--api-key`, then `$OPENROUTER_API_KEY`, then `~/.config/openrouter/api_key` (already saved there, chmod 600). **Never paste the key into code, compositions, logs, or committed files.**
- Model: `openai/gpt-audio-mini` (fallback `openai/gpt-audio`). It must use `stream: true` with `audio.format: "pcm16"` (24 kHz mono s16le). MP3 isn't allowed when streaming. `openai/gpt-4o-audio-preview` doesn't exist on OpenRouter.
- Example call:
  ```bash
  python3 ~/.gemini/config/skills/openrouter-voice-bridge/scripts/voice_bridge.py \
    --text "…" --voice ash --direction "…" --no-fallback --output work/vo/a1.mp3
  ```
- **Synthesize one file per line** so the visuals can be timed to real VO durations.
- Never fall back to macOS `say`. If a call fails, retry up to 3 times, then stop and report.
- **Verify each line.** The stream also returns `delta.audio.transcript`. If you write your own call, capture it and diff it against the script. Re-roll any line where the model added, dropped, or commented on words. Also sanity-check duration (about 0.3–0.5 s per word).
- Post-process each line: trim leading and trailing silence (`silenceremove`), convert to 48 kHz stereo WAV, light compression, loudness target about −16 LUFS.

Voices: Video A `ash`, Video B `coral`, Video C `sage`. If one is rejected, fall back to `onyx`, `nova`, and `shimmer` respectively.

---

## 4. THE THREE VIDEOS (scripts are final; storyboards are direction)

Shape for each: Hook (≤2 s, motion on frame 1) → reveal → 3–5 sharp beats → logo and line outro.

Timing rules:
- Build each timeline **from the measured VO durations**: scene length = VO length + 0.4–1.0 s breathing room. Then tune the gaps so the total is **exactly 60.0 s**.
- Snap major cuts and reveals to the nearest strong beat (±0.15 s) using the cue JSON in `~/.gemini/config/skills/brag/assets/music/cues/`.

### Video A — "The 3-Second Underwrite"
Voice `ash`. Music `happy-beats-business-moves-vol-10` (exactly 60 s). Direction: confident, dry, wry, medium-fast.

| # | VO | Visual |
|---|---|---|
| A1 | "Six hundred twenty-five thousand dollars. For a cabin in Gatlinburg." | Frame 1: "$625,000" slams in, giant Fraunces, digits rolling like an odometer. The Timberline photo wipes in inside a rounded mask. "for a cabin?" pops in amber italic. |
| A2 | "Is it a deal? Or a very expensive mistake?" | Split screen: "DEAL" (emerald) vs "MISTAKE" (rose) flip like a split-flap board. The listing card shakes with a −$25,000 price-drop chip. |
| A3 | "Paste the listing into PencilSTR." | Rebuilt hero: "*Underwrite the truth* in seconds." A cursor glides in, the URL types character by character, then a click ripple on "Pencil Deal". |
| A4 | "Four AI scribes pull the nightly rate, occupancy, taxes and insurance, and build the model while you watch." | Four agent rows with live status dots. Data chips ($485 ADR, 64% Occ, $4,850 taxes, $2,750 insurance) fly from the listing into a model grid and lock in with micro-bounces. |
| A5 | "Seventy-three thousand in net operating income. The mortgage, covered one point eight two times." | NOI counts up to $73,907. Debt service $40,524 shows as a bar. A radial gauge sweeps to **1.82x** in emerald, passing the 1.25 lender tick. Camera push-in. |
| A6 | "Shock the rate three full points. It still clears the lender's line." | A rate slider drags +100 → +200 → +300 bps. DSCR ticks down 1.66 → 1.51 → 1.39 and stays above the dashed 1.25 line. Haptic-style pulse on each step. |
| A7 | "Then it reads the HOA rules, so a covenant can't kill the deal after closing." | CC&R document scrolls with a scan line. "§4.1 — 0-Night Minimum Stay" highlights in amber. An UNRESTRICTED stamp lands (impact SFX). "Max 4 Vehicles" note slides in. |
| A8 | "One click, and the lender memo is done." | Memo pages assemble and stack. "Exported · Lender Memo (PDF)" toast. |
| A9 | "PencilSTR. Underwrite the truth in seconds." | Logo (use `BrandLogoIcon` from `src/components/dashboard/SidebarIcons.tsx`) with the headline, amber italic accent. Hold at least 2.5 s. |

### Video B — "Five Markets, One Screen"
Voice `coral`. Music `vol-11`, trimmed to 60 s with a 1.5 s fade-out. Direction: warm, upbeat creator energy, brisk.

| # | VO | Visual |
|---|---|---|
| B1 | "Your rental spreadsheet has forty tabs, and it's still guessing." | A spreadsheet "STR_comps_v7_FINAL_final.xlsx". Tabs multiply and cells fill with `#REF!`, then the grid shatters or collapses into hairlines. |
| B2 | "PencilSTR sweeps five markets at once, from the Smokies to the Gulf." | A minimal US outline drawn in hairline. A radar sweep pings Gatlinburg, Scottsdale, Blue Ridge, Broken Bow, and Gulf Shores with mono labels. |
| B3 | "Every listing becomes a card with the numbers that matter: debt coverage, nightly rate, and whether the city even allows it." | Masonry grid of five Muse comp cards with real photos, staggered spring entrance. Glass badges (DSCR, ADR) count up. Permit seals stamp in. |
| B4 | "Sort by DSCR, and the winner rises. Blue Ridge. One point nine six." | A "Sort: DSCR ↓" pill gets clicked. Cards FLIP-animate into rank order. Blue Ridge rises to #1 with an emerald ring and **1.96x**. |
| B5 | "Compare side by side. Almost the same cash flow, but one returns twenty-two percent on your cash, and the other needs a city permit." | "+ Compare" ticks on Blue Ridge and Kierland. The dock pill slides up, then the matrix opens. Rows animate: $2,853 vs $2,826/mo, 21.7% vs 13.6% CoC, UNRESTRICTED vs CONDITIONAL (amber). |
| B6 | "Want pure cash flow? Gulf Shores clears four thousand a month." | Gulf Shores card goes full-bleed. "$4,282/mo" counter. Monthly seasonality sparkline draws in. |
| B7 | "Find your next deal in a minute, not a month. PencilSTR." | ⌘K palette opens and types "Gulf"; results filter. Cut to logo outro. |

### Video C — "Anatomy of a 1.82x"
Voice `sage`. Music `vol-12`, trimmed to 60 s with a fade-out. Direction: calm, clear finance teacher, never slow.

| # | VO | Visual |
|---|---|---|
| C1 | "This one number decides whether a bank lends you half a million dollars." | A huge "1.82x" fills the frame, then shrinks into the corner. "$500,000 loan" ticker. |
| C2 | "It's called DSCR. Net operating income, divided by your mortgage." | The formula builds piece by piece: `DSCR = NOI ÷ Debt Service`. Each term gets a pill label. |
| C3 | "PencilSTR starts with twelve months of real seasonality. Quiet Februaries. A peak October." | 12 bars grow one by one (stagger on beats). February dims; October ($14,200, 91% occupancy) glows amber with a callout. |
| C4 | "Then it strips out every cost. Management, cleaning, taxes, insurance, utilities. What's left is seventy-three nine." | Waterfall chart from $126,995 total revenue. Each cost bar drops away as it's named. The NOI bar lands at **$73,907**. |
| C5 | "Divide by forty thousand in debt service, and there's your one point eight two." | The NOI bar sits over the $40,524 debt-service bar. A division line draws and the ratio resolves to **1.82x** with an emerald pulse. |
| C6 | "Now break it on purpose. Higher rates. Emptier nights. Green means the bank still says yes." | The 4×4 stress heatmap fills cell by cell, diagonally, numbers counting. The cell under 1.25 turns amber and 0.92 turns rose. The lender line is labeled. |
| C7 | "Know your number before the bank does. PencilSTR." | Logo and line outro, hold at least 2.5 s. |

---

## 5. MOTION DIRECTION (what "not slop" means here)

- **Something moves on frame 0.** No fade-from-white openers.
- **Kinetic typography:**
  - Word-by-word or line-mask reveals (translateY 100% → 0 inside an overflow mask).
  - Overshoot springs with ease `back.out(1.6)` / `expo.out`.
  - Odometer number rolls and `font-variant-numeric: tabular-nums` counters.
- **Camera language:** whole-stage push-ins, parallax layers, short whip-pans (with a directional blur or skew of about 8–12° over 4–6 frames) between scenes, match cuts (e.g. the gauge's number becomes the next scene's headline).
- **UI choreography:** simulated cursor with eased paths and click ripples, typing with a caret, toggles, FLIP reorders, stamps with a 2-frame squash and a soft shadow bloom.
- **Cut pace:** a visual change at least every 1.5–2.5 s, but **any line the viewer must read stays settled for about 0.3 s per word**. Fast in, then hold.
- **Transitions:** no muddy crossfades between busy layouts. Stagger out, then in, or dip through alabaster, or use mask wipes.
- **Captions (sound-off viewers):** burned-in captions for every VO line in a clean pill at the bottom center (Plus Jakarta Sans 600, charcoal on white/95 with a hairline border). Highlight the active word if you have word timings. Captions must never collide with UI.
- **Restraint:** one accent color per beat, generous whitespace, no emoji, no gradients except subtle photo scrims.
- **Determinism:** every frame must be a pure function of time. Fonts and images must be loaded before capture. No `Math.random()` without a seed and no real-time clocks.

---

## 6. AUDIO MIX

- **Music:** bundled tracks in `~/.gemini/config/skills/brag/assets/music/`. Duck under the VO by about 8–10 dB with sidechain or volume automation. Music bed about −24 LUFS short-term under VO, about −18 LUFS in gaps. Fade in over 0.3 s; fade out over the last 1.5 s.
- **SFX:** `~/.gemini/config/skills/brag/assets/sfx/` (`ui/`, `interface/`, `impact/`, `keyboard/`). Read `sfx-analysis.md` and pick soft ones.
  - Keyboard ticks under typing.
  - `click`/`switch` on clicks and toggles.
  - `impactSoft_*` or `impactPlate_light_*` on stamps and slams.
  - Quiet `drop`/`select` on card lands.
  - SFX sit about 6–10 dB under VO. Keep repeated sounds quiet and randomized across variants. Nothing harsh.
- **Final master:** −14 LUFS integrated, true peak ≤ −1.0 dBTP, AAC 192 kbps 48 kHz stereo.
- Follow `references/audio.md` for how the skill expects audio to be wired into Hyperframes. If Hyperframes can't mix three layers well, render a silent video and mux a pre-mixed WAV with ffmpeg.

---

## 7. BUILD STEPS

1. Write `brag-output-hyperframes/brag-plan.md`: the angle for each video, hook, beats, final scene timings (from VO durations), beat snaps, and SFX cue list.
2. Download photos to `work/assets/`. Copy fonts locally if Hyperframes requires offline fonts.
3. Synthesize and verify all 23 VO lines (§3). Write `work/vo/durations.json`.
4. Create three Hyperframes compositions: `composition/a_underwrite/`, `composition/b_markets/`, `composition/c_anatomy/`. Put shared tokens and components (caption pill, cursor, comp card, gauge, counter, logo) in a shared CSS/JS module.
5. Run `npx hyperframes check` in each composition. **Zero errors is required.**
6. **Visual QA before the full render.** For each video, export stills at every scene midpoint **and** mid-transition (at least 20 stills per video) and look at them. Fix:
   - overflow and clipping
   - text collisions
   - low contrast
   - captions covering UI
   - wrong or invented numbers
   - layout jitter
   - anything that looks templated

   Then iterate at least twice.
7. Render to `brag-output-hyperframes/video_a_underwrite.mp4`, `video_b_markets.mp4`, `video_c_anatomy.mp4`. Use H.264 High, yuv420p, CRF ≤ 18, `+faststart`, each exactly 60.0 s ±0.05.
8. **Posters:** pick the strongest *settled* frame of each into `poster_a.jpg` / `poster_b.jpg` / `poster_c.jpg`, and **bake it in as frame 0** (replace frame 0, don't add one, so duration and sync stay intact). Also copy video A to `brag.mp4` and `brag.jpg`.
9. Write `captions_a.vtt`/`.srt` (and for b and c) from real VO timings.
10. Write `share-copy.txt`: for each video, 1–3 X-ready sentences. Specific, no "excited to share", no hashtag spam.
11. **Integration (optional, only if it builds cleanly):** copy the MP4s and posters to `public/video/styles/` and add them as selectable styles in `src/components/common/LaunchVideoModal.tsx` (it already supports `videoFile`). Then run `npx tsc --noEmit`, `npm run build`, and `npx playwright test`. All must pass.

---

## 8. DEFINITION OF DONE (audit yourself before finishing)

- [ ] 3 MP4s, 1920×1080, 30 fps, 60.0 s each, light mode, with narration, music, and SFX
- [ ] `npx hyperframes check` passes with 0 errors for all three
- [ ] Every number on screen matches §2. No invented claims or testimonials.
- [ ] VO transcripts match the scripts word for word. No macOS `say` fallback was used.
- [ ] The first 1 s of each video has motion and a hook. The outro holds at least 2.5 s.
- [ ] Captions on every line, readable, no collisions
- [ ] Stills reviewed at every scene and transition, issues fixed, at least 2 iterations
- [ ] Posters picked and baked as frame 0; share copy written
- [ ] API key appears in no file you created: `grep -r "sk-or-v1" brag-output-hyperframes src public` returns nothing except input placeholders
- [ ] Final report lists file paths, one-line creative angle per video, the voice and model used, and anything you'd re-roll
