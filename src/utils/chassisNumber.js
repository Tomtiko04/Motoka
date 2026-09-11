// Chassis / VIN handling for the re-registration flow.
//
// A chassis number is 17 characters on any vehicle built to ISO 3779, which
// deliberately excludes I, O and Q so they cannot be confused with 1 and 0.
// That exclusion is what makes OCR correction safe here: if a scan reads an
// "O" inside a chassis number, it is a zero, not a letter.
//
// Older and some imported vehicles predate the standard and carry shorter
// numbers, so candidates below 17 characters are surfaced rather than
// rejected — the owner confirms, we never silently overwrite what they typed.

const AMBIGUOUS = { I: "1", O: "0", Q: "0" };

export function normaliseChassis(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/[IOQ]/g, (c) => AMBIGUOUS[c]);
}

export function isFullVin(value) {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(normaliseChassis(value));
}

/**
 * Pull likely chassis numbers out of raw OCR text, best first.
 *
 * Two passes. A labelled line ("Chassis No: ...") is authoritative, so its
 * tail is read directly. Otherwise each line is tokenised and runs of adjacent
 * alphanumeric chunks are joined, because OCR routinely splits one number into
 * groups ("JM3 KF1BY9 H710 0000").
 *
 * Mixedness is tested on the raw token, before I/O/Q are folded to 1/0/0 —
 * otherwise a word like FEDERALREPUBLICOF normalises into something that looks
 * like a valid alphanumeric chassis number.
 */
const LABEL = /(?:CHASS?IS|VIN)\s*(?:NO\.?|NUMBER)?\s*[:\-.]?\s*(.+)$/;

function rawLooksLikeChassis(raw) {
  return /[A-Z]/.test(raw) && /[0-9]/.test(raw);
}

function collect(raw, seen, out, labelled) {
  if (raw.length < 11 || raw.length > 17) return;
  if (!rawLooksLikeChassis(raw)) return;
  const value = normaliseChassis(raw);
  if (seen.has(value)) return;
  seen.add(value);
  out.push({ value, labelled });
}

export function extractChassisCandidates(text) {
  if (!text) return [];

  const seen = new Set();
  const found = [];

  for (const line of String(text).toUpperCase().split(/\r?\n/)) {
    const labelMatch = LABEL.exec(line);
    if (labelMatch) {
      collect(labelMatch[1].replace(/[^A-Z0-9]/g, ""), seen, found, true);
    }

    const tokens = line.split(/\s+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i += 1) {
      if (!/^[A-Z0-9]{2,17}$/.test(tokens[i])) continue;
      let run = "";
      for (let j = i; j < tokens.length; j += 1) {
        if (!/^[A-Z0-9]{2,17}$/.test(tokens[j])) break;
        run += tokens[j];
        if (run.length > 17) break;
        collect(run, seen, found, false);
      }
    }
  }

  // Labelled beats unlabelled; a full 17 beats a partial; longer beats shorter.
  return found
    .sort(
      (a, b) =>
        Number(b.labelled) - Number(a.labelled) ||
        Number(b.value.length === 17) - Number(a.value.length === 17) ||
        b.value.length - a.value.length,
    )
    .map((c) => c.value);
}
