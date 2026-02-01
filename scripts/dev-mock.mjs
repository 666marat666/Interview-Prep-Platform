import { spawn } from 'node:child_process';

const apiEnv = {
  ...process.env,
  GEMINI_MOCK: '1',
  PORT: process.env.PORT || '4000'
};

const apiProcess = spawn('go', ['run', './server/local'], {
  stdio: 'inherit',
  env: apiEnv,
  shell: true
});

const webProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

const shutdown = (code = 0) => {
  if (!apiProcess.killed) apiProcess.kill();
  if (!webProcess.killed) webProcess.kill();
  process.exit(code);
};

apiProcess.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`Go API exited with code ${code}`);
  }
  shutdown(code ?? 1);
});

webProcess.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`Vite exited with code ${code}`);
  }
  shutdown(code ?? 1);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
