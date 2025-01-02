# Extraneous
<img src="https://raw.githubusercontent.com/sysrqmagician/extraneous/refs/heads/main/assets/logo.png" width="150" />

A WebExtension for Invidious, written in TypeScript using Deno.

## Features
- [x] Keep track of watched videos and higlight them.
- [x] DeArrow
  - [x] Playlist, Watched Videos
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
For now, you will have to install the extension manually. The submission to AMO is awaiting review.

1. Download [the latest version of the extension](https://github.com/sysrqmagician/extraneous/releases/latest/download/extension.zip)
2. In Firefox Developer Edition (recommended) or Firefox Nightly, navigate to ``about:config`` and set ``xpinstall.signatures.required`` to ``false``
3. Navigate to ``about:addons`` and open the cogwheel dropdown menu. Click ``Install Add-On From File...`` and select the zip file in the dialog
4. Press confirm on the warning that pops up
