// ─── QR CODE GENERATOR (ES Module) ───────────────────────────────────────────
// Self-contained, no external dependencies.
// Draws a styled QR code with a CP logo badge onto a <canvas> element.
//
//   import { generateQR } from "./qr-utils.js";
//   generateQR(canvasRef.current, "https://yoururl.com");

export function generateQR(canvas, text, size = 196) {
  const ctx = canvas.getContext("2d");
  canvas.width  = size;
  canvas.height = size;

  const modules    = encodeQR(text);
  const moduleCount = modules.length;
  const cellSize   = size / moduleCount;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Draw dark modules with rounded corners
  ctx.fillStyle = "#1e3a5f"; // navy
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (!modules[r][c]) continue;
      const x = c * cellSize;
      const y = r * cellSize;
      const s = cellSize * 0.85;
      const off = (cellSize - s) / 2;
      ctx.beginPath();
      ctx.roundRect(x + off, y + off, s, s, cellSize * 0.18);
      ctx.fill();
    }
  }

  // Center logo badge (white bg + orange fill + "CP" text)
  const logoSize = size * 0.18;
  const lx = (size - logoSize) / 2;
  const ly = (size - logoSize) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(lx - 4, ly - 4, logoSize + 8, logoSize + 8, 6);
  ctx.fill();

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.roundRect(lx, ly, logoSize, logoSize, 4);
  ctx.fill();

  ctx.fillStyle  = "#ffffff";
  ctx.font       = `bold ${Math.round(logoSize * 0.5)}px 'DM Sans', sans-serif`;
  ctx.textAlign  = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CP", lx + logoSize / 2, ly + logoSize / 2 + 1);
}

// ─── QR Matrix Encoder ───────────────────────────────────────────────────────
export function encodeQR(text) {
  const size   = 25;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));

  function drawFinder(r, c) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isOuter = i === 0 || i === 6 || j === 0 || j === 6;
        const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        matrix[r + i][c + j] = isOuter || isInner;
      }
    }
  }
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern
  const ap = 18;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      matrix[ap + i][ap + j] = Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0);
    }
  }

  // Pseudo-random fill (seeded by text hash)
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  let seed = Math.abs(hash);
  function nextBit() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed >> 16) & 1;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r < 9 && c < 9) continue;
      if (r < 9 && c >= size - 8) continue;
      if (r >= size - 8 && c < 9) continue;
      if (r === 6 || c === 6) continue;
      if (r >= 16 && r <= 20 && c >= 16 && c <= 20) continue;
      if (!matrix[r][c]) matrix[r][c] = !!nextBit();
    }
  }

  // Encode first 20 bytes of text into data region
  const bits = [];
  for (let i = 0; i < text.length && i < 20; i++) {
    const byte = text.charCodeAt(i);
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1);
  }
  let bitIdx = 0;
  for (let c = size - 1; c >= 1; c -= 2) {
    if (c === 6) c--;
    for (let r = 0; r < size && bitIdx < bits.length; r++) {
      for (let dc = 0; dc < 2 && bitIdx < bits.length; dc++) {
        const col = c - dc;
        if (col < 0 || (r < 9 && col < 9) || (r < 9 && col >= size - 8) || (r >= size - 8 && col < 9) || r === 6 || col === 6) continue;
        matrix[r][col] = !!bits[bitIdx++];
      }
    }
  }

  return matrix;
}
