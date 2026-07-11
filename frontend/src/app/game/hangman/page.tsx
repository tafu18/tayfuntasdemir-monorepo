'use client';

import { useEffect, useState } from 'react';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Skull } from 'lucide-react';

export default function HangmanGame() {
  const wordsList = [
    'yazilim', 'bilgisayar', 'klavye', 'algoritma', 'veritabani',
    'sunucu', 'sistem', 'internet', 'kodlama', 'gelistirici'
  ];

  const hangmanStages = [
    `
  +---+
      |
      |
      |
      |
      |
=========`,
    `
  +---+
  O   |
      |
      |
      |
      |
=========`,
    `
  +---+
  O   |
  |   |
      |
      |
      |
=========`,
    `
  +---+
  O   |
 /|   |
      |
      |
      |
=========`,
    `
  +---+
  O   |
 /|\\  |
      |
      |
      |
=========`,
    `
  +---+
  O   |
 /|\\  |
 /    |
      |
      |
=========`,
    `
  +---+
  O   |
 /|\\  |
 / \\  |
      |
      |
=========`
  ];

  const alphabet = 'abcçdefgğhıijklmnoöprsştuüvyz'.split('');

  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(6);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const startNewGame = () => {
    const selected = wordsList[Math.floor(Math.random() * wordsList.length)];
    setWord(selected);
    setGuessedLetters([]);
    setAttemptsLeft(6);
    setStatus('playing');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const guessLetter = (letter: string) => {
    if (status !== 'playing' || guessedLetters.includes(letter)) return;

    const newGuesses = [...guessedLetters, letter];
    setGuessedLetters(newGuesses);

    if (word.includes(letter)) {
      // Check if won
      const isWon = word.split('').every(char => newGuesses.includes(char));
      if (isWon) setStatus('won');
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) setStatus('lost');
    }
  };

  const hiddenWord = word.split('').map(char => (guessedLetters.includes(char) ? char : '_')).join(' ');

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-lg mb-8 flex items-center justify-between">
          <Link href="/game/hub" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Oyunlara Dön
          </Link>
          <h1 className="text-2xl font-bold">Adam Asmaca</h1>
        </div>

        {/* Board */}
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm flex flex-col items-center space-y-8">
          {/* Visual hangman illustration */}
          <pre className="font-mono text-lg text-zinc-850 dark:text-zinc-300 leading-tight select-none">
            {hangmanStages[6 - attemptsLeft]}
          </pre>

          {/* Word display */}
          <div className="text-3xl font-bold tracking-[0.3em] font-mono text-zinc-900 dark:text-white">
            {hiddenWord}
          </div>

          {/* Result Banner */}
          {status === 'won' && (
            <div className="p-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl text-center font-bold w-full">
              Tebrikler! Kelimeyi doğru bildiniz. 🎉
            </div>
          )}
          {status === 'lost' && (
            <div className="p-4 bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 rounded-xl text-center font-bold w-full space-y-1">
              <div>Kaybettiniz! 💀</div>
              <div className="text-sm font-normal">Doğru kelime: <span className="font-bold underline">{word}</span></div>
            </div>
          )}

          {/* Keyboard */}
          <div className="grid grid-cols-7 gap-2 w-full pt-4">
            {alphabet.map((letter) => {
              const isUsed = guessedLetters.includes(letter);
              return (
                <button
                  key={letter}
                  disabled={isUsed || status !== 'playing'}
                  onClick={() => guessLetter(letter)}
                  className={`py-2 text-sm font-bold uppercase rounded-lg border text-center transition-all ${
                    isUsed
                      ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800'
                      : 'border-zinc-200 hover:border-zinc-900 dark:border-zinc-850 dark:hover:border-white'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          {status !== 'playing' && (
            <button
              onClick={startNewGame}
              className="inline-flex items-center px-6 py-2.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold rounded-lg transition-colors w-full justify-center"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Yeniden Başla
            </button>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
