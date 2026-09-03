# GIF To Spritesheet

Convert animated GIFs into game-ready spritesheets plus TexturePacker-style frame-data JSON.
Free, private, and fast — everything runs 100% in the browser, no uploads.

Built with the latest **Vue 3** stack: Vue `^3.5` · Vite `^8` · TypeScript · Tailwind CSS v4 · JSZip.

## Features

- **Batch convert** one or many `.gif` files via drag & drop or file picker
- **Output settings** (same as the original app, plus grid columns):
  - Frame size — width / height in px (`0` = auto, one side set keeps aspect ratio)
  - Quality slider (1–100, applies to JPEG / WEBP)
  - Format — PNG (lossless + transparency), JPEG (smallest), WEBP (modern)
  - Columns per row (1–10, default 10 — the classic layout)
- **Live preview** of every sheet on a transparency checkerboard, with frame count,
  frame size, sheet size and file size per sheet
- **Export**: one-click ZIP with all sheet images + `.json` frame maps (identical
  `{ frames, meta }` hash format as before), or download individual images / JSON files
- **Progress overlay** with per-file stage, progress bar and file counter
- Fully responsive dark UI with empty states, validation and error handling

## Getting started

Requirements: Node.js 20+ (22+ recommended) and npm.

```sh
npm install
npm run dev      # start dev server with HMR
```

```sh
npm run build    # vue-tsc typecheck + production build to dist/
npm run preview  # serve the production build locally
npm run lint     # eslint (Vue + TypeScript)
npm run typecheck
```

## How it works

1. Each GIF is read as bytes and decoded frame-by-frame with the bundled GIF parser
   (`src/utils/gifDecoder.ts`, `src/utils/gif.ts`).
2. Frames are resized on canvas (`src/utils/images.ts`), preserving aspect ratio when
   one dimension is `0` and keeping the original size when both are `0`.
3. Frames are packed left → right, top → bottom into a sheet canvas and exported in the
   chosen format (`src/utils/spritesheet.ts`), alongside a JSON frame map compatible
   with PixiJS / Phaser / Unity importers.
4. All results are zipped client-side with JSZip (`src/composables/useGifConverter.ts`).

## Project structure

```
src/
  App.vue                  # layout, hero, converter + results orchestration
  main.ts                  # app entry
  style.css                # Tailwind v4 theme, sliders, checkerboard, animations
  types.ts                 # ISpritesheet, TBuffer, TFrame, settings types
  components/
    AppNav.vue             # sticky header
    AppFooter.vue          # credits footer
    FileDropzone.vue       # drag & drop GIF picker + file list
    SettingsForm.vue       # size / quality / format / columns (v-model)
    ResultToolbar.vue      # result stats + Download ZIP + Convert more
    PreviewGrid.vue        # sheet cards with meta + per-file downloads + JSON peek
    ProcessingLoader.vue   # full-screen progress overlay
  composables/
    useGifConverter.ts     # conversion pipeline + ZIP download + state
  utils/
    gifDecoder.ts          # vendored GIF frame parser (excluded from lint)
    gif.ts                 # promise wrapper around the decoder
    arrays.ts              # file/byte helpers
    images.ts              # canvas resize helpers
    spritesheet.ts         # sheet packing + JSON generation
```

## Credits

Original concept by **Ariel Francis Fernando Gacilo** — gaciloarielfrancis@gmail.com.
Rebuilt from React 19 to Vue 3 with a redesigned UI; conversion behavior preserved.
