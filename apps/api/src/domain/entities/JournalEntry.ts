import { JournalContentEmptyError, JournalContentTooLongError } from '@domain/errors';

const JOURNAL_CONTENT_MAX_LENGTH = 5000;

interface JournalEntryProps {
  id: string;
  userId: string;
  content: string;
  aiAnalysis: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateJournalEntryProps {
  userId: string;
  content: string;
}

export class JournalEntry {
  private constructor(private props: JournalEntryProps) {}

  static create(props: CreateJournalEntryProps): JournalEntry {
    if (!props.content || props.content.trim().length === 0) {
      throw new JournalContentEmptyError();
    }
    if (props.content.trim().length > JOURNAL_CONTENT_MAX_LENGTH) {
      throw new JournalContentTooLongError(JOURNAL_CONTENT_MAX_LENGTH);
    }
    const now = new Date();
    return new JournalEntry({
      id: crypto.randomUUID(),
      userId: props.userId,
      content: props.content.trim(),
      aiAnalysis: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: JournalEntryProps): JournalEntry {
    return new JournalEntry(props);
  }

  setAiAnalysis(analysis: string): void {
    this.props.aiAnalysis = analysis;
    this.props.updatedAt = new Date();
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get content(): string { return this.props.content; }
  get aiAnalysis(): string | null { return this.props.aiAnalysis; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
