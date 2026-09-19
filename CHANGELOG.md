# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-09-19

### Added

- **Inline calculator** in the command palette, with results rendered using KaTeX.
    - Supports parentheses, implicit multiplication, exponentiation (`^`), percentages, modulo, square roots,
      trigonometric functions, and complex/imaginary numbers.
    - Supports factorials, including non-integer values via the gamma function.
    - Suppresses results that overflow instead of showing incorrect values.
    - Actions to copy the result, the full expression, or the expression as LaTeX, available from the context menu.
- **Calculator settings**: enable or disable the calculator, choose the activation mode, set the default angle unit
  (degrees or radians), and toggle thousands separators.
- Contextual primary action hint in the command palette footer.
- Documentation for calculator syntax and supported functions.
- Tabbed sidebar navigation in the settings window.
- Logs tab in settings with a button to open the logs directory.
- Setting to automatically clean up old logs.

### Changed

- Select dropdowns now adapt their trigger width to the selected content.

### Fixed

- Right-to-left (RTL) text and layout direction in the command palette actions popup, the settings window, and select
  dropdowns.
- Long setting descriptions are now truncated with a tooltip instead of overflowing the layout.

[Unreleased]: https://github.com/omniwarp-lab/omniwarp/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/omniwarp-lab/omniwarp/compare/v0.1.0...v.2.0