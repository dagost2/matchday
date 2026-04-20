import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let crc = 0xffffffff
  for (const byte of buf) crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff]
  return ((crc ^ 0xffffffff) >>> 0)
}

function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([t, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, t, data, crcBuf])
}

function drawThickLine(pixels, size, x1, y1, x2, y2, thick, r, g, b) {
  const dx = x2 - x1, dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  const half = thick / 2
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - half))
  const maxX = Math.min(size - 1, Math.ceil(Math.max(x1, x2) + half))
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - half))
  const maxY = Math.min(size - 1, Math.ceil(Math.max(y1, y2) + half))
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const t = lenSq > 0 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq)) : 0
      const nx = x1 + t * dx, ny = y1 + t * dy
      if (Math.sqrt((px - nx) ** 2 + (py - ny) ** 2) <= half) {
        const i = (py * size + px) * 3
        pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b
      }
    }
  }
}

function makeIconPng(size) {
  // Red background
  const pixels = new Uint8Array(size * size * 3)
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3] = 204; pixels[i * 3 + 1] = 0; pixels[i * 3 + 2] = 0
  }

  // White W — coordinates defined at 192px, scaled to target size
  const s = size / 192
  const thick = 24 * s

  // 4 strokes forming the W: outer-left ↘, inner-left ↗, inner-right ↘, outer-right ↗
  const strokes = [
    [28, 30, 62, 162],
    [62, 162, 96, 92],
    [96, 92, 130, 162],
    [130, 162, 164, 30],
  ]
  for (const [x1, y1, x2, y2] of strokes) {
    drawThickLine(pixels, size, x1 * s, y1 * s, x2 * s, y2 * s, thick, 255, 255, 255)
  }

  // Encode as PNG
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2 // 8-bit RGB

  const rowBytes = 1 + size * 3
  const raw = Buffer.alloc(size * rowBytes)
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0 // filter byte
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 3
      const dst = y * rowBytes + 1 + x * 3
      raw[dst] = pixels[src]; raw[dst + 1] = pixels[src + 1]; raw[dst + 2] = pixels[src + 2]
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/pwa-192.png', makeIconPng(192))
writeFileSync('public/icons/pwa-512.png', makeIconPng(512))
console.log('Icons generated → public/icons/')
