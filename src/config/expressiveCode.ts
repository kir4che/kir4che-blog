import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { createInlineSvgUrl } from '@expressive-code/core';

const terminalIconMacStyle = createInlineSvgUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="7" viewBox="0 0 34 10" preserveAspectRatio="xMidYMid meet">
  <circle cx="5" cy="5" r="4" fill="#ff5f56"/>
  <circle cx="17" cy="5" r="4" fill="#ffbd2e"/>
  <circle cx="29" cy="5" r="4" fill="#27c93f"/>
</svg>
`);

export const rehypeExpressiveCodeOptions = {
  themes: 'one-dark-pro',
  frames: {
    showCopyToClipboardButton: true,
  },
  styleOverrides: {
    frames: {
      terminalTitlebarBackground: '#2d2d2d',
      terminalTitlebarBorderBottomColor: '#2d2d2d',
      terminalIcon: terminalIconMacStyle,
    },
  },
  defaultProps: {
    wrap: true,
    showLineNumbers: false,
  },
  plugins: [pluginLineNumbers()],
};
