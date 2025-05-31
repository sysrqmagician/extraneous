# Changelog
All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

- - -
## v1.8.1 - 2025-05-31
#### Bug Fixes
- **(core)** stop importing content scripts - (492af17) - sysrqmagician

- - -

## v1.8.0 - 2025-05-31
#### Features
- **(popup)** Add data import/export/reset - (be2fa80) - sysrqmagician
#### Miscellaneous Chores
- **(core)** clean up injectScript - (c86eae4) - sysrqmagician
- **(core)** remove echo background request - (5163919) - sysrqmagician

- - -

## v1.7.0 - 2025-03-04
#### Bug Fixes
- **(core)** properly log erroring video element while extracting info - (0cc96ca) - sysrqmagician
#### Features
- **(additionalLinks)** Add cobalt tools link to watch error page - (d1c02ad) - sysrqmagician
- **(core)** Improve compatibility of extraction - (d269746) - sysrqmagician

- - -

## v1.6.0 - 2025-01-08
#### Features
- **(deArrow)** underline replaced titles by default - (de19f68) - sysrqmagician
- **(deArrow)** options to stop replacing titles/thumbnails - (8af371a) - sysrqmagician

- - -

## v1.5.0 - 2025-01-06
#### Bug Fixes
- **(watched)** make the watched button readable in light-mode - (a85ac8b) - sysrqmagician
#### Features
- **(additionalLinks)** additionalLinks module with prefilled cobalt.tools link - (239e401) - sysrqmagician
- **(hideSlop)** if regex is empty, don't evaluate title - (8bd14db) - sysrqmagician
#### Miscellaneous Chores
- update labels on GitHub issue templates - (26adb7a) - sysrqmagician
#### Refactoring
- camelCase module files - (70e28fe) - sysrqmagician

- - -

## v1.4.0 - 2025-01-06
#### Features
- **(deArrow)** optionally highlight replaced titles - (8a1e2db) - sysrqmagician

- - -

## v1.3.0 - 2025-01-04
#### Features
- **(core)** style popup and give user feedback when saving input, closes #2 - (22d24b8) - sysrqmagician
- **(watched)** ability to specify watched video CSS filter, closes #7 - (1ca35bf) - sysrqmagician
#### Style
- run formatter over src/ - (be6b25c) - sysrqmagician

- - -

## v1.2.0 - 2025-01-04
#### Documentation
- rename roadmap header - (dfe3d9b) - sysrqmagician
- extraneous is now available via AMO, updated install instructions and added manual install for chromium - (31acf0b) - sysrqmagician
- Upload "Get The Add-On" button from AMO - (b161795) - sysrqmagician
- roadmap consistency - (3957885) - sysrqmagician
- roadmap wording - (779f13c) - sysrqmagician
- new install instructions in README - (ebef306) - sysrqmagician
#### Features
- **(deArrow)** option to hide thumbnails until dearrow data is fetched, closes #8 - (2f47f08) - sysrqmagician

- - -

## v1.1.1 - 2025-01-02
#### Documentation
- correct date in changelog - (4c01b62) - sysrqmagician
- add v1.0.0 changelog - (8841765) - sysrqmagician
#### Miscellaneous Chores
- use logo in extension - (aea6811) - sysrqmagician

- - -

## v1.1.0 - 2025-01-02
#### Bug Fixes
- **(hideSlop)** hiding works properly on next watch feed again - (9d8755c) - sysrqmagician
#### Documentation
- update DeArrow roadmap - (1d8fbe3) - sysrqmagician
- display programmer art - (366984d) - sysrqmagician
#### Features
- **(core)** config migration - (f34c1d0) - sysrqmagician
- **(deArrow)** only show trusted titles, unless opt-in to untrusted titles - (7ea9fe4) - sysrqmagician
- **(deArrow)** replace vjs poster on watch page - (2fb45f0) - sysrqmagician
- **(deArrow)** proper duration fallback, remove autoformatting char, code cleanup - (583f68e) - sysrqmagician
#### Miscellaneous Chores
- add programmer art - (be068ac) - sysrqmagician
#### Refactoring
- **(core)** rename popup.ts to config_popup.ts - (ba95cf2) - sysrqmagician
- clean up object accessors - (9497a05) - sysrqmagician

