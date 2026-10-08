import React from 'react';

interface MemoMarkdownRendererProps {
  content: string;
  onOpenStudio?: () => void;
}

/**
 * Institutional Underwriting Memo Markdown Renderer
 * Parses markdown into editorial, high-craft typography
 * utilizing Fraunces (serif), Plus Jakarta Sans (sans), and JetBrains Mono (financial figures).
 */
export const MemoMarkdownRenderer: React.FC<MemoMarkdownRendererProps> = ({ content, onOpenStudio }) => {
  const lines = content.split('\n');

  // Helper to format inline markdown (bold, italic, mono numbers, currencies)
  const formatInline = (text: string) => {
    // Split by markdown bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);

        // Check if the inner text is a financial metric or ratio
        const isMetric = /[$%xX]|\b\d+(\.\d+)?\b/.test(inner) && inner.length < 30;

        if (isMetric && (inner.includes('$') || inner.includes('%') || inner.includes('x') || inner.includes('X'))) {
          return (
            <span
              key={idx}
              className="font-mono font-semibold text-[#0B3B24] dark:text-[#34D399] bg-[#E8F5EE] dark:bg-[#064E3B]/30 px-1.5 py-0.5 rounded text-[11px] sm:text-xs inline-block tracking-tight"
            >
              {inner}
            </span>
          );
        }

        return (
          <strong key={idx} className="font-semibold text-[#111110] dark:text-[#F4F3EF]">
            {inner}
          </strong>
        );
      }

      // Format backtick code `code`
      if (part.includes('`')) {
        const subParts = part.split(/(`[^`]+`)/g);
        return subParts.map((sub, sIdx) => {
          if (sub.startsWith('`') && sub.endsWith('`')) {
            return (
              <code
                key={`${idx}-${sIdx}`}
                className="font-mono text-[11px] bg-[#F1EFEB] dark:bg-[#20201D] text-[#8C8880] dark:text-[#D4D1CA] px-1.5 py-0.5 rounded border border-[#E5E4DF] dark:border-[#2E2E2A]"
              >
                {sub.slice(1, -1)}
              </code>
            );
          }
          return sub;
        });
      }

      return part;
    });
  };

  const renderedElements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      const items = [...listItems];
      listItems = [];
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`} className="my-2.5 space-y-1.5 pl-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed text-[#2D2B28] dark:text-[#E2DFD8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0 mt-2"></span>
              <span className="flex-1">{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
  };

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      const block = codeBuffer.join('\n');
      codeBuffer = [];
      renderedElements.push(
        <div
          key={`code-${renderedElements.length}`}
          className="my-3 p-3.5 rounded-xl bg-[#141413] text-[#E8F5EE] border border-[#272624] font-mono text-[11px] overflow-x-auto leading-relaxed shadow-inner"
        >
          <pre>{block}</pre>
        </div>
      );
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Check headers
    if (trimmed.startsWith('### ')) {
      flushList();
      renderedElements.push(
        <div key={`h3-${i}`} className="mt-3.5 mb-1.5 first:mt-0">
          <h4 className="font-serif font-bold text-sm sm:text-base text-[#111110] dark:text-[#F4F3EF] tracking-tight flex items-center gap-2">
            <span className="w-1 h-3.5 rounded-full bg-[#059669]"></span>
            <span>{trimmed.replace(/^###\s+/, '')}</span>
          </h4>
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      renderedElements.push(
        <div key={`h2-${i}`} className="mt-4 mb-2 first:mt-0 pb-1 border-b border-[#E5E4DF] dark:border-[#262624]">
          <h3 className="font-serif font-bold text-base sm:text-lg text-[#111110] dark:text-[#F4F3EF] tracking-tight">
            {trimmed.replace(/^##\s+/, '')}
          </h3>
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      renderedElements.push(
        <div key={`h1-${i}`} className="mt-4 mb-2 first:mt-0 pb-1.5 border-b border-[#E5E4DF] dark:border-[#262624]">
          <h2 className="font-serif font-bold text-lg sm:text-xl text-[#111110] dark:text-[#F4F3EF] tracking-tight">
            {trimmed.replace(/^#\s+/, '')}
          </h2>
        </div>
      );
      continue;
    }

    // Check blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      renderedElements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2.5 pl-3 py-1 border-l-2 border-[#D97706] bg-[#FEF3C7]/20 dark:bg-[#78350F]/15 rounded-r-lg text-xs italic text-[#57534E] dark:text-[#D6D3D1]"
        >
          {formatInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      continue;
    }

    // Check list items
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemContent = trimmed.replace(/^[•\-*]\s+/, '');
      listItems.push(itemContent);
      continue;
    }

    // Check numbered items
    if (/^\d+\.\s+/.test(trimmed)) {
      flushList();
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        renderedElements.push(
          <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 text-xs sm:text-[13px] leading-relaxed">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF9F5] dark:bg-[#20201D] border border-[#E5E4DF] dark:border-[#2D2D29] text-[#78716C] shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <span className="flex-1 text-[#2D2B28] dark:text-[#E2DFD8]">{formatInline(numMatch[2])}</span>
          </div>
        );
        continue;
      }
    }

    // Check markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      // Check if it's separator line
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }
      renderedElements.push(
        <div key={`table-row-${i}`} className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1.5 border-b border-[#E5E4DF]/60 dark:border-[#262624]/60 text-xs font-mono">
          {cells.map((cell, cIdx) => (
            <div key={cIdx} className={`${cIdx === 0 ? 'font-bold text-[#111110] dark:text-[#F4F3EF]' : 'text-right tabular-nums text-[#0B3B24] dark:text-[#34D399]'}`}>
              {formatInline(cell)}
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Empty line separates paragraphs
    if (!trimmed) {
      flushList();
      continue;
    }

    // Regular paragraph
    flushList();
    renderedElements.push(
      <p key={`p-${i}`} className="my-1.5 text-xs sm:text-[13px] leading-relaxed text-[#2D2B28] dark:text-[#E2DFD8]">
        {formatInline(trimmed)}
      </p>
    );
  }

  flushList();
  flushCode();

  return <div className="space-y-1 font-sans">{renderedElements}</div>;
};
