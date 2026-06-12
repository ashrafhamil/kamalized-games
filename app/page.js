import Link from 'next/link'

const LETTERS = ['K','A','M','A','L','I','Z','E','D']
const COLORS = ['#3b82f6','#ef4444','#22c55e','#f97316','#a855f7','#06b6d4','#eab308','#ec4899','#14b8a6']

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="mb-2 flex gap-1">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className="text-5xl md:text-7xl font-black tracking-tight"
            style={{ color: COLORS[i] }}
          >
            {letter}
          </span>
        ))}
      </div>
      <p className="text-gray-600 text-xs tracking-[0.4em] uppercase mb-14">Puzzle Edition</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-lg">
        <Link href="/crossword">
          <div className="bg-gray-900 border border-gray-800 hover:border-yellow-600 rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-yellow-900/20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-white text-xl font-bold mb-2">Word Search</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Find <strong className="text-yellow-400">KAMALIZED</strong> hidden across,
              down &amp; diagonally — 5 times
            </p>
          </div>
        </Link>

        <Link href="/sudoku">
          <div className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-blue-900/20">
            <div className="text-5xl mb-4">🔢</div>
            <h2 className="text-white text-xl font-bold mb-2">Sudoku</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Classic Sudoku — but with{' '}
              {LETTERS.map((l, i) => (
                <span key={i} style={{ color: COLORS[i] }} className="font-bold">{l}</span>
              ))}{' '}
              instead of 1–9
            </p>
          </div>
        </Link>
      </div>
    </main>
  )
}
