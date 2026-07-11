'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Flag } from 'lucide-react';

interface Cell {
  x: number;
  y: number;
  hasMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacentMines: number;
}

export default function MinesweeperGame() {
  const size = 10;
  const mineCount = 15;

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const initGrid = () => {
    // Create grid
    const newGrid: Cell[][] = [];
    for (let x = 0; x < size; x++) {
      const row: Cell[] = [];
      for (let y = 0; y < size; y++) {
        row.push({
          x,
          y,
          hasMine: false,
          revealed: false,
          flagged: false,
          adjacentMines: 0,
        });
      }
      newGrid.push(row);
    }

    // Place mines
    let placed = 0;
    while (placed < mineCount) {
      const rx = Math.floor(Math.random() * size);
      const ry = Math.floor(Math.random() * size);
      if (!newGrid[rx][ry].hasMine) {
        newGrid[rx][ry].hasMine = true;
        placed++;
      }
    }

    // Calculate adjacents
    const adjDirections = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (newGrid[x][y].hasMine) continue;
        let count = 0;
        for (const [dx, dy] of adjDirections) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
            if (newGrid[nx][ny].hasMine) count++;
          }
        }
        newGrid[x][y].adjacentMines = count;
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
  };

  useEffect(() => {
    initGrid();
  }, []);

  const revealCell = (x: number, y: number) => {
    if (gameOver || gameWon || grid[x][y].revealed || grid[x][y].flagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    if (newGrid[x][y].hasMine) {
      // Hit a mine! Game over.
      setGameOver(true);
      revealAllMines(newGrid);
      return;
    }

    // Open cell recursive flood fill
    floodFill(newGrid, x, y);
    
    // Check if won
    let unrevealedSafeCells = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!newGrid[i][j].hasMine && !newGrid[i][j].revealed) {
          unrevealedSafeCells++;
        }
      }
    }

    setGrid(newGrid);
    if (unrevealedSafeCells === 0) {
      setGameWon(true);
    }
  };

  const revealAllMines = (currGrid: Cell[][]) => {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (currGrid[i][j].hasMine) {
          currGrid[i][j].revealed = true;
        }
      }
    }
    setGrid(currGrid);
  };

  const floodFill = (currGrid: Cell[][], x: number, y: number) => {
    if (x < 0 || x >= size || y < 0 || y >= size || currGrid[x][y].revealed || currGrid[x][y].flagged) return;

    currGrid[x][y].revealed = true;

    if (currGrid[x][y].adjacentMines === 0) {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      for (const [dx, dy] of directions) {
        floodFill(currGrid, x + dx, y + dy);
      }
    }
  };

  const toggleFlag = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameOver || gameWon || grid[x][y].revealed) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[x][y].flagged = !newGrid[x][y].flagged;
    setGrid(newGrid);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-md mb-8 flex items-center justify-between">
          <Link href="/game/hub" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Oyunlara Dön
          </Link>
          <h1 className="text-2xl font-bold">Mayın Tarlası</h1>
        </div>

        {/* Board & Stats */}
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center space-y-6">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm font-semibold text-zinc-500">Mayın Sayısı: {mineCount}</span>
            <button
              onClick={initGrid}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Yeniden Başlat
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-10 gap-1 border-2 border-zinc-200 dark:border-zinc-800 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 select-none">
            {grid.map((row, x) =>
              row.map((cell, y) => {
                let cellContent = '';
                if (cell.revealed) {
                  if (cell.hasMine) {
                    cellContent = '💣';
                  } else if (cell.adjacentMines > 0) {
                    cellContent = String(cell.adjacentMines);
                  }
                } else if (cell.flagged) {
                  cellContent = '🚩';
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => revealCell(x, y)}
                    onContextMenu={(e) => toggleFlag(e, x, y)}
                    className={`h-9 w-9 flex items-center justify-center text-xs font-bold rounded cursor-pointer transition-all ${
                      cell.revealed
                        ? cell.hasMine
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        : 'bg-zinc-300 dark:bg-zinc-700 border border-zinc-400/20 hover:bg-zinc-400 dark:hover:bg-zinc-650'
                    }`}
                  >
                    {cellContent}
                  </div>
                );
              })
            )}
          </div>

          {/* Feedback */}
          {gameOver && (
            <div className="p-3 bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 rounded-xl text-center font-bold w-full">
              Mayına bastınız! Oyun Bitti. 💥
            </div>
          )}
          {gameWon && (
            <div className="p-3 bg-blue-50 text-brand-dark dark:bg-blue-950/20 dark:text-brand-blue rounded-xl text-center font-bold w-full">
              Tebrikler, tüm mayınları temizlediniz! 🏆
            </div>
          )}
          <span className="text-xs text-zinc-400 text-center">İpucu: Hücreleri işaretlemek (Bayrak) için sağ tıklayın.</span>
        </div>
      </div>
    </PageTransition>
  );
}
