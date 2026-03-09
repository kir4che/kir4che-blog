import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { defineEcConfig } from 'astro-expressive-code';

export default defineEcConfig({
  themes: ['one-dark-pro'],
  frames: {
    showCopyToClipboardButton: true,
  },
  styleOverrides: {
    frames: {
      terminalTitlebarBackground: '#2d2d2d',
      terminalTitlebarBorderBottomColor: '#2d2d2d',
    },
  },
  defaultProps: {
    wrap: true,
    showLineNumbers: true,
  },
  plugins: [pluginLineNumbers()],
});
