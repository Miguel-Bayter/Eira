import { MoodScore } from '../value-objects/MoodScore';
import { Emotion } from '../value-objects/Emotion';

export interface CreateMoodEntryProps {
  userId: string;
  score: number;
  emotion: string;
  note?: string;
}

export interface MoodEntryProps {
  id: string;
  userId: string;
  score: number;
  emotion: string;
  note: string | null;
  isCrisis: boolean;
  createdAt: Date;
}

const CRISIS_KEYWORDS = [
  'suicidio', 'morir', 'hacerme daño', 'no quiero vivir', 'acabar con todo',
  'matarme', 'quitarme la vida', 'no tiene sentido vivir',
];

export class MoodEntry {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly score: MoodScore,
    public readonly emotion: Emotion,
    public readonly note: string | null,
    public readonly isCrisis: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateMoodEntryProps): MoodEntry {
    const score = MoodScore.create(props.score);
    const emotion = Emotion.create(props.emotion);
    const noteHasCrisis = MoodEntry.noteContainsCrisisKeywords(props.note ?? null);
    return new MoodEntry(
      crypto.randomUUID(),
      props.userId,
      score,
      emotion,
      props.note ?? null,
      score.isCrisis() || noteHasCrisis,
      new Date(),
    );
  }

  static reconstruct(props: MoodEntryProps): MoodEntry {
    return new MoodEntry(
      props.id,
      props.userId,
      MoodScore.create(props.score),
      Emotion.create(props.emotion),
      props.note,
      props.isCrisis,
      props.createdAt,
    );
  }

  private static noteContainsCrisisKeywords(note: string | null): boolean {
    if (!note) return false;
    const lower = note.toLowerCase();
    return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
  }
}
