# Calculator

## Basic arithmetic

| Capability         | Syntax / Supported Symbols                      | Example Input | Normalized / Interpreted As | Result Output | Notes & Edge Cases                                         |
|:-------------------|:------------------------------------------------|:--------------|:----------------------------|:--------------|:-----------------------------------------------------------|
| Addition           | `+`, `＋` (Fullwidth)                           | `12 + 8`      | `12 + 8`                    | `20`          | Standard binary addition                                   |
| Subtraction        | `-`, `−` (U+2212), `–` (En-dash), `—` (Em-dash) | `45 − 15`     | `45 - 15`                   | `30`          | Supports ASCII and Unicode minus/dash variants             |
| Multiplication     | `*`, `×` (U+00D7), `✕` (U+2715), `✖` (U+2716) | `6 × 7`       | `6 * 7`                     | `42`          | Supports asterisk and Unicode multiplication signs         |
| Division           | `/`, `÷` (U+00F7)                               | `144 ÷ 12`    | `144 / 12`                  | `12`          | Division by zero returns `Undefined`                       |
| Exponentiation     | `^`, `＾` (Fullwidth)                           | `2 ^ 8`       | `2 ^ 8`                     | `256`         | Right-associative power operator                           |
| Modulo / Remainder | `mod`                                           | `17 mod 5`    | `17 mod 5`                  | `2`           | Mathematical floored modulo; `x mod 0` returns `Undefined` |

## Advanced math

| Capability  | Syntax / Supported Symbols | Example Input                       | Normalized / Interpreted As | Result Output | Notes & Edge Cases                                                                                                              |
|:------------|:---------------------------|:------------------------------------|:----------------------------|:--------------|:--------------------------------------------------------------------------------------------------------------------------------|
| Square Root | `sqrt`, `√` (U+221A)       | `sqrt(144)` or `√144` or `sqrt(-4)` | `sqrt(-4)`                  | `2i`          | Works with or without parentheses; negative inputs return imaginary numbers with `i` (e.g. `sqrt(-1)` = `i`, `sqrt(-4)` = `2i`) |
| Factorial   | `!`, `！` (Fullwidth)      | `5!`                                | `5!`                        | `120`         | Supports non-negative integers up to `170!`; non-integers, negative numbers, or `>170` return `Undefined`                       |

## Percentages

| Capability             | Syntax / Supported Symbols          | Example Input | Normalized / Interpreted As | Result Output | Notes & Edge Cases                                      |
|:-----------------------|:------------------------------------|:--------------|:----------------------------|:--------------|:--------------------------------------------------------|
| Standalone Percentage  | `%`, `٪` (Arabic), `％` (Fullwidth) | `25%`         | `25 / 100`                  | `0.25`        | Converts percentage to decimal value                    |
| Percentage Addition    | `+ [num]%`                          | `100 + 15%`   | `100 + (100 * 0.15)`        | `115`         | Adds calculated percentage of base to base value        |
| Percentage Subtraction | `- [num]%`                          | `200 - 20%`   | `200 - (200 * 0.20)`        | `160`         | Subtracts calculated percentage of base from base value |

## Trigonometry

| Capability  | Syntax / Supported Symbols                | Example Input                            | Normalized / Interpreted As | Result Output | Notes & Edge Cases                                                                      |
|:------------|:------------------------------------------|:-----------------------------------------|:----------------------------|:--------------|:----------------------------------------------------------------------------------------|
| Sine        | `sin`, `sind`, `sindeg`, `sinr`, `sinrad` | `sin(30deg)` or `sind 30`                | `sin(30°)`                  | `0.5`         | Default angle unit applies if omitted; prefix and word variants supported               |
| Cosine      | `cos`, `cosd`, `cosdeg`, `cosr`, `cosrad` | `cos(0)` or `cos 60deg`                  | `cos(0)`                    | `1`           | Supports degrees and radians via function name or unit argument                         |
| Tangent     | `tan`, `tand`, `tandeg`, `tanr`, `tanrad` | `tan(45deg)`                             | `tan(45°)`                  | `1`           | Singularity check: returns `Undefined` when `abs(cos(rad)) < 1e-12` (e.g. `tan(90deg)`) |
| Angle Units | `deg`, `rad`, `°`, `˚`, `º`, `∘`          | `sin(90°)`, `cos(45)deg`, `sin(1.57rad)` | `sin(90deg)`                | `1`           | Degree symbols (`°`, `˚`, `º`, `∘`) automatically normalize to `deg`                    |

