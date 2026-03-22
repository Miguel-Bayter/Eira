import { Fragment } from 'react';

interface JournalFormattedAnalysisProps {
  content: string;
}

function tokenizeMarkdown(content: string): string[] {
  return content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
}

export function JournalFormattedAnalysis({ content }: JournalFormattedAnalysisProps) {
  const tokens = tokenizeMarkdown(content);

  return (
    <>
      {tokens.map((token, index) => {
        const isBold = token.startsWith('**') && token.endsWith('**') && token.length > 4;
        if (!isBold) {
          return <Fragment key={`${token}-${index}`}>{token}</Fragment>;
        }

        return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
      })}
    </>
  );
}
