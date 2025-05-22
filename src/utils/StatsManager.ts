interface GameStats {
  playerWins: number;
  aiWins: number;
  gamesPlayed: number;
}

const STATS_KEY = 'connect_four_stats';

class StatsManager {
  private stats: GameStats;

  constructor() {
    this.stats = this.loadStats();
  }

  private loadStats(): GameStats {
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      try {
        return JSON.parse(savedStats) as GameStats;
      } catch (e) {
        console.error('Error parsing stats from localStorage:', e);
      }
    }
    // Default stats if nothing is saved
    return {
      playerWins: 0,
      aiWins: 0,
      gamesPlayed: 0
    };
  }

  private saveStats(): void {
    localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public recordPlayerWin(): void {
    this.stats.playerWins++;
    this.stats.gamesPlayed++;
    this.saveStats();
  }

  public recordAIWin(): void {
    this.stats.aiWins++;
    this.stats.gamesPlayed++;
    this.saveStats();
  }

  public recordDraw(): void {
    this.stats.gamesPlayed++;
    this.saveStats();
  }

  public resetStats(): void {
    this.stats = {
      playerWins: 0,
      aiWins: 0,
      gamesPlayed: 0
    };
    this.saveStats();
  }
}

export default new StatsManager(); 