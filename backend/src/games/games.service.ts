import { Injectable } from '@nestjs/common';

@Injectable()
export class GamesService {
  private highScore = 0;
  private rockScores = { user: 0, computer: 0 };

  getHighScore(): number {
    return this.highScore;
  }

  saveHighScore(score: number): number {
    if (score > this.highScore) {
      this.highScore = score;
    }
    return this.highScore;
  }

  getRockScores() {
    return this.rockScores;
  }

  playRock(choice: string): any {
    const choices = ['Taş', 'Kağıt', 'Makas'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = 'lose';
    if (choice === computerChoice) {
      result = 'draw';
    } else if (
      (choice === 'Taş' && computerChoice === 'Makas') ||
      (choice === 'Kağıt' && computerChoice === 'Taş') ||
      (choice === 'Makas' && computerChoice === 'Kağıt')
    ) {
      result = 'win';
    }

    if (result === 'win') {
      this.rockScores.user += 1;
    } else if (result === 'lose') {
      this.rockScores.computer += 1;
    }

    let winner: string | null = null;
    if (this.rockScores.user >= 3) {
      winner = 'user';
    } else if (this.rockScores.computer >= 3) {
      winner = 'computer';
    }

    return {
      userChoice: choice,
      computerChoice,
      result,
      scores: this.rockScores,
      winner,
    };
  }

  resetRock() {
    this.rockScores = { user: 0, computer: 0 };
    return this.rockScores;
  }
}
