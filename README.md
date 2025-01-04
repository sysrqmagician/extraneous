# Extraneous
<img src="https://raw.githubusercontent.com/sysrqmagician/extraneous/refs/heads/main/assets/logo.png" width="150" />

A WebExtension for Invidious, written in TypeScript using Deno.

<<<<<<< HEAD
[![Get the Add-On for Firefox](https://raw.githubusercontent.com/sysrqmagician/extraneous/refs/heads/main/assets/get-the-addon-small.webp)](https://addons.mozilla.org/en-US/firefox/addon/extraneous/)
## Features
||||||| parent of f48dc64 (docs: rename roadmap header)
## Features
=======
## Development Roadmap
>>>>>>> f48dc64 (docs: rename roadmap header)
- [x] Keep track of watched videos and higlight them
- [x] DeArrow
  - [x] Playlist, Watch Page, Feeds
  - [x] Caching
  - [x] Compliance with implementation details from DeArrow documentation
    - [x] Thumbnail returned by branding
    - [x] Thumbnail fallback
    - [x] Title fallback
    - [x] Title auto-formatting / Removal of auto-formatting characters
    - [x] Only show trusted titles
  - [x] Proper fallbacks
- [x] Hide videos under certain duration or with title matching regex
- [ ] Create collections of channels
- [ ] Cobalt.tools integration
  - [ ] Replace downloader section with cobalt.tools integration
  - [ ] Offer to stream from cobalt.tools download on watch page error (if possible)


## Installing
### Firefox via AMO (recommended)
You can install extraneous for Firefox like any other extension by clicking [here](https://addons.mozilla.org/en-US/firefox/addon/extraneous/).

### Manually
#### Firefox
1. Download [the latest version of the extension](https://github.com/sysrqmagician/extraneous/releases/latest/download/extension.zip)
2. In Firefox Developer Edition (recommended) or Firefox Nightly, navigate to ``about:config`` and set ``xpinstall.signatures.required`` to ``false``
3. Navigate to ``about:addons`` and open the cogwheel dropdown menu.
4. Click ``Install Add-On From File...`` and select the zip file in the dialog
5. Press confirm on the warning that pops up

#### Chromium-based
There is no official listing for extraneous in the Chrome Web Store. Support offered for Chromium is limited, but the extension should work nonetheless.

1. Download [the latest version of the extension](https://github.com/sysrqmagician/extraneous/releases/latest/download/extension.zip).
2. Extract the ``extension.zip`` into a separate folder.
3. Navigate to ``chrome://extensions``.
4. Enable Developer mode by clicking the toggle in the top-right corner.
5. Click ``Load unpacked`` and select the directory you extracted the extension into.
6. A "safety check" will pop up. Choose to keep the extension.
