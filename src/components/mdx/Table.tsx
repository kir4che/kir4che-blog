type InlinePart =
  | { type: 'bold'; value: string }
  | { type: 'code'; value: string }
  | { type: 'text'; value: string };

type TableData = {
  headers: string[];
  rows: Array<Array<string | undefined>>;
};

const parseInline = (content: string): InlinePart[] =>
  content
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`'))
        return { type: 'code', value: part.slice(1, -1) };
      if (part.startsWith('**') && part.endsWith('**'))
        return { type: 'bold', value: part.slice(2, -2) };
      return { type: 'text', value: part };
    });

const mergeCols = (row: Array<string | undefined>) => {
  const merged: { content: string; colSpan: number }[] = [];
  let i = 0;

  while (i < row.length) {
    const content = row[i] ?? '';
    let span = 1;

    while (i + span < row.length && (row[i + span] ?? '') === content) span++;

    merged.push({ content, colSpan: span });
    i += span;
  }

  return merged;
};

const renderInline = (text: string) =>
  parseInline(text).map((part, i) => {
    if (part.type === 'bold') return <strong key={i}>{part.value}</strong>;
    if (part.type === 'code')
      return (
        <code
          key={i}
          className="bg-pink-100/80 px-1.5 py-0.5 text-sm text-pink-800 dark:bg-pink-800/30 dark:text-pink-200"
        >
          {part.value}
        </code>
      );
    return part.value;
  });

export const Table = ({ data }: { data: TableData }) => {
  if (!data) return null;

  return (
    <table className="my-6 w-full text-left [&_td]:px-3 [&_td]:py-2 [&_th]:bg-pink-100 [&_th]:px-3 [&_th]:py-2 dark:[&_th]:bg-pink-800/10">
      <thead>
        <tr>
          {data.headers.map((header, i) => (
            <th key={i} className="border border-pink-400 text-sm dark:border-pink-600/50">
              {renderInline(header)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, ri) => (
          <tr key={ri} className="even:bg-pink-50/50 dark:even:bg-pink-600/5">
            {mergeCols(row).map((cell, ci) => (
              <td
                key={ci}
                colSpan={cell.colSpan}
                className="border border-pink-400 text-sm/6 first:whitespace-nowrap dark:border-pink-600/50"
              >
                {renderInline(cell.content)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
