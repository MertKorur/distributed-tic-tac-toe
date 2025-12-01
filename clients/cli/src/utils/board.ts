import chalk from 'chalk';

export const renderBoard = (board: string[] = Array(9).fill('')) => {
  const display = board.map((cell, idx) => {
    if (!cell) return idx.toString();
    if (cell.length === 1) return ` ${cell}`;
    return cell;
  });
  
  const lines = [
    ` ${display[0]} | ${display[1]} | ${display[2]} `,
    '---+---+---',
    ` ${display[3]} | ${display[4]} | ${display[5]} `,
    '---+---+---',
    ` ${display[6]} | ${display[7]} | ${display[8]} `
  ];

  console.log(chalk.cyan(lines.join('\n')));
};
