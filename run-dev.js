import { spawn } from 'child_process';

const rawArgs = process.argv.slice(2);
const filteredArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === '--host') {
    // Skip --host and its value if it exists
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      i++;
    }
    continue;
  }
  filteredArgs.push(rawArgs[i]);
}

const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '0.0.0.0', ...filteredArgs], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('exit', (code) => {
  process.exit(code || 0);
});
