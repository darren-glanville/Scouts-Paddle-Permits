# Scouts-Paddle-Permits

A simple fullscreen HTML presentation about **paddlesport and traditional raft building permits** in Scouts (UK): why they matter, permit types, and how leaders can gain them.

## Run locally

Copy the environment template and set your **leader form URL** (Google Form, Microsoft Form, etc.):

```bash
cp .env.example .env
# Edit .env — set QR_URL to your form link
python3 scripts/generate_config.py
python3 -m http.server 8080
```

Or use the helper script (regenerates config then serves):

```bash
cp .env.example .env   # first time only
./scripts/serve.sh
```

Open [http://localhost:8080/](http://localhost:8080/) in your browser. Use **F11** for fullscreen when presenting.

After changing `.env`, run:

```bash
python3 scripts/generate_config.py
```

Then **hard refresh** the browser (Ctrl+Shift+R). The page loads [`assets/config.json`](assets/config.json) with cache disabled so the QR code picks up the new URL.

## QR code / leader form (`.env`)

| Variable | Purpose |
|----------|---------|
| `QR_URL` | URL encoded in the QR on the last slide and in the Space-bar modal — point this at your leaders’ form. |
| `SLIDE_INTERVAL_MS` | Optional. Time on each slide (default `10000`). |
| `QR_MODAL_TITLE` | Optional. Heading inside the QR modal. |
| `QR_SLIDE_CAPTION` | Optional. Text above the QR on the last slide. |

Generated output: [`assets/js/config.js`](assets/js/config.js) (do not edit by hand; edit `.env` and re-run the script).

`.env` is gitignored; use [`.env.example`](.env.example) as the template.

## Controls

- Slides **auto-advance** every 10 seconds (loops). A **spinner** in the header shows time left on the current slide.
- **Chevron buttons** (Font Awesome) in the footer, or **←** / **→** (Page Up / Page Down) — previous and next slide (resets the timer).
- **Space** — open or close the QR code modal (animated; auto-advance pauses while the modal is open).
- **Escape** or click outside the modal — close the modal.
- Progress dots at the bottom — jump to a slide.
- The **Scouts logo** stays fixed in the header while slide content transitions.
- **Full screen** button (expand icon) in the header — or press **Escape** to exit full screen.

## Logo

The header uses [`assets/images/scouts-logo-purple.svg`](assets/images/scouts-logo-purple.svg) (UK Scouts wordmark). For official artwork and local personalisation, download from the [Scouts Brand Centre](https://www.scouts.org.uk/volunteers/running-things-locally/local-media-and-member-communications/our-brand/) and replace this file (PNG or SVG is fine).

## Images

Title slide video: [`assets/videos/paddle-hero.mp4`](assets/videos/paddle-hero.mp4) ([Aerial view of a river with a boat](https://www.pexels.com/video/aerial-view-of-a-river-with-a-boat-on-it-18141067/) on Pexels, free to use). Replace the file or update the `src` in `index.html` for your own clip.

## Content sources

Slide text is aligned with Scouts UK guidance on paddlesports, the adventurous activity permit scheme, and applicant guidance on [scouts.org.uk](https://www.scouts.org.uk/).