## Grouping, signs, and implicit multiplication

| Capability                             | Syntax / Supported Symbols | Example Input           | Normalized / Interpreted As | Result Output | Notes & Edge Cases                                             |
|:---------------------------------------|:---------------------------|:------------------------|:----------------------------|:--------------|:---------------------------------------------------------------|
| Parentheses / Grouping                 | `()`, `（）` (Fullwidth)   | `(2 + 3) * (4 + 1)`     | `(2 + 3) * (4 + 1)`         | `25`          | Explicit expression grouping; fullwidth parentheses normalized |
| Unary Positive                         | `+`                        | `+5 + 3`                | `5 + 3`                     | `8`           | Positive unary sign prefix                                     |
| Unary Negative                         | `-`, `−`, `–`, `—`         | `-5 * -3` or `-(2 + 4)` | `-5 * -3`                   | `15`          | Negative unary sign; wraps negative numbers in parentheses     |
| Implicit Multiplication (Parentheses)  | `N(E)`                     | `2(3 + 4)`              | `2 * (3 + 4)`               | `14`          | Implied multiplication before open parenthesis                 |
| Implicit Multiplication (Square Root)  | `N sqrt E`                 | `3 sqrt 9`              | `3 * sqrt(9)`               | `9`           | Implied multiplication before square root                      |
| Implicit Multiplication (Trigonometry) | `N trig E`                 | `2 sin 30deg`           | `2 * sin(30°)`              | `1`           | Implied multiplication before trigonometric function           |

## Typing resilience

| Capability                 | Behavior / Mechanism          | Example Input           | Normalized / Interpreted As | Result Output | Notes & Edge Cases                                                              |
|:---------------------------|:------------------------------|:------------------------|:----------------------------|:--------------|:--------------------------------------------------------------------------------|
| Trailing Operator Trimming | Incomplete input resilience   | `10 + 5 +` (mid-typing) | `10 + 5`                    | `15`          | Drops unfulfilled trailing operators mid-typing to avoid parse errors           |
| Auto-closing Parentheses   | Unclosed parenthesis handling | `(10 + 5` (mid-typing)  | `(10 + 5)`                  | `15`          | Automatically closes pending open parentheses at end of input                   |
| Operator Requirement       | Non-trivial expression filter | `42`                    | None                        | None (hidden) | Requires at least one operator in AST to prevent shadowing plain search queries |

## Localization and digits

| Capability                   | Syntax / Supported Symbols                                   | Example Input        | Normalized / Interpreted As | Result Output | Notes & Edge Cases                                                   |
|:-----------------------------|:-------------------------------------------------------------|:---------------------|:----------------------------|:--------------|:---------------------------------------------------------------------|
| Eastern Arabic Digits        | `٠`, `١`, `٢`, `٣`, `٤`, `٥`, `٦`, `٧`, `٨`, `٩`             | `١٠ + ٢٠`            | `10 + 20`                   | `30`          | Converted from Unicode range `U+0660 - U+0669` to ASCII digits       |
| Persian / Urdu Digits        | `۰`, `۱`, `۲`, `۳`, `۴`, `۵`, `۶`, `۷`, `۸`, `۹`             | `۵۰ × ۲`             | `50 * 2`                    | `100`         | Converted from Unicode range `U+06F0 - U+06F9` to ASCII digits       |
| Fullwidth Digits             | `０`, `１`, `２`, `３`, `４`, `５`, `６`, `７`, `８`, `９`   | `１００ / ４`        | `100 / 4`                   | `25`          | Converted from Unicode range `U+FF10 - U+FF19` to ASCII digits       |
| Arabic Decimal Point         | `٫` (U+066B)                                                 | `۳٫۵ + ۱٫۵`          | `3.5 + 1.5`                 | `5`           | Normalized to standard decimal point `.`                             |
| Thousand Separator Stripping | `,`, `_`, `٬` (U+066C), `'`, `’`, ` ` (U+202F), ` ` (U+00A0) | `1,000,000 + 50_000` | `1000000 + 50000`           | `1,050,000`   | Separators stripped from input so formatted numbers evaluate cleanly |
