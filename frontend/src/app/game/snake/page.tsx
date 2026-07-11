'use client';

import { useEffect, useRef, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Play, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Grid/Cell configurations
  const gridCount = 20;
  const speed = 100; // ms

  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 });
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 });

  // Get High Score on load
  useEffect(() => {
    api.get('/games/snake/high-score')
      .then(res => {
        setHighScore(res.data?.high_score || 0);
      })
      .catch(err => console.error(err));
  }, []);

  // Handle Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      switch (e.key) {
        case 'ArrowUp':
          if (dir.y !== 1) setDir({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (dir.y !== -1) setDir({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (dir.x !== 1) setDir({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (dir.x !== -1) setDir({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, gameStarted, gameOver]);

  // Main Loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      const newHead = {
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y,
      };

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= gridCount || newHead.y < 0 || newHead.y >= gridCount) {
        handleGameOver();
        clearInterval(interval);
        return;
      }

      // Check self collision
      for (const cell of snake) {
        if (cell.x === newHead.x && cell.y === newHead.y) {
          handleGameOver();
          clearInterval(interval);
          return;
        }
      }

      const newSnake = [newHead, ...snake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    }, speed);

    return () => clearInterval(interval);
  }, [snake, dir, food, gameStarted, gameOver]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / gridCount;

    // Clear board
    ctx.fillStyle = '#18181b'; // darkbg
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ef4444'; // Red food
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    snake.forEach((cell, idx) => {
      ctx.fillStyle = idx === 0 ? '#10b981' : '#34d399'; // Green head / tail
      ctx.fillRect(cell.x * cellSize + 1, cell.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });
  }, [snake, food]);

  const generateFood = (currSnake: any[]) => {
    let newFood: { x: number; y: number } | undefined = undefined;
    let conflict = true;
    while (conflict) {
      newFood = {
        x: Math.floor(Math.random() * gridCount),
        y: Math.floor(Math.random() * gridCount),
      };
      conflict = currSnake.some(cell => cell.x === newFood!.x && cell.y === newFood!.y);
    }
    setFood(newFood!);
  };

  const handleGameOver = () => {
    setGameOver(true);
    // Send score to backend
    api.post('/games/snake/score', { score: score + 10 })
      .then((res) => {
        setHighScore(res.data?.high_score || highScore);
      })
      .catch((err) => console.error(err));
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 5 });
    setDir({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-lg mb-8 flex items-center justify-between">
          <Link href="/game/hub" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Oyunlara Dön
          </Link>
          <h1 className="text-2xl font-bold">Yılan Oyunu</h1>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-6">
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center bg-white dark:bg-zinc-900 flex justify-between items-center">
            <span className="text-sm text-zinc-500 font-semibold">Skor</span>
            <span className="text-xl font-bold font-mono text-emerald-500">{score}</span>
          </div>
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center bg-white dark:bg-zinc-900 flex justify-between items-center">
            <span className="text-sm text-zinc-500 font-semibold flex items-center">
              <Trophy className="h-4 w-4 mr-1 text-amber-500" />
              En Yüksek
            </span>
            <span className="text-xl font-bold font-mono text-amber-500">{highScore}</span>
          </div>
        </div>

        {/* Canvas & Overlay */}
        <div className="relative border-4 border-zinc-900 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-lg bg-zinc-950">
          <canvas ref={canvasRef} width={400} height={400} className="block max-w-full" />

          {/* Start Overlay */}
          {!gameStarted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-white space-y-4">
              <Gamepad2 className="h-16 w-16 text-emerald-500 animate-bounce" />
              <h2 className="text-2xl font-bold">Hazır mısın?</h2>
              <p className="text-sm text-zinc-400 text-center px-6">Yön tuşlarını kullanarak yılanı kontrol et, engellere çarpmadan elmalarını topla.</p>
              <button
                onClick={() => setGameStarted(true)}
                className="inline-flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg transition-colors"
              >
                <Play className="h-5 w-5 mr-2" />
                Başla
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-white space-y-4">
              <h2 className="text-3xl font-extrabold text-red-500 tracking-wider">OYUN BİTTİ</h2>
              <p className="text-lg">Skorunuz: <span className="font-bold text-emerald-400">{score}</span></p>
              <button
                onClick={resetGame}
                className="inline-flex items-center px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-lg border border-zinc-700 transition-colors"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Tekrar Dene
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// Simple placeholder icon
function Gamepad2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="3" />
    </svg>
  );
}
