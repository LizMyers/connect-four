import React from 'react';
import './Cell.css';

type CellProps = {
  value: number;
  columnIndex: number;
  onClick: (columnIndex: number) => void;
  showDisc?: boolean;
  isWinningPiece?: boolean;
};

const Cell: React.FC<CellProps> = ({ 
  value, 
  columnIndex, 
  onClick, 
  showDisc = true,
  isWinningPiece = false
}) => {
  const handleClick = () => {
    onClick(columnIndex);
  };

  let cellClass = 'cell';
  if (value === 1) cellClass += ' red';
  if (value === 2) cellClass += ' yellow';
  if (isWinningPiece) cellClass += ' winning';

  return (
    <div className={cellClass} onClick={handleClick}>
      {showDisc && value !== 0 && <div className="disc" />}
    </div>
  );
};

export default Cell; 