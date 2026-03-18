import { createId } from '@paralleldrive/cuid2';

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
      throw new Error('El contenido del diario no puede estar vacío');
    }
    if (props.content.trim().length > 5000) {
      throw new Error('El contenido excede el límite de 5000 caracteres');
    }
    const now = new Date();
    return new JournalEntry({
      id: createId(),
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
