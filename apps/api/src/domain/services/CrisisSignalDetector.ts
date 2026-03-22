const CRISIS_KEYWORDS = [
  'suicidio',
  'morir',
  'hacerme daño',
  'no quiero vivir',
  'acabar con todo',
  'matarme',
  'quitarme la vida',
  'no tiene sentido vivir',
  'kill myself',
  'end my life',
  'want to die',
  'no reason to live',
  'suicide',
  'self harm',
  'hurt myself',
  'end it all',
  'cant go on',
  "can't go on",
  'rather be dead',
];

export function containsCrisisKeywords(text: string | null | undefined): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
