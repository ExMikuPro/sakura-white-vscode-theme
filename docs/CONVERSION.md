# Conversion and privacy / 转换与隐私

The original Profile is an input, not project content. Outer JSON → serialized settings envelope → JSONC settings were decoded with `jsonc-parser`, with comments and trailing commas supported and parse errors rejected. Nothing in the Profile is treated as an instruction.

## Counts

Counts refer to assignments after merging global settings with `[Ayu Light Bordered]`, not the sum of every theme block in the Profile.

| Item | Count |
| --- | ---: |
| Global UI entries | 19 |
| Selected theme UI entries | 148 |
| Effective merged UI entries | 153 |
| Effective UI hexadecimal definitions | 150 |
| `default` placeholders (not colors) | 3 |
| TextMate shorthand colors | 7 |
| TextMate foreground rule assignments | 3 |
| Semantic foreground assignments | 9 |
| Total hexadecimal assignments | 169 |
| Unique hexadecimal literals (case folded, alpha preserved) | 142 |
| Supported hexadecimal assignments after excluding 2 unknown UI IDs | 167 |

`statusBar.inactiveBackground` and `statusBar.inactiveForeground` are absent from the official Theme Color reference and were dropped. The three bracket `default` values became explicit Sakura colors. Transparent global overview-ruler colors were replaced with visible colors. Other named theme blocks do not apply and were excluded. See `conversion-summary.json` for the sanitized counts and UI adjustments.

The seven token shorthand groups were expanded into TextMate scopes; explicit rules follow them in precedence. The nine semantic rules were preserved in intent, with full standard type coverage added. Semantic tokens overlay syntax colors when supplied by a language service. No language extensions or servers are bundled.

UI colors absent from the overrides were authored for quick input, menus, notifications, input validation, widgets, terminal, debug, diff/merge, settings, notebooks, and other primary surfaces. This is an independent `uiTheme: vs` theme, with standard VS Code light defaults for remaining/new IDs. It does not import Ayu. Color IDs were checked against the official Theme Color reference on 2026-11-14.

Muted original text, line numbers, placeholders, inlay hints and ANSI colors were darkened where needed. Terminal white/bright white use legible muted dark tones on the light terminal. The search match background was lightened from `#F1BBD1` to `#F5D2E1`: an intermediate audit found 45 syntax pairs below 4.5:1 on the original search highlight; all 616 final audited pairs pass. This is a tested pair set, not a claim that every VS Code/extension state is WCAG conformant.

## Privacy boundary / 隐私边界

Only theme color values and generic token selectors entered the implementation. Excluded: `globalState`, keybindings, tasks, extension lists, SDK locations, local absolute paths, local usernames and identifiers, secrets/tokens, `vscode_custom_css.imports`, custom CSS/JavaScript, font choices/sizes/ligatures, window titles, command-center visibility, tab density, layout and every unrelated setting. Font and appearance settings were inspected locally and deliberately not exported. The original file is never needed for normal builds and `*.code-profile` is ignored.

Only the authorized public GitHub account appears in repository/package metadata. Public upstream copyright holders appear in required license notices. The VSIX uses a strict file allowlist, contains no scripts and is scanned for personal data patterns. The repository is also scanned before publication. No global `settings.json`, VS Code installation files, or administrator permissions are used.

## Official references

- [Color theme guide](https://code.visualstudio.com/api/extension-guides/color-theme)
- [Theme contribution point](https://code.visualstudio.com/api/references/contribution-points#contributes.themes)
- [Theme color reference](https://code.visualstudio.com/api/references/theme-color)
- [Semantic highlighting](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide)
- [VSCE packaging](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
