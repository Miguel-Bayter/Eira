import { Email } from '../value-objects/Email';
import { WellnessScore } from '../value-objects/WellnessScore';

export interface CreateUserProps {
  supabaseId: string;
  email: string;
  name: string;
}

export interface UserProps {
  id: string;
  supabaseId: string;
  email: string;
  name: string;
  wellnessScore: number;
  streakDays: number;
  lastMoodDate: Date | null;
  createdAt: Date;
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly supabaseId: string,
    public readonly email: Email,
    public readonly name: string,
    private _wellnessScore: WellnessScore,
    private _streakDays: number,
    private _lastMoodDate: Date | null,
    public readonly createdAt: Date,
  ) {}

  get wellnessScore(): number { return this._wellnessScore.value; }
  get streakDays(): number { return this._streakDays; }
  get lastMoodDate(): Date | null { return this._lastMoodDate; }

  static create(props: CreateUserProps): User {
    return new User(
      crypto.randomUUID(),
      props.supabaseId,
      Email.create(props.email),
      props.name.trim(),
      WellnessScore.create(50),
      0,
      null,
      new Date(),
    );
  }

  static reconstruct(props: UserProps): User {
    return new User(
      props.id,
      props.supabaseId,
      Email.create(props.email),
      props.name,
      WellnessScore.create(props.wellnessScore),
      props.streakDays,
      props.lastMoodDate,
      props.createdAt,
    );
  }

  incrementStreakForToday(): void {
    const today = new Date();
    if (!this._lastMoodDate) {
      this._streakDays = 1;
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = this._lastMoodDate.toDateString() === yesterday.toDateString();
      const isToday = this._lastMoodDate.toDateString() === today.toDateString();

      if (isYesterday) {
        this._streakDays += 1;
      } else if (!isToday) {
        this._streakDays = 1;
      }
    }
    this._lastMoodDate = today;
  }

  applyHighMoodBonus(): void {
    this._wellnessScore = this._wellnessScore.applyBonus(5);
  }

  applyLowMoodPenalty(): void {
    this._wellnessScore = this._wellnessScore.applyPenalty(3);
  }

  applyGameBonus(points: number): void {
    this._wellnessScore = this._wellnessScore.applyBonus(points);
  }
}
