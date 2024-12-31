# Extraneous
A WebExtension for Invidious, written in TypeScript using Deno.

## Features
- [x] Keep track of watched videos and higlight them.
- [ ] DeArrow
  - [x] Basic DeArrow loading for video feeds and watched video
  - [x] Display original title on hover
  - [ ] Special case for playlists
  - [x] Caching
  - [x] Fallback to X-Title as described in docs
  - [x] Match thumbnail with branding request
  - [x] Retry with time on error
- [x] Hide videos under certain duration or with title matching regex
- [ ] Create collections of channels
- [ ] Cobalt.tools integration
  - [ ] Replace downloader section with cobalt.tools integration
  - [ ] Offer to stream from cobalt.tools download on watch page error (if possible)


## Installing
For now, you will have to build the extension yourself and install it manually.

1. Clone the repository and install ``deno`` and ``just``
2. Run ``just package``.
3. If the build is successful, you should now be the proud owner of an ``extension.zip`` file in the repository's root directory. Pat yourself on the back.
4. In Firefox Developer Edition (recommended) or Firefox Nightly, navigate to ``about:config`` and set ``xpinstall.signatures.required`` to ``false``.
5. Navigate to ``about:addons`` and open the cogwheel dropdown menu. Click ``Install Add-On From File...`` and select the zip file in the dialog.
6. Press confirm on the warning that pops up.
