'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const WORD = 'KAMALIZED'
const SIZE = 15
const DIRS = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]
const FOUND_COLORS = ['#22c55e','#3b82f6','#a855f7','#f97316','#ec4899']

function canPlace(g, r, c, dr, dc) {
  for (let i = 0; i < WORD.length; i++) {
    const nr = r + i * dr, nc = c + i * dc
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return false
    if (g[nr][nc] && g[nr][nc] !== WORD[i]) return false
  }
  return true
}

function makeGrid() {
  const g = Array(SIZE).fill(null).map(() => Array(SIZE).fill(''))
  const placements = []
  let tries = 0

  while (placements.length < 5 && tries < 5000) {
    tries++
    const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)]
    const r = Math.floor(Math.random() * SIZE)
    const c = Math.floor(Math.random() * SIZE)
    if (canPlace(g, r, c, dr, dc)) {
      for (let i = 0; i < WORD.length; i++) g[r + i * dr][c + i * dc] = WORD[i]
      placements.push({ r, c, dr, dc })
    }
  }

  // Fill remaining cells — bias toward letters in KAMALIZED to add noise
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + WORD.repeat(2)
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!g[r][c]) g[r][c] = pool[Math.floor(Math.random() * pool.length)]

  return { g, placements }
}

function getPreviewCells(start, hover) {
  if (!start || !hover) return new Set()
  const dr = hover.r - start.r
  const dc = hover.c - start.c
  const len = Math.max(Math.abs(dr), Math.abs(dc))
  if (len === 0) return new Set()
  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return new Set()
  if (len + 1 !== WORD.length) return new Set()
  const sr = dr / len, sc = dc / len
  const cells = new Set()
  for (let i = 0; i <= len; i++) cells.add(`${start.r + i * sr},${start.c + i * sc}`)
  return cells
}

function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500">Generating puzzle…</p>
    </div>
  )
}

export default function CrosswordPage() {
  const [puzzle, setPuzzle] = useState(null)
  const [foundIdx, setFoundIdx] = useState([])
  const [start, setStart] = useState(null)
  const [hover, setHover] = useState(null)
  const [won, setWon] = useState(false)

  useEffect(() => { setPuzzle(makeGrid()) }, [])

  const handleClick = useCallback((r, c) => {
    if (!puzzle) return

    if (!start) {
      setStart({ r, c })
      return
    }

    const { g, placements } = puzzle
    const dr = r - start.r
    const dc = c - start.c
    const len = Math.max(Math.abs(dr), Math.abs(dc))

    if (
      len + 1 === WORD.length &&
      (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))
    ) {
      const sr = len > 0 ? dr / len : 0
      const sc = len > 0 ? dc / len : 0

      let sel = ''
      for (let i = 0; i <= len; i++) sel += g[start.r + i * sr][start.c + i * sc]

      const rev = WORD.split('').reverse().join('')
      if (sel === WORD || sel === rev) {
        for (let fi = 0; fi < placements.length; fi++) {
          if (foundIdx.includes(fi)) continue
          const p = placements[fi]
          const er = p.r + (WORD.length - 1) * p.dr
          const ec = p.c + (WORD.length - 1) * p.dc
          const fwd = p.r === start.r && p.c === start.c && er === r && ec === c
          const bwd = p.r === r && p.c === c && er === start.r && ec === start.c
          if (fwd || bwd) {
            const next = [...foundIdx, fi]
            setFoundIdx(next)
            if (next.length === placements.length) setWon(true)
            break
          }
        }
      }
    }

    setStart(null)
    setHover(null)
  }, [puzzle, start, foundIdx])

  if (!puzzle) return <Loading />

  const { g, placements } = puzzle

  // Build found-cell color map
  const foundMap = {}
  foundIdx.forEach(fi => {
    const p = placements[fi]
    for (let i = 0; i < WORD.length; i++) {
      foundMap[`${p.r + i * p.dr},${p.c + i * p.dc}`] = fi % FOUND_COLORS.length
    }
  })

  const previewSet = getPreviewCells(start, hover)

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center p-4 pt-6">
      <div className="w-full max-w-2xl">
        <Link href="/" className="text-gray-600 hover:text-gray-300 text-sm inline-block mb-5">
          ← Back
        </Link>

        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-white">Word Search</h1>
          <span className="text-gray-400 text-sm bg-gray-900 px-3 py-1 rounded-full">
            {foundIdx.length} / {placements.length} found
          </span>
        </div>

        {/* Word chips */}
        <div className="flex gap-2 flex-wrap mb-5">
          {placements.map((_, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-full font-mono font-bold border transition-colors"
              style={
                foundIdx.includes(i)
                  ? { background: FOUND_COLORS[i % FOUND_COLORS.length], color: '#fff', border: 'transparent' }
                  : { border: '1px solid #374151', color: '#6b7280' }
              }
            >
              KAMALIZED
            </span>
          ))}
        </div>

        {won && (
          <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-xl mb-4 text-center font-bold text-sm">
            You found all {placements.length}! Kamalized!
          </div>
        )}

        {/* Grid */}
        <div className="overflow-x-auto">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${SIZE}, 2rem)`,
              gap: '2px',
            }}
          >
            {g.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r},${c}`
                const fc = foundMap[key]
                const isPrev = previewSet.has(key)
                const isStart = start?.r === r && start?.c === c

                let bg = '#1f2937', color = '#d1d5db'
                if (fc !== undefined) { bg = FOUND_COLORS[fc]; color = '#fff' }
                else if (isPrev) { bg = '#1d4ed8'; color = '#fff' }
                else if (isStart) { bg = '#ca8a04'; color = '#000' }

                return (
                  <button
                    key={key}
                    onClick={() => handleClick(r, c)}
                    onMouseEnter={() => start && setHover({ r, c })}
                    style={{
                      width: '2rem', height: '2rem',
                      background: bg, color,
                      fontSize: '0.7rem', fontWeight: 700,
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      transition: 'background 0.08s',
                      border: 'none',
                      fontFamily: 'monospace',
                    }}
                  >
                    {cell}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <p className="text-gray-700 text-xs mt-5 text-center">
          {start
            ? 'Now click the last letter (D) of KAMALIZED'
            : 'Click the first letter (K) of KAMALIZED to start'}
        </p>
      </div>
    </main>
  )
}
