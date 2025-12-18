import path from 'node:path';
import { spawn } from 'node:child_process';

const projectRoot = process.cwd();

export const triggerPrepareContent = () => {
  try {
    const child = spawn(
      'npm',
      [
        'exec',
        'ts-node',
        '--',
        '--project',
        path.join(projectRoot, 'scripts/tsconfig.scripts.json'),
        path.join(projectRoot, 'scripts/prepareContent.ts'),
      ],
      {
        cwd: projectRoot,
        env: process.env,
        stdio: 'inherit',
      }
    );

    child.on('error', (err) => {
      console.error('prepareContent failed to start', err);
    });

    child.on('exit', (code) => {
      if (code !== 0) console.error(`prepareContent exited with code ${code}`);
    });
  } catch {}
};
