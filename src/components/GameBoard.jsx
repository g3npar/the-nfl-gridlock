import { positions } from '../data/mockData'
import PositionRow from './PositionRow'

function GameBoard({
  selections, updateSelection,
  locked, results,
  onLockPosition, onReset,
  allLocked, lockedCount,
}) {
  const totalPoints  = Object.values(results).reduce((s, r) => s + r.points, 0)
  const totalPositions = positions.length

  const handleShare = () => {
    const text = `Gridiron Puzzle ${new Date().toLocaleDateString('en-US')} — ${totalPoints} pts`
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  return (
    <div className="game-board">

      {/* Board header */}
      <div className="board-header">
        <h1 className="board-title">Daily Lineup Challenge</h1>
      </div>

      {/* 6 position lock bars */}
      <div className="lock-bars">
        {positions.map(pos => {
          const isLocked = locked[pos.id]
          const isFilled = selections[pos.id]?.year && selections[pos.id]?.player
          const result   = results[pos.id]
          return (
            <div
              key={pos.id}
              className={`lock-bar${isLocked ? ' lock-bar--locked' : isFilled ? ' lock-bar--filled' : ''}`}
              style={{ '--pos-color': pos.color }}
            >
              <span className="lock-bar-label">{pos.label}</span>
              {isLocked && (
                <span className="lock-bar-icon">✓</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Rows */}
      <div className="board-rows">
        {positions.map(pos => (
          <PositionRow
            key={pos.id}
            position={pos}
            selection={selections[pos.id]}
            result={results[pos.id]}
            isLocked={locked[pos.id]}
            onUpdate={(field, val) => updateSelection(pos.id, field, val)}
            onLock={() => onLockPosition(pos.id)}
          />
        ))}
      </div>

      {/* All locked — show final score */}
      {allLocked && (
        <div className="results-card">
          <div className="results-badge">✓ All Locked In</div>
          <div className="results-score">{totalPoints}</div>
          <div className="results-score-label">Total Fantasy Points</div>
          <div className="results-actions">
            <button className="share-btn" onClick={handleShare}>📋 Copy Results</button>
            <button className="reset-btn" onClick={onReset}>Play Again</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default GameBoard

