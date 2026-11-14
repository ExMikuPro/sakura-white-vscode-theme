# Verification record / 实际验证记录

## Sakura Contrast update — 2026-11-14

The current update has 30 TextMate rules / 26 semantic rules and **671/671** passing contrast pairs. Stable 1.146.0 and minimum 1.85.0 grammars each pass **132 assertions across 15 languages**; one exact unscoped C++ fallback on 1.85 is recorded explicitly. The original 319 workbench colors are unchanged.

The stable integration test also received 24 real TypeScript semantic tokens, including interface/function/method/property/parameter/variable types. Actual GUI token inspection confirmed function `#245B91` (6.96:1), type `#6941A1` (7.22:1) and property `#47587A` (7.04:1), with the corresponding semantic theme rule taking effect. Three real 2880×1620 previews were recaptured.

The supplied PNG icon is registered and included. The package allowlist now has 10 files; preview PNGs stay out of the VSIX. Both packaged READMEs have verified HTTPS image targets on main. These URLs will become live after merge; no Marketplace publication has taken place.

See [Sakura Contrast](SAKURA-CONTRAST.md) for the palette, lexical grammar limitations, capture provenance and packaging behavior. CI adds a Linux 1.85.0 runtime job alongside stable Windows/macOS/Linux jobs; use PR checks for actual remote outcomes. The original verification record below describes the pre-Contrast version.

## Original 0.1.0 verification

Local verification: **2026-11-14 (Asia/Tokyo)**, macOS arm64, Node.js 26.13.0, npm 11.20.0, VSCE 4.1.1.

| Check | Actual result |
| --- | --- |
| Original nested JSON/JSONC | Passed with jsonc-parser, zero parse errors; 169 effective hex assignments / 142 unique literals; 167 assignments use supported color IDs |
| Theme and manifest structure | Passed; `contributes.themes`, `uiTheme: vs`, `type: light`, no activation entry point or runtime dependencies |
| UI ID verification | All 319 IDs present in official Theme Color reference at inspection time |
| Hex values, TextMate rules, semantic selectors/styles | Passed: 319 UI colors, 25 TextMate rules, 26 semantic rules |
| WCAG 2 AA normal text | 616 / 616 tested pairs ≥ 4.5:1, including alpha-composited selection, search and diff backgrounds, widgets, status bar and all terminal ANSI colors |
| Grammar coloring, current VS Code 1.146.0 | Passed: 11 languages, 36 exact token-color assertions using vscode-textmate and the actual installed grammars |
| Grammar coloring, minimum VS Code 1.85.0 | Passed: same 11 languages and 36 assertions using the officially downloaded 1.85.0 grammars |
| VSIX build | Passed using official `@vscode/vsce package --no-dependencies` |
| VSIX contents/privacy | Passed: exact 9-file allowlist, secret/path pattern scan, theme and license/doc content comparisons; no Profile, source tests, tools, node_modules or binaries |
| Installation and theme enablement | Passed in isolated VS Code 1.146.0; CLI installed the VSIX, extension host discovered version 0.1.0, theme setting was Sakura White, active kind was Light, Ayu absent |
| Actual GUI | Inspected isolated VS Code 1.146.0 via computer-use: real TypeScript sample, cream editor, pink sidebars/tabs/status bar, berry keywords and purple types/functions. No generated mockup used. Screenshot was observed in-session, not committed |
| Dependency audit | npm audit: 0 vulnerabilities including development dependencies; no runtime dependencies |
| Git hygiene | Staged diff whitespace check and source privacy scan completed before push; GitHub noreply identity used |

An intermediate contrast audit found 45 failures on the original search-match background (approximately 4.07–4.15:1). Lightening that background resolved them. The original muted text/ANSI colors were also adjusted; conversion-summary.json records UI changes. Reports are regenerated under `dist/`; the VSIX checksum is recorded in `dist/package-report.json`.

## Limitations / 未完成的运行时验证

- VS Code 1.85.0 was downloaded from the official update service. Its Electron CLI exited with status 1 and no diagnostic text on this macOS host; minimum-version installation/GUI testing therefore did **not** pass. A separate cached 1.85.2 executable behaved the same way. This is recorded as unverified runtime compatibility; the minimum-version grammar tests did pass.
- Windows/Linux local GUI tests were not available. The GitHub Actions workflow defines independent Windows, Linux and macOS validation/package/installation jobs; consult PR checks for their actual results.
- The language tests check representative TextMate grammar scopes and exact resulting colors. They are not exhaustive grammar tests. Semantic selector/style validation passed; no full Go/Python/Rust language-server matrix or renderer pixel comparison was performed.
- The contrast audit covers specified text/background pairs, not decorative UI strokes, every extension-contributed surface, terminal applications that override colors, or all combinations of user customizations.
- Marketplace publisher registration/ownership and Marketplace installation are unverified. No merge, GitHub Release or Marketplace publication was performed.
