import { Symbol } from '../types';

export function renderBoard(board: string[] | undefined) {
  const b = board ?? Array(9).fill('');
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const cells = [];
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const val = b[idx] || `${idx}`;
      cells.push(` ${pad(val)} `);
    }
    rows.push(cells.join('|'));
  }
  return rows.join('\n---+---+---\n');
}

function pad(s: string) {
  if (s.length === 1) return ` ${s}`;
  return s.length === 0 ? '  ' : s;
}
