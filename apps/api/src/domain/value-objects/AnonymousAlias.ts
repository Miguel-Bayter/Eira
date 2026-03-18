const ADJECTIVES = [
  'esperanzadora', 'valiente', 'tranquila', 'resiliente', 'serena',
  'fuerte', 'luminosa', 'gentil', 'pacífica', 'compasiva',
];

const NOUNS = [
  'mariposa', 'estrella', 'árbol', 'montaña', 'río',
  'luna', 'flor', 'viento', 'nube', 'aurora',
];

export class AnonymousAlias {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static generate(): AnonymousAlias {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)] ?? 'esperanzadora';
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)] ?? 'mariposa';
    const alias = `${noun.charAt(0).toUpperCase()}${noun.slice(1)} ${adj}`;
    return new AnonymousAlias(alias);
  }

  static fromString(value: string): AnonymousAlias {
    if (!value || value.trim().length === 0) {
      return AnonymousAlias.generate();
    }
    return new AnonymousAlias(value.trim());
  }

  equals(other: AnonymousAlias): boolean {
    return this.value === other.value;
  }
}
