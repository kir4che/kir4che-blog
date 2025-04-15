import React from 'react';

interface TableProps {
  data: {
    headers: string[];
    rows: string[][];
  };
}

const Table: React.FC<TableProps> = ({ data }) => {
  const mergeCols = (row: string[]) => {
    const merged: { content: string; colSpan: number }[] = [];
    let i = 0;

    while (i < row.length) {
      const content = row[i];
      let span = 1;

      while (i + span < row.length && row[i + span] === content) {
        span++;
      }

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
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className='even:bg-pink-50 dark:even:bg-pink-600/5'
          >
            {mergeCols(row).map((cell, cellIndex) => (
              <td
                key={cellIndex}
                colSpan={cell.colSpan}
                className='border border-pink-400 dark:border-pink-600/50 [:first-child]:whitespace-nowrap'
              >
                {cell.content}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
