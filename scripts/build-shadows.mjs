/**
 * Builds the hero's shadow masks (public/media/shadows/*.png).
 *
 * The first three are his own outline from the real cutout, a third larger
 * than him and standing just behind him, so it shows as a band of light
 * round his head and off his shoulders (about a sixteenth of the portrait's
 * width beside his neck, never touching). The builder and the engineer are
 * that same outline in the same pose, each with one thing added: a hammer on
 * the shoulder, headphones. The writer is not a figure at all: an open book
 * standing behind him, its pages lined with writing.
 *
 * The frame is FRAME_W x FRAME_H portrait-widths, with the portrait's square
 * standing at its bottom centre (see the anchor in Hero). White is inside;
 * grey is inside too, but drawn fainter and with fewer grains (the book's
 * lines of writing, so its edges carry the shape).
 *
 *   node scripts/build-shadows.mjs
 *
 * then bump the version on the mask URLs in src/components/scene/targets.ts
 * (/media is cached for a month).
 */
import sharp from "sharp";

const PX = 300; // pixels per portrait width
export const FRAME_W = 1.6;
export const FRAME_H = 1.3;
const SCALE = 1.3; // the shadow, against him
// The shadow grows from a point at his chin, so it rises a little over his head and
// spreads past his shoulders by about the same amount as it clears his cheeks.
const CX = 0.5;
const CY = 0.6;

/** The frame's own coordinates: portrait widths, from the portrait square's top-left corner. */
const FX = (FRAME_W - 1) / 2;
const FY = FRAME_H - 1;
const W = Math.round(FRAME_W * PX);
const H = Math.round(FRAME_H * PX);

// The props, drawn in the cutout's own square (0..1), so they move and scale with the figure.
const PROPS = {
  you: "",
  builder: `
    <g transform="translate(0.135 0.36) rotate(-33)">
      <rect x="-0.021" y="0" width="0.042" height="0.6" rx="0.016"/>
      <path d="M-0.035 -0.05 H0.115 Q0.135 -0.05 0.135 -0.03 V0.03 Q0.135 0.05 0.115 0.05 H-0.035 Z"/>
      <path d="M-0.035 -0.05 C-0.09 -0.05 -0.145 -0.02 -0.17 0.05 C-0.12 0.02 -0.075 0.02 -0.035 0.035 Z"/>
    </g>`,
  engineer: `
    <path d="M0.29 0.39 C0.265 0.035 0.715 0.035 0.69 0.39" fill="none" stroke="#fff" stroke-width="0.03"/>
    <rect x="0.262" y="0.305" width="0.07" height="0.14" rx="0.032"/>
    <rect x="0.648" y="0.305" width="0.07" height="0.14" rx="0.032"/>`,
};

/**
 * The writer's book, in portrait widths (0..1 is his square). It stands open behind him with
 * its spine behind his head: the top of the spine clears his hair, the pages reach just past
 * his shoulders, and their lower half goes down behind him. Drawn in line, like an engraving:
 * the page edges, the leaves of the page block under each page, and lines of writing.
 */
