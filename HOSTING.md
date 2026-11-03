# Xavier Cox portfolio

The main site is `index.html`, with `gallery.html` and `journal.html`. About opens at `index.html#about`. The domain remains `xaviercox.au`.

Run `python3 scripts/build-pages.py` to validate every local page, stylesheet, script and media dependency and prepare `.pages-dist/`. Only referenced delivery assets are copied. The build fails on a missing dependency, a site size of 950 MB, or a file size of 100 MiB. The current site is approximately 544 MB. `.pages-dist/` is generated output and can be removed after checking; GitHub Actions recreates it.

The workflow in `.github/workflows/pages.yml` builds and publishes on a push to `main`. Use **GitHub Actions** as the source in the repository's **Settings → Pages**. No npm install or separate server is needed. A branch-based static Pages setup also works with the root `.nojekyll` file.

The old public site, experimental pages, duplicate source files and local archive folders have been removed following the owner's confirmation of a full external backup. Git history and editor preferences remain intact. All 34 selected gallery pieces and 117 journal entries remain. The showreel retains its approved 1080p MP4, and the journal animation remains 25 fps. Near-viewport images, batched journal entries and click-to-load videos reduce initial loading.

## Retained controls

- Journal: open `journal.html?edit=1` to access **LAYOUT / EDIT**, optional text fields, layout JSON and draft export. These controls stay hidden on the public page.
- Gallery: open `gallery.html?edit=1` to expose the existing grid settings.
- Jeff: the hover and transition control templates remain at the bottom of `index.html`. Restore the relevant template's contents to the live document to tune it. Approved values remain in `assets/js/home.js` and `assets/js/transition.js`.

Journal layout and text drafts still save in the current browser under the existing storage keys. Export drafts as JSON to keep them or apply them as website defaults. Gallery and journal media data live in `assets/js/gallery-data.js` and `assets/js/journal-data.js`.

## Release checks

The release was checked in Safari 18.6, including its 390 × 844 responsive viewport, and the Chromium-based preview at desktop, 320 × 568, 390 × 844, 768 × 1024, and 844 × 390 sizes. Checks covered navigation, the Jeff/showreel transition, About, gallery media, journal paging and deferred loading. Physical-device testing is still distinct from these browser and viewport checks.

The variable font is served as WOFF2, with all original glyphs and variation axes preserved. Hidden homepage animation is suspended while About is open or the tab is hidden. Touch devices have larger player and close-button targets. On devices that do not allow software volume adjustment, the nonfunctional slider stays hidden while mute and the device's volume buttons remain available; see [Apple's media guidance](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html).

All 35 local video files use H.264 for broad Safari, Chrome and mobile playback. The panoramic Intrinsik clip was converted from AV1 to H.264 at the same 4:1 aspect ratio.

On touch-first devices or a page initially opened at 760 px wide or narrower, the showreel follows the journal's tap-to-load model: Jeff transitions to the red surface, then **PLAY VIDEO** loads the MP4 directly from that tap with sound and native inline controls. There is no readiness or autoplay gate, and the video is not downloaded before that tap. Native controls handle buffering, seeking and fullscreen. Leaving the homepage pauses playback; returning keeps it paused for the visitor to resume. Desktop keeps its preloading, perimeter loader and custom controls. Device mode is selected once on page opening so orientation changes cannot replace an active player.
