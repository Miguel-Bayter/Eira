export type GameType = 'breathing' | 'bubble_pop' | 'zen_garden' | 'coloring';

const POINTS_BY_TYPE: Record<GameType, number> = {
  breathing: 5,
  zen_garden: 4,
  coloring: 4,
  bubble_pop: 3,
};

export interface GameSessionProps {
  id: string;
  userId: string;
  gameType: GameType;
  durationSeconds: number;
  wellnessPointsEarned: number;
  completedAt: Date;
}

export interface CreateGameSessionProps {
  userId: string;
  gameType: GameType;
  durationSeconds: number;
}

export class GameSession {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly gameType: GameType,
    public readonly durationSeconds: number,
    public readonly wellnessPointsEarned: number,
    public readonly completedAt: Date,
  ) {}

  static create(props: CreateGameSessionProps): GameSession {
    const points = POINTS_BY_TYPE[props.gameType];
    return new GameSession(
      crypto.randomUUID(),
      props.userId,
      props.gameType,
      props.durationSeconds,
      points,
      new Date(),
    );
  }

  static reconstruct(props: GameSessionProps): GameSession {
    return new GameSession(
      props.id,
      props.userId,
      props.gameType,
      props.durationSeconds,
      props.wellnessPointsEarned,
      props.completedAt,
    );
  }
}