function book() {
  const L = -0.1; // outer edges
  const R = 1.1;
  const S = 0.5; // spine
  const top = (x) => {
    // Each page's top edge rises from the spine and falls away to its outer corner.
    const u = Math.abs(x - S) / (S - L);
    return 0.0 - 0.085 * Math.sin(Math.PI * Math.min(1, u * 0.92)) + 0.03 * u * u;
  };
  const bottom = (x) => top(x) + 0.86;
  const curve = (f, a, b, dy = 0, n = 40) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      pts.push(`${x.toFixed(4)},${(f(x) + dy).toFixed(4)}`);
    }
    return pts.join(" ");
  };
  const line = (pts, w, tone = "#fff") =>
    `<polyline points="${pts}" fill="none" stroke="${tone}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const out = [];
  // The page edges: top, bottom and outer edge of each page, and the spine between them.
  for (const [a, b] of [
    [L, S],
    [S, R],
  ]) {
    out.push(line(curve(top, a, b), 0.017));
    out.push(line(curve(bottom, a, b), 0.017));
  }
  out.push(line(`${L},${top(L).toFixed(4)} ${L},${bottom(L).toFixed(4)}`, 0.017));
  out.push(line(`${R},${top(R).toFixed(4)} ${R},${bottom(R).toFixed(4)}`, 0.017));
  out.push(line(`${S},${top(S).toFixed(4)} ${S},${bottom(S).toFixed(4)}`, 0.014));
  // The page block: a few leaves showing under each page, towards the outer corners.
  for (let k = 1; k <= 3; k++) {
    const dy = 0.022 * k;
    const inset = 0.035 * k;
    out.push(line(curve(bottom, L + inset * 0.4, S - 0.06, dy), 0.01));
    out.push(line(curve(bottom, S + 0.06, R - inset * 0.4, dy), 0.01));
  }
  // Writing: lines that follow the page's curve, each one a little different in length,
  // with a short last line where a paragraph ends.
  const rows = 11;
  const ends = [0.03, 0.08, 0.0, 0.26, 0, 0.05, 0.02, 0.1, 0.18, 0, 0.06];
  for (let r = 0; r < rows; r++) {
    // A blank line between paragraphs.
    if (r === 4 || r === 9) continue;
    const dy = 0.1 + r * 0.068;
    const e = ends[r];
    out.push(line(curve(top, L + 0.07, S - 0.08 - e * 0.5, dy, 24), 0.009, "#aaa"));
    out.push(line(curve(top, S + 0.08, R - 0.07 - e, dy, 24), 0.009, "#aaa"));
  }
  return `<g>${out.join("")}</g>`;
}

/** Writes a mask from its inside, an 8-bit buffer the frame's size (0 outside, 170 faint, 255 full). */
async function save(name, buf) {
  await sharp(buf, { raw: { width: W, height: H, channels: 1 } }).png({ compressionLevel: 9, palette: true, colours: 4 }).toFile(`public/media/shadows/${name}.png`);
  let topRow = H;
  for (let i = 0; i < buf.length; i++)
    if (buf[i]) {
      topRow = Math.floor(i / W);
      break;
    }
  console.log(name, W, H, "first row used:", topRow, `(${(topRow / PX - FY).toFixed(3)} portrait widths from his square's top)`);
}

// The figures: his cutout with a prop added, scaled about (CX, CY) and placed in the frame.
const size = Math.round(SCALE * PX);
const left = Math.round((FX + CX - SCALE * CX) * PX);
const top = Math.round((FY + CY - SCALE * CY) * PX);
const cutout = await sharp("public/media/sibi-cutout.webp").extractChannel(3).resize(size, size).toColourspace("b-w").png().toBuffer();

for (const [name, prop] of Object.entries(PROPS)) {
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1 1" fill="#fff">${prop}</svg>`);
  const fig = await sharp(cutout).composite([{ input: svg, blend: "lighten" }]).extractChannel(0).raw().toBuffer();
  const out = Buffer.alloc(W * H);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const X = x + left;
      const Y = y + top;
      if (X >= 0 && X < W && Y >= 0 && Y < H && fig[y * size + x] > 127) out[Y * W + X] = 255;
    }
  }
  // The cutout stops at his chest; the shadow's body carries on down to the floor.
  for (let x = 0; x < size; x++) {
    if (fig[(size - 1) * size + x] <= 127) continue;
    for (let Y = Math.max(0, top + size); Y < H; Y++) if (x + left >= 0 && x + left < W) out[Y * W + x + left] = 255;
  }
  await save(name, out);
}

// The book, drawn straight into the frame.
{
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${-FX} ${-FY} ${FRAME_W} ${FRAME_H}">${book()}</svg>`
  );
  const px = await sharp(svg).extractChannel(0).raw().toBuffer();
  // He stands in front of it, so whatever of the book is behind him would never be seen:
  // leave it out (with a little room round him), and every grain goes where it shows.
  const him = await sharp("public/media/sibi-cutout.webp").extractChannel(3).resize(PX, PX).blur(4).raw().toBuffer();
  const ox = Math.round(FX * PX);
  const oy = Math.round(FY * PX);
  const out = Buffer.alloc(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const hx = x - ox;
      const hy = y - oy;
      const behind = hx >= 0 && hx < PX && hy >= 0 && (hy >= PX || him[hy * PX + hx] > 8);
      out[i] = behind ? 0 : px[i] > 215 ? 255 : px[i] > 127 ? 170 : 0;
    }
  }
  await save("writer", out);
}
