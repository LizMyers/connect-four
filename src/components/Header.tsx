import React from 'react';
import '../styles/Header.css';

interface HeaderProps {
  soundEnabled: boolean;
  toggleSound: () => void;
  resetGame: () => void;
  gameOver: boolean;
  winner: number | null;
  currentPlayer: number;
  isThinking: boolean;
  getPlayerName: (playerNum: number) => string;
  getPlayerTurnText: (playerNum: number) => string;
  playerWins: number;
  aiWins: number;
  draws: number;
}

const Header: React.FC<HeaderProps> = ({ 
  soundEnabled, 
  toggleSound, 
  resetGame,
  gameOver,
  winner,
  currentPlayer,
  isThinking,
  getPlayerName,
  getPlayerTurnText,
  playerWins,
  aiWins,
  draws
}) => {
  return (
    <header className="game-header">
      <div className="header-row">
        <div className="header-left">
          <h1>Connect Four</h1>
        </div>
        <div className="header-controls">
          <button 
            className={`sound-button ${soundEnabled ? '' : 'sound-off'}`}
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          >
            {soundEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06z" />
                <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <button className="new-game-button" onClick={resetGame}>
            New Game
          </button>
        </div>
      </div>
      
      <div className="header-row turn-indicator-row">
        {gameOver ? (
          winner ? (
            <div className="winner">
              {getPlayerName(winner)} won!
              <div className={`winner-indicator ${winner === 1 ? 'red' : 'yellow'}`}></div>
            </div>
          ) : (
            <div className="draw">It's a draw!</div>
          )
        ) : (
          <div className="current-player">
            {isThinking ? (
              <>Computer is thinking...</>
            ) : (
              <>{getPlayerTurnText(currentPlayer)}</>
            )}
            <div className={`player-indicator ${currentPlayer === 1 ? 'red' : 'yellow'}`}></div>
          </div>
        )}
      </div>
      
      <div className="header-row stats-row">
        <div className="win-stats">
          <span className="player-wins">Your wins: {playerWins}</span>
          <span className="separator">|</span>
          <span className="ai-wins">Computer wins: {aiWins}</span>
          <span className="separator">|</span>
          <span className="draws">Draws: {draws}</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 