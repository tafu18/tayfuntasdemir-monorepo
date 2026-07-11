'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface Card {
  id: number;
  val: number;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won'>('playing');

  const icons = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍍', '🥝', '🥑'];

  const initGame = () => {
    // Generate pairs
    const pairs = [...Array(8).keys()];
    const values = [...pairs, ...pairs];
    // Shuffle
    const shuffled = values
      .map((val, idx) => ({ id: idx, val, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setSelected([]);
    setMoves(0);
    setStatus('playing');
  };

  useEffect(() => {
    initGame();
  }, []);

  const flipCard = (id: number) => {
    if (status !== 'playing' || selected.length >= 2 || cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newSelected;
      if (cards[first].val === cards[second].val) {
        // Matched!
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setSelected([]);

        // Check win
        if (newCards.every(c => c.matched)) {
          setStatus('won');
        }
      } else {
        // Not matched, flip back after 1 sec
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setSelected([]);
        }, 1000);
      }
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-md mb-8 flex items-center justify-between">
          <Link href="/game/hub" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Oyunlara Dön
          </Link>
          <h1 className="text-2xl font-bold">Hafıza Oyunu</h1>
        </div>

        {/* Stats */}
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center space-y-6">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm font-semibold text-zinc-500">Hamle Sayısı: {moves}</span>
            <button
              onClick={initGame}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Yeniden Başlat
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-4 gap-4 w-full">
            {cards.map((card) => {
              const show = card.flipped || card.matched;
              return (
                <div
                  key={card.id}
                  onClick={() => flipCard(card.id)}
                  className={`aspect-square flex items-center justify-center text-3xl rounded-xl cursor-pointer select-none transition-all duration-300 border ${
                    show
                      ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rotate-0'
                      : 'bg-zinc-900 dark:bg-white text-transparent border-zinc-950 dark:border-zinc-200 hover:opacity-85'
                  }`}
                >
                  {show ? icons[card.val] : '❓'}
                </div>
              );
            })}
          </div>

          {/* Win Dialog */}
          {status === 'won' && (
            <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl text-center font-bold w-full space-y-2">
              <div>Tebrikler, oyunu kazandınız! 🏆</div>
              <div className="text-xs font-normal">Oyunu {moves} hamlede tamamladınız.</div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
