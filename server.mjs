// Serves the built app and keeps your checkmarks/timers in one JSON file so PC and phone can sync.
// Used by the Docker image (node server.mjs) and by the Windows app.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.json': 'application/json',
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function startServer({ port, dist, dataFile }) {
  // { key: { v: value, t: timestamp } } - the newest timestamp per key wins.
  let state = {}
  try { state = JSON.parse(fs.readFileSync(dataFile, 'utf8')) } catch { /* first run */ }

  const persist = () => {
    try {
      fs.mkdirSync(path.dirname(dataFile), { recursive: true })
      fs.writeFileSync(`${dataFile}.tmp`, JSON.stringify(state))
      fs.renameSync(`${dataFile}.tmp`, dataFile)
    } catch (e) { console.error('Could not save state:', e.message) }
  }

  function api(req, res) {
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end() }
    if (req.method === 'GET') {
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      return res.end(JSON.stringify(state))
    }
    if (req.method !== 'POST') { res.writeHead(405, cors); return res.end() }

    let body = ''
    req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.destroy() })
    req.on('end', () => {
      try {
        let changed = false
        for (const [key, entry] of Object.entries(JSON.parse(body))) {
          if (!key.startsWith('gd_') || typeof entry?.t !== 'number') continue
          if (entry.t > (state[key]?.t ?? 0)) { state[key] = { v: entry.v, t: entry.t }; changed = true }
        }
        if (changed) persist()
        res.writeHead(204, cors); res.end()
      } catch {
        res.writeHead(400, cors); res.end()
      }
    })
  }

  function serveStatic(req, res) {
    const url = decodeURIComponent(req.url.split('?')[0])
    let file = path.join(dist, url === '/' ? 'index.html' : url)
    if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, 'index.html')
    const cache = url.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': cache })
    fs.createReadStream(file).pipe(res)
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => (req.url.startsWith('/api/state') ? api(req, res) : serveStatic(req, res)))
    server.once('error', reject)
    server.listen(port, () => resolve(server))
  })
}

// Run directly (Docker): node server.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3000
  startServer({
    port,
    dist: path.resolve('dist'),
    dataFile: path.join(process.env.DATA_DIR || '/data', 'state.json'),
  }).then(() => console.log(`Genshin Daily on port ${port}`))
}
