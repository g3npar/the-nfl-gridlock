import { useState } from 'react'
import Header from './components/Header'
import GameBoard from './components/GameBoard'

const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'DEF', 'DP']
const emptySelections = () => Object.fromEntries(POSITIONS.map(p => [p, { year: '', player: null }]))
const emptyLocked     = () => Object.fromEntries(POSITIONS.map(p => [p, false]))

function App() {
  const [selections, setSelections] = useState(emptySelections())
  const [locked, setLocked]         = useState(emptyLocked())
  const [results, setResults]       = useState({})

  const updateSelection = (posId, field, value) => {
    setSelections(prev => ({
      ...prev,
      [posId]: { ...prev[posId], [field]: value },
    }))
  }

  const handleLockPosition = async (posId) => {
    const { year, player } = selections[posId]
    const position = (await import('./data/mockData')).positions.find(p => p.id === posId)

    // Build constraints array for API
    const apiConstraints = []
    if (position.eligibleTeams?.length)  apiConstraints.push({ type: 'team',        values: position.eligibleTeams })
    if (position.excludeTeams?.length)   apiConstraints.push({ type: 'excludeTeam', values: position.excludeTeams })
    if (position.yearMin)                apiConstraints.push({ type: 'minYear',      value:  position.yearMin })
    if (position.yearMax)                apiConstraints.push({ type: 'maxYear',      value:  position.yearMax })

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, year: parseInt(year), constraints: apiConstraints }),
      })
      const data = await res.json()
      setResults(prev => ({ ...prev, [posId]: { points: data.fpts, valid: data.valid, reason: data.reason } }))
      if (data.valid !== false) {
        setLocked(prev => ({ ...prev, [posId]: true }))
      }
    } catch (e) {
      console.error('Validate error', e)
    }
  }

  const handleReset = () => {
    setSelections(emptySelections())
    setLocked(emptyLocked())
    setResults({})
  }

  const allLocked  = POSITIONS.every(p => locked[p])
  const lockedCount = POSITIONS.filter(p => locked[p]).length

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <GameBoard
          selections={selections}
          updateSelection={updateSelection}
          locked={locked}
          results={results}
          onLockPosition={handleLockPosition}
          onReset={handleReset}
          allLocked={allLocked}
          lockedCount={lockedCount}
        />
      </main>
    </div>
  )
}

export default App

