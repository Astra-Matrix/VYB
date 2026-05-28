/**
 * Minimal TS→JS strip for editor scripts (no typechecker).
 * Removes access modifiers and type annotations; export handling is done by the JS bridge.
 */
export function stripTypeScript(source: string): string {
  let out = source.replace(/\b(public|private|protected|readonly)\s+/g, '');
  out = removeTypeAnnotations(out);
  return out;
}

function shouldStripTypeAt(source: string, index: number): boolean {
  const before = source.slice(0, index).trimEnd();
  if (!before) return false;
  const last = before[before.length - 1];
  return /[\w)\]]/.test(last);
}

function skipTypeExpression(source: string, start: number): number {
  let i = start;
  while (i < source.length && /\s/.test(source[i]!)) i++;

  while (i < source.length) {
    const c = source[i]!;
    if (c === '{' || c === '(' || c === '<') {
      const close = c === '{' ? '}' : c === '(' ? ')' : '>';
      let depth = 1;
      i++;
      while (i < source.length && depth > 0) {
        const ch = source[i]!;
        if (ch === c) depth++;
        if (ch === close) depth--;
        i++;
      }
      continue;
    }
    if (/[,)=;]/.test(c)) break;
    i++;
  }
  return i;
}

function removeTypeAnnotations(source: string): string {
  let out = '';
  let i = 0;
  while (i < source.length) {
    if (source[i] === ':' && shouldStripTypeAt(source, i)) {
      i = skipTypeExpression(source, i + 1);
      continue;
    }
    out += source[i];
    i++;
  }
  return out;
}
