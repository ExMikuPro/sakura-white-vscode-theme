# Sakura Contrast

Sakura White keeps its cream editor and pink workbench. Sakura Contrast separates syntax by hue and semantic role instead of using neighboring pink/purple tones for nearly everything. All 319 workbench colors are unchanged. The extension name, light-theme classification, fonts/layout/icon behavior and licenses are preserved; the supplied extension artwork is now registered as its Marketplace icon.

| Role | Previous | Sakura Contrast |
| --- | --- | --- |
| Keywords | `#943D68` | `#A62562` berry |
| Types, classes, interfaces, namespaces | `#6C5181` | `#6941A1` iris |
| Functions, methods | `#704E85` | `#245B91` deep blue |
| Strings, regexes | `#7F4C64` | `#276349` leaf green |
| Numbers, enum members, readonly constants | `#7A4E69` (numbers) | `#7D4B21` copper |
| Comments | `#6B5663` | `#515D69` cool gray |
| Variables | `#584B60` | `#414A5A` neutral slate |
| Parameters | `#705269` | `#414A5A` neutral slate |
| Properties | `#5A4B61` | `#47587A` blue gray |
| Macros, decorators, annotations | `#784E71` | `#84435C` deep berry |
| Operators | `#6D5366` | `#625068` muted purple |

`docs/sakura-contrast-palette.json` records the intended role colors. The validator asserts role agreement across TextMate and semantic tokens and guards perceptual separation with CIE76 distances. Function/type distance is **38.24**, above the regression minimum of 25; variable chroma stays below 20. These distances are engineering regression guards, not color-vision accessibility certification.

## TextMate and semantic priority

Semantic foreground rules take precedence when a language server supplies a matching token. Classes, structs, interfaces, enums, types, type parameters and namespaces use iris; functions/methods use blue; parameters/variables stay neutral; properties use blue gray; enum members and readonly constants use copper. The deprecated modifier adds a strike-through without replacing its base role color.

The 30 TextMate rules include targeted selectors found in actual VS Code grammars: Go and C/C++ primitive types, C# property declarations and primitive types, Java reference/generic types and annotations, Python call names/decorators/member attributes, Rust attributes/macros, JS constructors, TS object keys, and Shell expansions. Builtin functions are blue rather than macro-colored. JSON/YAML keys use the property color. Markdown fenced code retains the embedded language's colors, rather than inheriting a block-wide string color. No entire source file or function body is colored as a type/function workaround.

## Tests and limits

The existing grammar assertions are retained and expanded to **132 assertions across 15 languages**: Go, Python, Rust, C, C++, C#, Java, JavaScript, TypeScript, JSON, YAML, HTML, CSS, Markdown and Shell. Both the installed stable VS Code 1.146.0 grammars and the official 1.85.0 grammars were tested.

- Stable: all 132 token-color assertions pass.
- Minimum: all 132 expectations pass, including one explicitly recorded unscoped C++ fallback. VS Code 1.85's grammar leaves the type name at a particular declaration use unclassified; that exact scope stack is checked against the neutral editor foreground. A real semantic `type` token would make it iris. The test does not claim that lexical position is purple.
- Shell plain assignment literals are classified as unquoted strings in stable and numeric tokens in 1.85. Both classifications have exact scope-dependent color assertions. The upstream stable grammar also treats the first literal of one arithmetic-expression form as a command; a theme cannot distinguish that from a real command using those scopes alone.
- Plain C typedef uses, some Python variables/constructor calls, and Rust field names also lack sufficient lexical classification. Without a language server, C typedef uses inherit the editor foreground, Python constructor call names use the call color, and Rust fields use the variable color. Semantic type/property tokens refine these when supplied. C# attribute identifiers may be lexed as types; they remain iris unless the provider emits a decorator token.
- The integration harness requests real TypeScript semantic tokens and checks interface/function/property/parameter presence and their corresponding theme rules. The GUI token inspector additionally checks applied foreground values. This is not a complete Go/Python/Rust/C-family language-server matrix.

The contrast validator checks **671 text/background pairs at 4.5:1**, including selected text, search matches, current lines, alpha-composited diff/highlight backgrounds and existing UI pairs. No target palette color needed adjustment. Decorative strokes and arbitrary external/user colors are outside that audited set.

## Authentic previews / 真实预览

The three PNGs in `docs/images/` are actual **2880 × 1620 (16:9)** VS Code 1.146.0 captures, with the packaged theme installed in a disposable profile. They show Go/Python/Rust with Explorer and an ANSI terminal palette, C/C++/C#/Java in four editors, and JS/TS with a real completion popup, cursor and inactive selection. They reuse the checked-in fixture examples. The terminal displays an explicitly labeled ANSI sample, not a fabricated test run.

Only the temporary profile's presentation settings were adjusted: Menlo 13px, 21px line height, minimap/breadcrumbs hidden, editor groups and panel sizes arranged for legibility. Normal user settings are untouched. The capture API supplied JPEG bytes; those were converted to PNG without resizing or recoloring, then compressed with lossless DEFLATE and stripped of textual/EXIF metadata. No AI-generated editor image, compositing or copied theme promotion was used. The supplied icon is separate from these screenshots.

## GitHub and Marketplace images

Both source READMEs use relative Markdown PNG paths, so they render locally and in the feature branch. Packaging uses the official VSCE API with `githubBranch: main`; its primary README images become HTTPS `raw/main` URLs. VSCE does not rewrite the secondary Chinese README, so the build normalizes that file's links in a disposable staging directory. Neither source README is modified during packaging.

The package validator asserts the three exact HTTPS image URLs in **both** packaged READMEs, verifies the actual PNG files, and retains the strict package allowlist and text privacy scan. PNG icon bytes are matched to the approved source and its chunks are checked; compressed binary payload is not interpreted as credential text. The screenshots stay outside the VSIX. The 10 shipped files are the previous 9 plus `assets/icon.png`.

The `raw/main` image URLs become available after these assets are merged to main. Before merge, the feature branch's relative images can be reviewed on GitHub; HTTP availability on main cannot truthfully be claimed yet. No Marketplace publication is performed.

References: [Semantic highlighting](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide), [VSCE packaging and image requirements](https://code.visualstudio.com/api/working-with-extensions/publishing-extension), [VSCE README link rewriting](https://github.com/microsoft/vscode-vsce/blob/main/src/package.ts).
