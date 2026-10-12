// Generates one placeholder datasheet PDF per grade into public/downloads/.
// Hand-built minimal PDF (no dependencies). Contains no spec values: those are undecided.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const products = JSON.parse(readFileSync(new URL('../src/data/products.json', import.meta.url)));
const outDir = new URL('../public/downloads/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const esc = (s) => s.replace(/[\\()]/g, (c) => '\\' + c).replace(/[^\x20-\x7e]/g, '-');

function pdf(lines) {
  const text = lines
    .map((l, i) => `BT /F1 ${i === 0 ? 18 : 11} Tf 56 ${780 - i * 22} Td (${esc(l)}) Tj ET`)
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
  ];
  let out = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}

for (const p of products) {
  const lines = [
    `PLACEHOLDER DATASHEET - ${p.name}`,
    'DK Polymer, Sector 5, Bawana Industrial Area, Delhi, India',
    '',
    'This is a prototype placeholder. No specification values are confirmed.',
    'The final datasheet will be supplied by DK Polymer.',
    '',
    ...p.specs.map((s) => `${s.property}${s.unit ? ` (${s.unit})` : ''}: [PLACEHOLDER]`),
    '',
    `MOQ: [PLACEHOLDER]    Lead time: [PLACEHOLDER]`,
  ];
  writeFileSync(new URL(`datasheet-${p.slug}.pdf`, outDir), pdf(lines), 'latin1');
  console.log(`datasheet-${p.slug}.pdf`);
}
