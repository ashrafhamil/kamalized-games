import './globals.css'

export const metadata = {
  title: 'KAMALIZED — Puzzle Edition',
  description: 'Word Search and Sudoku with KAMALIZED',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 min-h-screen">{children}</body>
    </html>
  )
}