- - -

## v1.0.0 - 2024-12-31
#### Bug Fixes
- **(core)** log errors when extracting from miniplaylist and return successes - (c631143) - sysrqmagician
- **(deArrow)** check if response title is present on video page - (104413d) - sysrqmagician
- **(deArrow)** still return thumbnail if no title found - (2026f8e) - sysrqmagician
- log errors when extracting from feed and return successes - (27d3e7a) - sysrqmagician
- include /playlist as feed path - (7133cee) - sysrqmagician
- remove thumbnail caching due to storage quota - (132131a) - sysrqmagician
- add search path as feed pagetype - (95e6645) - sysrqmagician
- include deno.ns for build.ts - (109e93c) - sysrqmagician
- hook up deArrowVideoPage in content.ts - (6879215) - sysrqmagician
- hide parent of video to collapse grid space - (6cc39e6) - sysrqmagician
- use more universal tag for better detection - (b24d1a7) - sysrqmagician
- sync label on video end - (a276707) - sysrqmagician
#### Build system
- enable minification - (3ba7b32) - sysrqmagician
#### Documentation
- wording in background.ts - (e5f7171) - sysrqmagician
- Update DeArrow roadmap - (8567f6c) - sysrqmagician
- Add documentation to extractor - (61d5c9a) - sysrqmagician
- Add documentation to modules - (a6e7fc6) - sysrqmagician
- Add documentation to background.ts - (af4e9c6) - sysrqmagician
- Update roadmap - (df5933f) - sysrqmagician
- Update DeArrow section of Roadmap - (78a563b) - sysrqmagician
- Add issue templates - (731ab5f) - sysrqmagician
- Update README roadmap - (c623b54) - sysrqmagician
- Add README with description, features and install instructions - (a66cd86) - sysrqmagician
- Create LICENSE - (d1d0c68) - sysrqmagician
#### Features
- **(core)** apply modules to sidebar playlist - (d6c085d) - sysrqmagician
- **(deArrow)** fallback to X-Title from thumbnail service - (ed92909) - sysrqmagician
- **(deArrow)** proper thumbnail handling per documentation - (b468835) - sysrqmagician
- **(deArrow)** caching of titles and thumbnails in session storage - (cc368a4) - sysrqmagician
- DeArrow for playing video, original title in tooltip - (22bf9d1) - sysrqmagician
- DeArrow integration - (32db932) - sysrqmagician
- implement video hiding - (1a02681) - sysrqmagician
- work on all invidious instances - (256209a) - sysrqmagician
- set video to watched when it ends - (ec65c16) - sysrqmagician
- highlight watched videos - (9fc9471) - sysrqmagician
- normalize urls - (747f6bc) - sysrqmagician
- error handling for parser - (993763e) - sysrqmagician
- basic video recommendations parsing - (55e623f) - sysrqmagician
#### Miscellaneous Chores
- reset version to 1.0.0 for AMO submission - (9fcd612) - sysrqmagician
- version bump - (219acb9) - sysrqmagician
- make linter happy and update lockfile - (f9dff5b) - sysrqmagician
- add gecko id - (b072a01) - sysrqmagician
- initial commit with scaffolding - (e6d1308) - sysrqmagician
#### Refactoring
- **(core)** attempt to make mini-playlist extraction observation more readable - (a01bfb9) - sysrqmagician
- **(core)** renamed <module>FeedPage() to <module>Feed() - (e5b0f05) - sysrqmagician
- capitalize Justfile filename - (b5fa0c6) - sysrqmagician
- remove unused imports - (291bc3d) - sysrqmagician
- split modules into separate files, rename extraction error - (e2a947b) - sysrqmagician
- only store watched state once, in label - (2c16017) - sysrqmagician
- we are extracting using queries, not parsing - (2f34547) - sysrqmagician
- remove the defined option type - (f45580b) - sysrqmagician
- reduced duplication as the same queries work universally for now. made parseBasic more concise. - (31079d9) - sysrqmagician
#### Style
- make LSP happy by making modules lowercase - (41cc652) - sysrqmagician

- - -

Changelog generated by [cocogitto](https://github.com/cocogitto/cocogitto).
