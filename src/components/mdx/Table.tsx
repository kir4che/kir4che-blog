interface TableProps {
  data: {
    headers: string[];
    rows: string[][];
  };
}

const Table: React.FC<TableProps> = ({ data }) => {
  const renderInlineCode = (content: string) => {
    const parts = content.split(/(`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const text = part.slice(1, -1);
        return (
          <code
            key={index}
            className='bg-pink-100/80 px-1.5 py-0.5 font-mono text-sm text-pink-800 dark:bg-pink-800/30 dark:text-pink-200'
          >
            {text}
          </code>
        );
      }

      return part ? <span key={index}>{part}</span> : null;
    });
  };

  const mergeCols = (row: string[]) => {
    const merged: { content: string; colSpan: number }[] = [];
    let i = 0;

    while (i < row.length) {
      const content = row[i];
      let span = 1;

      while (i + span < row.length && row[i + span] === content) span++;

      merged.push({ content, colSpan: span });
      i += span;
    }

    return merged;
  };

  return (
    <table className='my-6 w-full text-left [&_td]:px-3 [&_td]:py-2 [&_th]:bg-pink-100 [&_th]:px-3 [&_th]:py-2 dark:[&_th]:bg-pink-800/10'>
      <thead>
        <tr>
          {data.headers.map((header, index) => (
            <th
              key={index}
              className='border border-pink-400 dark:border-pink-600/50'
            >
              {renderInlineCode(header)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className='even:bg-pink-50/50 dark:even:bg-pink-600/5'
          >
            {mergeCols(row).map((cell, cellIndex) => (
              <td
                key={cellIndex}
                colSpan={cell.colSpan}
                className='border border-pink-400 text-base/6.5 first:whitespace-nowrap dark:border-pink-600/50'
              >
                {renderInlineCode(cell.content)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
