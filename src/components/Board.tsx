import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Cell from './Cell';
import './Board.css';
import { WinningPiece } from './Game';
import SoundManager from '../utils/SoundManager';

type BoardProps = {
  board: number[][];
  onClick: (columnIndex: number) => void;
  winningPieces: WinningPiece[];
};

type FallingDisc = {
  column: number;
  row: number;
  player: number;
  key: number;
};

// Allows the parent component to trigger animations
export type BoardHandle = {
  triggerDiscDrop: (columnIndex: number, player: number) => void;
};

const Board = forwardRef<BoardHandle, BoardProps>(({ board, onClick, winningPieces }, ref) => {
  const [fallingDiscs, setFallingDiscs] = useState<FallingDisc[]>([]);
  const [animationCount, setAnimationCount] = useState(0);
  
  // Find the first empty cell in a column
  const findEmptyCell = (columnIndex: number) => {
    const column = board[columnIndex];
    return column.findIndex(cell => cell === 0);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    triggerDiscDrop: (columnIndex: number, player: number) => {
      const targetRow = findEmptyCell(columnIndex);
      if (targetRow === -1) return; // Column is full
      
      // Add a new falling disc
      const newDisc: FallingDisc = {
        column: columnIndex,
        row: targetRow,
        player: player,
        key: animationCount
      };
      
      setFallingDiscs(prev => [...prev, newDisc]);
      setAnimationCount(prev => prev + 1);
      
      // Play sound with a delay timed to match better with the animation
      setTimeout(() => {
        SoundManager.play('drop');
      }, 300); // Increased to 300ms to play a fraction later
      
      // Remove the falling disc after animation and bounce completes
      setTimeout(() => {
        setFallingDiscs(discs => discs.filter(disc => disc.key !== newDisc.key));
      }, 700); // Animation duration + a little extra
    }
  }));

  const handleColumnClick = (columnIndex: number) => {
    const targetRow = findEmptyCell(columnIndex);
    
    // Don't allow clicks on full columns
    if (targetRow === -1) return;
    
    // Simply call the onClick handler - animation will be triggered by Game component
    onClick(columnIndex);
  };

  // Listen for board changes to trigger AI animations
  useEffect(() => {
    // Animation is now handled via ref method
  }, [board]);

  // Calculate the position and angle for the winning highlight
  const getWinningHighlightStyles = () => {
    if (winningPieces.length !== 4) return null;
    
    const first = winningPieces[0];
    const last = winningPieces[3];
    
    // Calculate direction
    const isHorizontal = first.row === last.row;
    const isVertical = first.col === last.col;
    const isDiagonalRight = first.col < last.col && first.row < last.row;
    const isDiagonalLeft = first.col > last.col && first.row < last.row;
    
    // Base size for cells
    const cellSize = 80; // 70px cell + 10px margin
    
    let width, height, left, top, transform;
    
    if (isHorizontal) {
      width = cellSize * 4;
      height = cellSize * 0.8;
      left = first.col * cellSize + 15;
      top = first.row * cellSize + cellSize * 0.1 + 15;
      transform = 'rotate(0deg)';
    } else if (isVertical) {
      width = cellSize * 0.8;
      height = cellSize * 4;
      left = first.col * cellSize + cellSize * 0.1 + 15;
      top = first.row * cellSize + 15;
      transform = 'rotate(0deg)';
    } else if (isDiagonalRight) {
      // Diagonal from top-left to bottom-right
      width = Math.sqrt(Math.pow(cellSize * 4, 2) * 2); // Length of diagonal using Pythagorean theorem
      height = cellSize * 0.8;
      
      // Position at the center of the first piece
      const centerX = first.col * cellSize + cellSize / 2 + 15;
      const centerY = first.row * cellSize + cellSize / 2 + 15;
      
      // Offset to place the highlight's center at the center of the connection
      const offsetX = (width / 2) - (cellSize / 2);
      // offsetY not needed here
      
      left = centerX - offsetX;
      top = centerY - (height / 2);
      transform = 'rotate(45deg)';
    } else if (isDiagonalLeft) {
      // Diagonal from top-right to bottom-left
      width = Math.sqrt(Math.pow(cellSize * 4, 2) * 2); // Length of diagonal using Pythagorean theorem
      height = cellSize * 0.8;
      
      // Position at the center of the first piece
      const centerX = first.col * cellSize + cellSize / 2 + 15;
      const centerY = first.row * cellSize + cellSize / 2 + 15;
      
      // Offset to place the highlight's center at the center of the connection
      const offsetX = (width / 2) - (cellSize / 2);
      // offsetY not needed here
      
      left = centerX - offsetX;
      top = centerY - (height / 2);
      transform = 'rotate(-45deg)';
    }
    
    return {
      width: `${width}px`,
      height: `${height}px`,
      left: `${left}px`,
      top: `${top}px`,
      transform,
    };
  };

  // Not using this variable, but keeping the function for future use
  // const winningHighlightStyles = getWinningHighlightStyles();

  return (
    <div className="board-container">
      {/* Back layer */}
      <div className="board-back"></div>
      
      {/* Middle layer - discs */}
      <div className="discs-container">
        {/* Render falling discs */}
        {fallingDiscs.map(disc => (
          <div 
            key={disc.key}
            className={`falling-disc ${disc.player === 1 ? 'red' : 'yellow'}`}
            style={{
              // Position horizontally based on column
              left: `${disc.column * 80 + 40}px`,
              // We need to be precise about the fall distance
              // ROWS = 6 total rows, where 0 is bottom and 5 is top
              // Row 0 (bottom) needs to fall all 6 rows (including above-board position)
              ['--fall-distance' as string]: 6 - disc.row
            }}
          >
            <div className="disc-inner"></div>
          </div>
        ))}

        {/* Static placed discs */}
        {board.map((column, columnIndex) => 
          column.map((cell, rowIndex) => 
            cell !== 0 && (
              <div
                key={`placed-${columnIndex}-${rowIndex}`}
                className={`placed-disc ${cell === 1 ? 'red' : 'yellow'} ${
                  winningPieces.some(piece => piece.col === columnIndex && piece.row === rowIndex) ? 'winning' : ''
                }`}
                style={{
                  left: `${columnIndex * 80 + 40}px`,
                  bottom: `${rowIndex * 80 + 40}px`
                }}
              >
                <div className="disc-inner"></div>
              </div>
            )
          )
        )}
      </div>
      
      {/* Front layer - board face with holes */}
      <div className="board-front">
        {board.map((column, columnIndex) => (
          <div key={columnIndex} className="column" onClick={() => handleColumnClick(columnIndex)}>
            {column.map((_, rowIndex) => (
              <div key={rowIndex} className="cell-hole" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Board; 