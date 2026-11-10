# Xavier Cox portfolio

The main site is `index.html`, with `gallery.html` and `journal.html`. About opens at `index.html#about`. The showreel flips to the archive on a downward scroll or upward swipe; scrolling up or pressing Escape returns to the front. `index.html#archive` opens the archive directly. The domain remains `xaviercox.au`.

Run `python3 scripts/build-pages.py` to validate every local page, stylesheet, script and media dependency and prepare `.pages-dist/`. Only referenced delivery assets are copied. The build fails on a missing dependency, a site size of 950 MB, or a file size of 100 MiB. The current site is approximately 607 MB. `.pages-dist/` is generated output and can be removed after checking; GitHub Actions recreates it.

The workflow in `.github/workflows/pages.yml` builds and publishes on a push to `main`. Use **GitHub Actions** as the source in the repository's **Settings → Pages**. No npm install or separate server is needed. A branch-based static Pages setup also works with the root `.nojekyll` file.

The four project archive pages have been restored from Git history: Intrinsik (2026), Microcosm (2025), Beneath Your Eyes (2025), and Virtual Environment (2024). Their original styles, interactions, and required media are retained; project back arrows return to the homepage archive. Other experimental pages, duplicate source files and local archive folders remain removed following the owner's confirmation of a full external backup. Git history and editor preferences remain intact. All 34 selected gallery pieces and 117 journal entries remain. The showreel retains its approved 1080p MP4, and the journal animation remains 25 fps. Near-viewport images, batched journal entries and click-to-load videos reduce initial loading.

## Retained controls

- Journal: open `journal.html?edit=1` to access **LAYOUT / EDIT**, optional text fields, layout JSON and draft export. These controls stay hidden on the public page.
- Gallery: open `gallery.html?edit=1` to expose the existing grid settings.
- Archive: open `index.html?edit=1#archive` for live flip, gesture, size, movement, typography, spacing, colour, underline and contact-visibility controls. **Preview flip** turns the card. Experiments save only for edit-mode visits in this browser; **Copy values** exports JSON and **Reset defaults** restores the defaults in `assets/js/archive-settings.js`. Public visits use those defaults.
- Jeff: the hover and transition control templates remain at the bottom of `index.html`. Restore the relevant template's contents to the live document to tune it. Approved values remain in `assets/js/home.js` and `assets/js/transition.js`.

Journal layout and text drafts still save in the current browser under the existing storage keys. Export drafts as JSON to keep them or apply them as website defaults. Gallery and journal media data live in `assets/js/gallery-data.js` and `assets/js/journal-data.js`.

## Release checks

The release was checked in Safari 18.6, including its 390 × 844 responsive viewport, and the Chromium-based preview at desktop, 320 × 568, 390 × 844, 768 × 1024, and 844 × 390 sizes. Checks covered navigation, the Jeff/showreel transition, About, gallery media, journal paging and deferred loading. Physical-device testing is still distinct from these browser and viewport checks.

The variable font is served as WOFF2, with all original glyphs and variation axes preserved. Hidden homepage animation is suspended while About is open or the tab is hidden. Touch devices have larger player and close-button targets. On devices that do not allow software volume adjustment, the nonfunctional slider stays hidden while mute and the device's volume buttons remain available; see [Apple's media guidance](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html).

The delivery video files use H.264 for broad Safari, Chrome and mobile playback. The panoramic Intrinsik clip was converted from AV1 to H.264 at the same 4:1 aspect ratio.

On touch-first devices or a page initially opened at 760 px wide or narrower, the showreel uses the native inline player directly, with no custom Play Video box. Its source is assigned after Jeff opens, with muted autoplay attempted; when the browser declines autoplay, its native play control remains available. Native controls handle sound, buffering, seeking and fullscreen. Leaving the homepage or flipping to the archive pauses playback; returning keeps the native player paused for the visitor to resume. Desktop keeps its preloading, perimeter loader and custom controls, and resumes after a flip unless the visitor paused it. Device mode is selected once on page opening so orientation changes cannot replace an active player. The archive uses the approved 12 px list typography, inline years, underlined links, and contact line, with no Gallery link. The reverse face scrolls internally on compact screens, with padding capped at 16 px below 761 px viewport width.

The restored Intrinsik screen sequences use H.264 MP4 delivery files at the original 4:1 display ratio, with metadata placed first for progressive playback. The Pages build also collects the archive's preview, full-video, and fallback-image attributes.

The showreel MP4 stores its `moov` metadata before the media payload for progressive playback. Its video/audio payload is unchanged; relocating metadata requires no re-encoding or quality loss. A source URL version prevents older cached copies from masking this change.

## 10 November 2026 pre-commit check

The in-app browser check covered desktop and phone layouts, Jeff opening, showreel playback, the archive flip and pause behavior, direct archive returns, About, gallery media opening/closing, journal video loading and document paging, Intrinsik photo navigation and its more panel, Microcosm interface switching and scene selection, and both YouTube-backed archive pages. Mobile archive padding is capped at 16 px; Intrinsik holds its rotation while a control is hovered so clicks remain reliable. Physical iPhone playback remains a separate device check.

All 19 delivery scripts passed syntax validation; all 44 local video files are readable H.264. The Pages artifact includes 269 validated files at approximately 607 MB, below the 950 MB site budget and the 100 MiB per-file limit. The deleted Microcosm monitor experiment is absent. CI syntax checks include both root-level and asset scripts.
