import React, { useState, useEffect, useRef } from 'react';
import Board, { BoardHandle } from './Board';
import Header from './Header';
import './Game.css';
import SoundManager from '../utils/SoundManager';
import StatsManager from '../utils/StatsManager';

const ROWS = 6;
const COLUMNS = 7;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;

// Interface for winning pieces coordinates
export interface WinningPiece {
  col: number;
  row: number;
}

const Game: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(
    Array(COLUMNS).fill(null).map(() => Array(ROWS).fill(EMPTY))
  );
  const [currentPlayer, setCurrentPlayer] = useState<number>(PLAYER);
  const [winner, setWinner] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [processingMove, setProcessingMove] = useState<boolean>(false);
  const [winningPieces, setWinningPieces] = useState<WinningPiece[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const boardRef = useRef<BoardHandle>(null);

  // Toggle sound on/off
  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    SoundManager.toggleSound(newSoundState);
  };

  // Make AI move after player's turn
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Only trigger AI move when it's AI's turn and game is active
    if (currentPlayer === AI && !gameOver && !processingMove) {
      setIsThinking(true);
      
      // Add a 1 second delay after the player's move before the AI makes its move
      timeoutId = setTimeout(() => {
        // Direct AI move without using the Board's click handler
        const availableMoves = getAvailableMoves(board);
        if (availableMoves.length > 0) {
          // Choose best move (simplified AI logic)
          const columnIndex = findBestMove(board);
          if (columnIndex !== -1) {
            makeMove(columnIndex);
          }
        }
        setIsThinking(false);
      }, 1000); // Increased to 1 second delay
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentPlayer, gameOver, processingMove]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetGame = () => {
    setBoard(Array(COLUMNS).fill(null).map(() => Array(ROWS).fill(EMPTY)));
    setCurrentPlayer(PLAYER);
    setWinner(null);
    setGameOver(false);
    setIsThinking(false);
    setProcessingMove(false);
    setWinningPieces([]);
    
    // Dispatch event to update stats display when game is reset
    window.dispatchEvent(new Event('stats-updated'));
  };

  const checkWinner = (board: number[][], col: number, row: number, player: number): boolean => {
    const winningPiecesFound: WinningPiece[] = [];
    
    // Check horizontal
    let count = 0;
    let startCol = 0;
    for (let c = 0; c < COLUMNS; c++) {
      if (board[c][row] === player) {
        count++;
        if (count === 1) startCol = c;
        if (count >= 4) {
          const pieces = [];
          for (let i = 0; i < 4; i++) {
            pieces.push({ col: startCol + i, row });
          }
          setWinningPieces(pieces);
          return true;
        }
      } else {
        count = 0;
        startCol = c + 1;
      }
    }

    // Check vertical
    count = 0;
    let startRow = 0;
    for (let r = 0; r < ROWS; r++) {
      if (board[col][r] === player) {
        count++;
        if (count === 1) startRow = r;
        if (count >= 4) {
          const pieces = [];
          for (let i = 0; i < 4; i++) {
            pieces.push({ col, row: startRow + i });
          }
          setWinningPieces(pieces);
          return true;
        }
      } else {
        count = 0;
        startRow = r + 1;
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let c = 0; c <= COLUMNS - 4; c++) {
      for (let r = 0; r <= ROWS - 4; r++) {
        let diagWin = true;
        for (let i = 0; i < 4; i++) {
          if (board[c + i][r + i] !== player) {
            diagWin = false;
            break;
          }
        }
        if (diagWin) {
          const pieces = [];
          for (let i = 0; i < 4; i++) {
            pieces.push({ col: c + i, row: r + i });
          }
          setWinningPieces(pieces);
          return true;
        }
      }
    }

    // Check diagonal (top-right to bottom-left)
    for (let c = COLUMNS - 1; c >= 3; c--) {
      for (let r = 0; r <= ROWS - 4; r++) {
        let diagWin = true;
        for (let i = 0; i < 4; i++) {
          if (board[c - i][r + i] !== player) {
            diagWin = false;
            break;
          }
        }
        if (diagWin) {
          const pieces = [];
          for (let i = 0; i < 4; i++) {
            pieces.push({ col: c - i, row: r + i });
          }
          setWinningPieces(pieces);
          return true;
        }
      }
    }

    return false;
  };

  const checkDraw = (board: number[][]): boolean => {
    return board.every(column => column.every(cell => cell !== EMPTY));
  };

  // Get available moves (columns that aren't full)
  const getAvailableMoves = (board: number[][]): number[] => {
    const availableMoves: number[] = [];
    for (let c = 0; c < COLUMNS; c++) {
      if (board[c].some(cell => cell === EMPTY)) {
        availableMoves.push(c);
      }
    }
    return availableMoves;
  };

  // Get the row where a piece would land if dropped in a column
  const getRowForColumn = (board: number[][], column: number): number => {
    const rowIndex = board[column].findIndex(cell => cell === EMPTY);
    return rowIndex;
  };

  // Check if making a move would result in a win
  const checkMoveForWin = (board: number[][], column: number, player: number): boolean => {
    const newBoard = board.map(col => [...col]);
    const rowIndex = getRowForColumn(newBoard, column);
    
    if (rowIndex === -1) return false;
    
    newBoard[column][rowIndex] = player;
    return hasWinningConnection(newBoard, column, rowIndex, player);
  };

  // Find the best move for the AI
  const findBestMove = (board: number[][]): number => {
    const availableMoves = getAvailableMoves(board);
    if (availableMoves.length === 0) return -1;
    
    // 1. Check for immediate winning move
    for (const column of availableMoves) {
      // Use a copy of the board for checking to avoid modifying it
      const tempBoard = board.map(col => [...col]);
      const rowIndex = getRowForColumn(tempBoard, column);
      if (rowIndex !== -1) {
        tempBoard[column][rowIndex] = AI;
        // Use a special check that doesn't set winning pieces
        if (hasWinningConnection(tempBoard, column, rowIndex, AI)) {
          return column;
        }
      }
    }

    // 2. Block player's immediate winning move
    for (const column of availableMoves) {
      // Use a copy of the board for checking to avoid modifying it
      const tempBoard = board.map(col => [...col]);
      const rowIndex = getRowForColumn(tempBoard, column);
      if (rowIndex !== -1) {
        tempBoard[column][rowIndex] = PLAYER;
        // Use a special check that doesn't set winning pieces
        if (hasWinningConnection(tempBoard, column, rowIndex, PLAYER)) {
          return column;
        }
      }
    }

    // 3. Look for potential setups - where placing a piece could create two winning threats
    const moveScores = availableMoves.map(column => {
      return { column, score: evaluateMove(board, column, AI) };
    });
    
    // Sort by score descending
    moveScores.sort((a, b) => b.score - a.score);
    
    // If we have a clearly good move, take it
    if (moveScores.length > 0 && moveScores[0].score >= 5) {
      return moveScores[0].column;
    }
    
    // 4. Avoid filling columns too much (distribute pieces more evenly)
    // Count pieces in each column
    const columnHeights = board.map(column => column.filter(cell => cell !== EMPTY).length);
    
    // Filter moves to avoid columns that are already too full compared to others
    const averageHeight = columnHeights.reduce((sum, height) => sum + height, 0) / COLUMNS;
    const balancedMoves = availableMoves.filter(column => {
      // Don't play in columns that are already 2 higher than average
      return columnHeights[column] <= averageHeight + 1;
    });
    
    // If we have balanced moves available, choose from those
    if (balancedMoves.length > 0) {
      // Prefer center columns with balanced distribution
      const preferenceOrder = [3, 2, 4, 1, 5, 0, 6];
      for (const column of preferenceOrder) {
        if (balancedMoves.includes(column)) {
          return column;
        }
      }
    }

    // 5. Fallback to center preference if no balanced moves
    const preferenceOrder = [3, 2, 4, 1, 5, 0, 6];
    for (const column of preferenceOrder) {
      if (availableMoves.includes(column)) {
        return column;
      }
    }

    // 6. Last resort: random
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // Check for winning connection without setting winning pieces
  const hasWinningConnection = (board: number[][], col: number, row: number, player: number): boolean => {
    // Check horizontal
    let count = 0;
    for (let c = 0; c < COLUMNS; c++) {
      if (board[c][row] === player) {
        count++;
        if (count >= 4) return true;
      } else {
        count = 0;
      }
    }

    // Check vertical
    count = 0;
    for (let r = 0; r < ROWS; r++) {
      if (board[col][r] === player) {
        count++;
        if (count >= 4) return true;
      } else {
        count = 0;
      }
    }

    // Check diagonal (top-left to bottom-right)
    for (let c = 0; c <= COLUMNS - 4; c++) {
      for (let r = 0; r <= ROWS - 4; r++) {
        let diagWin = true;
        for (let i = 0; i < 4; i++) {
          if (board[c + i][r + i] !== player) {
            diagWin = false;
            break;
          }
        }
        if (diagWin) {
          return true;
        }
      }
    }

    // Check diagonal (top-right to bottom-left)
    for (let c = COLUMNS - 1; c >= 3; c--) {
      for (let r = 0; r <= ROWS - 4; r++) {
        let diagWin = true;
        for (let i = 0; i < 4; i++) {
          if (board[c - i][r + i] !== player) {
            diagWin = false;
            break;
          }
        }
        if (diagWin) {
          return true;
        }
      }
    }

    return false;
  };

  // Evaluate how good a move is (higher score = better move)
  const evaluateMove = (board: number[][], column: number, player: number): number => {
    const opponent = player === PLAYER ? AI : PLAYER;
    const newBoard = board.map(col => [...col]);
    const rowIndex = getRowForColumn(newBoard, column);
    
    if (rowIndex === -1) return -100; // Column is full
    
    newBoard[column][rowIndex] = player;
    let score = 0;
    
    // Check if this creates a threat (3 in a row with open end)
    score += evaluateThreats(newBoard, column, rowIndex, player);
    
    // Check if this blocks opponent's threats
    score += evaluateThreats(newBoard, column, rowIndex, opponent) / 2;
    
    // Prefer moves that don't allow opponent to win on top
    if (rowIndex < ROWS - 1) {
      const testBoard = newBoard.map(col => [...col]);
      testBoard[column][rowIndex + 1] = opponent;
      if (hasWinningConnection(testBoard, column, rowIndex + 1, opponent)) {
        score -= 3; // Penalty for setting up opponent win
      }
    }
    
    // Slightly prefer center columns
    const distanceFromCenter = Math.abs(column - 3);
    score -= distanceFromCenter * 0.5;
    
    return score;
  };

  // Evaluate if a position creates threats (3 in a row with space to win)
  const evaluateThreats = (board: number[][], col: number, row: number, player: number): number => {
    let threatCount = 0;
    
    // Check horizontal threats
    threatCount += checkDirectionalThreats(board, col, row, player, 1, 0);
    
    // Check vertical threats
    threatCount += checkDirectionalThreats(board, col, row, player, 0, 1);
    
    // Check diagonal threats (top-left to bottom-right)
    threatCount += checkDirectionalThreats(board, col, row, player, 1, 1);
    
    // Check diagonal threats (top-right to bottom-left)
    threatCount += checkDirectionalThreats(board, col, row, player, -1, 1);
    
    return threatCount * 2; // Weight threats highly
  };

  // Check for threats in a specific direction
  const checkDirectionalThreats = (
    board: number[][], 
    col: number, 
    row: number, 
    player: number,
    dCol: number,
    dRow: number
  ): number => {
    let count = 1; // Count the piece we just placed
    let openEnds = 0;
    
    // Check in positive direction
    let c = col + dCol;
    let r = row + dRow;
    let foundOpen = false;
    
    while (c >= 0 && c < COLUMNS && r >= 0 && r < ROWS) {
      if (board[c][r] === player) {
        count++;
      } else if (board[c][r] === EMPTY) {
        openEnds++;
        foundOpen = true;
        break;
      } else {
        break;
      }
      c += dCol;
      r += dRow;
    }
    
    // Check in negative direction
    c = col - dCol;
    r = row - dRow;
    foundOpen = false;
    
    while (c >= 0 && c < COLUMNS && r >= 0 && r < ROWS) {
      if (board[c][r] === player) {
        count++;
      } else if (board[c][r] === EMPTY) {
        openEnds++;
        foundOpen = true;
        break;
      } else {
        break;
      }
      c -= dCol;
      r -= dRow;
    }
    
    // Three in a row with at least one open end is a threat
    if (count >= 3 && openEnds > 0) {
      return count + openEnds; // Higher score for more connected pieces and more open ends
    }
    
    return 0;
  };

  // Make a move on the board
  const makeMove = (columnIndex: number) => {
    // Find the row where the piece will land
    const rowIndex = getRowForColumn(board, columnIndex);
    if (rowIndex === -1) return; // Column is full
    
    setProcessingMove(true);
    
    // This will trigger the animation in the Board component
    const playerToMove = currentPlayer;
    
    // Trigger the animation via ref
    if (boardRef.current) {
      boardRef.current.triggerDiscDrop(columnIndex, playerToMove);
    }
    
    // Add delay for animation to complete before updating the board
    setTimeout(() => {
      const newBoard = [...board];
      newBoard[columnIndex][rowIndex] = playerToMove;
      
      // Clear any previous winning pieces before checking for new ones
      setWinningPieces([]);
      
      // Check for winner
      if (checkWinner(newBoard, columnIndex, rowIndex, playerToMove)) {
        setWinner(playerToMove);
        setGameOver(true);
        
        // Record the win in stats
        if (playerToMove === PLAYER) {
          StatsManager.recordPlayerWin();
        } else {
          StatsManager.recordAIWin();
        }
        
        // Dispatch custom event to update stats component
        window.dispatchEvent(new Event('stats-updated'));
        
        // Play win sound after a slight delay to avoid competing with the drop sound
        setTimeout(() => {
          SoundManager.play('win');
        }, 200);
      } 
      // Check for draw
      else if (checkDraw(newBoard)) {
        setGameOver(true);
        StatsManager.recordDraw();
        window.dispatchEvent(new Event('stats-updated'));
      } 
      // Switch players
      else {
        setCurrentPlayer(playerToMove === PLAYER ? AI : PLAYER);
      }
      
      // Update the board state after all checks
      setBoard(newBoard);
      setProcessingMove(false);
    }, 600); // Match with animation duration
  };

  const handleCellClick = (columnIndex: number) => {
    // Only allow player clicks, not AI
    if (currentPlayer !== PLAYER || gameOver || processingMove) return;
    
    makeMove(columnIndex);
  };

  const getPlayerName = (playerNum: number): string => {
    return playerNum === PLAYER ? "You" : "Claude";
  };

  const getPlayerTurnText = (playerNum: number): string => {
    return playerNum === PLAYER ? "Your turn" : "Claude's turn";
  };

  return (
    <div className="game">
      <Header 
        soundEnabled={soundEnabled} 
        toggleSound={toggleSound} 
        resetGame={resetGame}
      />
      
      <div className="game-info">
        {gameOver ? (
          winner ? (
            <div className="winner">
              {getPlayerName(winner)} won!
              <div className={`winner-indicator ${winner === PLAYER ? 'red' : 'yellow'}`}></div>
            </div>
          ) : (
            <div className="draw">It's a draw!</div>
          )
        ) : (
          <div className="current-player">
            {isThinking ? (
              <>Claude is thinking...</>
            ) : (
              <>{getPlayerTurnText(currentPlayer)}</>
            )}
            <div className={`player-indicator ${currentPlayer === PLAYER ? 'red' : 'yellow'}`}></div>
          </div>
        )}
      </div>
      
      <Board 
        ref={boardRef}
        board={board} 
        onClick={handleCellClick}
        winningPieces={winningPieces}
      />
      
      <button className="reset-button" onClick={resetGame} style={{ display: 'none' }}>
        New Game
      </button>
    </div>
  );
};

export default Game; 