function normalize(input: string): string {
  let result = ''
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    const code = ch.charCodeAt(0)

    // Persian / Urdu digits: ۰-۹ (U+06F0 - U+06F9)
    if (code >= 0x06f0 && code <= 0x06f9) {
      result += String.fromCharCode(48 + (code - 0x06f0))
    }
    // Eastern Arabic digits: ٠-٩ (U+0660 - U+0669)
    else if (code >= 0x0660 && code <= 0x0669) {
      result += String.fromCharCode(48 + (code - 0x0660))
    }
    // Fullwidth digits: ０-۹ (U+FF10 - U+FF19)
    else if (code >= 0xff10 && code <= 0xff19) {
      result += String.fromCharCode(48 + (code - 0xff10))
    }
    // Arabic decimal separator (U+066B ٫)
    else if (code === 0x066b) {
      result += '.'
    }
    // Multiplication signs: × (U+00D7), ✕ (U+2715), ✖ (U+2716)
    else if (ch === '×' || ch === '✕' || ch === '✖') {
      result += '*'
    }
    // Division sign: ÷ (U+00F7)
    else if (ch === '÷') {
      result += '/'
    }
    // Minus signs / dashes: − (U+2212), – (U+2013), — (U+2014)
    else if (ch === '−' || ch === '–' || ch === '—') {
      result += '-'
    }
    // Fullwidth plus: ＋ (U+FF0B)
    else if (code === 0xff0b) {
      result += '+'
    }
    // Fullwidth parentheses: （ (U+FF08), ） (U+FF09)
    else if (code === 0xff08) {
      result += '('
    } else if (code === 0xff09) {
      result += ')'
    }
    // Fullwidth caret: ＾ (U+FF3E)
    else if (code === 0xff3e) {
      result += '^'
    }
    // Percent signs: ٪ (Arabic U+066A), ％ (Fullwidth U+FF05)
    else if (code === 0x066a || code === 0xff05) {
      result += '%'
    }
    // Square root symbol: √ (U+221A)
    else if (ch === '√') {
      result += 'sqrt '
    }
    // Thousands separators to strip:
    // , (ASCII comma), _ (underscore), ٬ (Arabic thousands separator U+066C),
    // ' (apostrophe), ’ (right single quote U+2019),   (narrow no-break space),   (no-break space)
    else if (
      ch === ',' ||
      ch === '_' ||
      code === 0x066c ||
      ch === "'" ||
      ch === '’' ||
      code === 0x202f ||
      code === 0x00a0
    ) {
      // Strip thousands separator
    } else {
      result += ch
    }
  }
  return result
}

export { normalize }
