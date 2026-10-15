import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('🚀 Starting Full-Stack Real-Time Collaborative Task Board');
console.log('📡 Backend: Node.js + Express + Socket.io (Port 5000)');
console.log('💻 Frontend: React + Vite (Port 5173)');
console.log('====================================================\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Start Server
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true,
});

serverProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[Server]\x1b[0m ${data}`);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Server Error]\x1b[0m ${data}`);
});

// Start Client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  shell: true,
});

clientProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[35m[Client]\x1b[0m ${data}`);
});

clientProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Client Error]\x1b[0m ${data}`);
});

const cleanup = () => {
  console.log('\nShutting down services...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
