'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'

// KAMALIZED: positions 0–8 map to values 1–9
// Position 1 and 3 are both 'A' — differentiated by color (red vs orange)
const LETTERS = ['K','A','M','A','L','I','Z','E','D']
const COLORS  = ['#3b82f6','#ef4444','#22c55e','#f97316','#a855f7','#06b6d4','#eab308','#ec4899','#14b8a6']

// Classic beginner puzzle (0 = empty)
const PUZZLE = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9],
]

const SOLUTION = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9],
]

function isGiven(r, c) { return PUZZLE[r][c] !== 0 }

function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500">Loading puzzle…</p>
    </div>
  )
}

export default function SudokuPage() {
  const [mounted, setMounted] = useState(false)
  const [grid, setGrid] = useState(() => PUZZLE.map(r => [...r]))
  const [sel, setSel] = useState(null)
  const [won, setWon] = useState(false)
  const [errors, setErrors] = useState(new Set())

  useEffect(() => { setMounted(true) }, [])

  const enter = useCallback((val) => {
    if (!sel) return
    const { r, c } = sel
    if (isGiven(r, c)) return

    const next = grid.map(row => [...row])
    next[r][c] = val
    setGrid(next)

    // Recompute errors
    const errs = new Set()
    let solved = true
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const v = next[i][j]
        if (!v) { solved = false; continue }
        if (v !== SOLUTION[i][j]) { errs.add(`${i},${j}`); solved = false }
      }
    }
    setErrors(errs)
    if (solved) setWon(true)
  }, [sel, grid])

  const handleKey = useCallback((e) => {
    const map = { k:1, a:2, m:3, l:5, i:6, z:7, e:8, d:9, Backspace:0, Delete:0 }
    const val = map[e.key.toLowerCase()] ?? map[e.key]
    if (val !== undefined) enter(val)
    // Arrow navigation
    if (!sel) return
    const { r, c } = sel
    if (e.key === 'ArrowRight') setSel({ r, c: Math.min(8, c+1) })
    if (e.key === 'ArrowLeft')  setSel({ r, c: Math.max(0, c-1) })
    if (e.key === 'ArrowDown')  setSel({ r: Math.min(8, r+1), c })
    if (e.key === 'ArrowUp')    setSel({ r: Math.max(0, r-1), c })
  }, [sel, enter])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!mounted) return <Loading />

  const sameGroup = (r, c) => {
    if (!sel) return false
    return r === sel.r || c === sel.c ||
      (Math.floor(r/3) === Math.floor(sel.r/3) && Math.floor(c/3) === Math.floor(sel.c/3))
  }

  const sameLetter = (r, c) => {
    if (!sel || !grid[sel.r][sel.c]) return false
    return grid[r][c] !== 0 && grid[r][c] === grid[sel.r][sel.c]
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center p-4 pt-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-full mb-5">
          <Link href="/" className="text-gray-600 hover:text-gray-300 text-sm">← Back</Link>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1 self-start">Sudoku</h1>
        <p className="text-gray-600 text-sm mb-6 self-start">
          Fill with{' '}
          {LETTERS.map((l, i) => (
            <span key={i} style={{ color: COLORS[i] }} className="font-bold">{l}</span>
          ))}
        </p>

        {won && (
          <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-3 rounded-xl mb-4 w-full text-center font-bold text-sm">
            Puzzle solved — Kamalized!
          </div>
        )}

        {/* Sudoku grid */}
        <div style={{ border: '2px solid #e5e7eb', display: 'inline-block' }}>
          {SOLUTION.map((_, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {Array(9).fill(null).map((__, c) => {
                const val = grid[r][c]
                const given = isGiven(r, c)
                const isSel = sel?.r === r && sel?.c === c
                const isErr = errors.has(`${r},${c}`)
                const isGroup = sameGroup(r, c)
                const isSame = sameLetter(r, c)

                let bg = '#111827'
                if (isSel)        bg = '#1e3a8a'
                else if (isErr)   bg = '#4c0519'
                else if (isSame)  bg = '#1e3a5f'
                else if (isGroup) bg = '#1f2937'

                const bR = c < 8 ? ((c+1)%3===0 ? '2px solid #e5e7eb' : '1px solid #374151') : 'none'
                const bB = r < 8 ? ((r+1)%3===0 ? '2px solid #e5e7eb' : '1px solid #374151') : 'none'

                return (
                  <button
                    key={c}
                    onClick={() => !given && setSel({ r, c })}
                    style={{
                      width: '2.75rem', height: '2.75rem',
                      background: bg,
                      color: val ? COLORS[val-1] : 'transparent',
                      fontWeight: given ? 900 : 600,
                      fontSize: given ? '1.05rem' : '1rem',
                      fontFamily: 'monospace',
                      borderRight: bR, borderBottom: bB,
                      borderLeft: 'none', borderTop: 'none',
                      cursor: given ? 'default' : 'pointer',
                      transition: 'background 0.08s',
                      outline: 'none',
                    }}
                  >
                    {val ? LETTERS[val-1] : ''}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Letter palette */}
        <div className="mt-6 w-full">
          <p className="text-gray-600 text-xs mb-3 text-center">Click a cell, then pick a letter</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {LETTERS.map((letter, i) => (
              <button
                key={i}
                onClick={() => enter(i + 1)}
                style={{
                  width: '2.75rem', height: '2.75rem',
                  border: `2px solid ${COLORS[i]}`,
                  color: COLORS[i],
                  fontWeight: 900, fontSize: '1rem',
                  fontFamily: 'monospace',
                  borderRadius: '0.5rem',
                  background: '#111827',
                  cursor: 'pointer',
                }}
                className="hover:opacity-70 transition-opacity"
              >
                {letter}
              </button>
            ))}
            <button
              onClick={() => enter(0)}
              style={{
                width: '2.75rem', height: '2.75rem',
                border: '2px solid #374151',
                color: '#6b7280',
                fontWeight: 700, fontSize: '1.25rem',
                borderRadius: '0.5rem',
                background: '#111827',
                cursor: 'pointer',
              }}
              className="hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-700 leading-relaxed">
            <span style={{ color: '#ef4444' }}>A</span> (red) and{' '}
            <span style={{ color: '#f97316' }}>A</span> (orange) are different values
            <br />
            Keyboard: K M L I Z E D + arrows · Backspace to clear
          </div>
        </div>
      </div>
    </main>
  )
}
