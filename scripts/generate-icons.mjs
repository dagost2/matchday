/**
 * Generates solid red PNG icons for the PWA manifest.
 * Run with: node scripts/generate-icons.mjs
 * Replace public/icons/pwa-192.png and pwa-512.png with your own artwork later.
 */
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

function makePng(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB
  // bytes 10-12: compression/filter/interlace = 0

  // Raw image: filter byte (0) + 3 bytes per pixel per row
  const rowBytes = 1 + size * 3
  const raw = Buffer.alloc(size * rowBytes)
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0
    for (let x = 0; x < size; x++) {
      const base = y * rowBytes + 1 + x * 3
      raw[base] = r
      raw[base + 1] = g
      raw[base + 2] = b
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
writeFileSync('public/icons/pwa-192.png', makePng(192, 204, 0, 0))
writeFileSync('public/icons/pwa-512.png', makePng(512, 204, 0, 0))
console.log('Icons generated → public/icons/')
