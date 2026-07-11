import { Controller, Get, Post, Body } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('snake/high-score')
  getHighScore() {
    return { high_score: this.gamesService.getHighScore() };
  }

  @Post('snake/score')
  saveScore(@Body('score') score: number) {
    const high = this.gamesService.saveHighScore(Number(score));
    return { high_score: high };
  }

  @Get('rock/scores')
  getRockScores() {
    return this.gamesService.getRockScores();
  }

  @Post('rock/play')
  playRock(@Body('choice') choice: string) {
    return this.gamesService.playRock(choice);
  }

  @Post('rock/reset')
  resetRock() {
    return this.gamesService.resetRock();
  }
}
