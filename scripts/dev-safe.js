const { spawn, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const dotNextPath = path.join(projectRoot, '.next');

if (fs.existsSync(dotNextPath)) {
  fs.rmSync(dotNextPath, { recursive: true, force: true });
}

function killProcessOnPort(port) {
  const command = `netstat -ano -p tcp | findstr :${port}`;

  try {
    const output = execSync(command, {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      shell: true,
    });

    const pids = [...new Set([...output.matchAll(/\s+(\d+)\s*$/gm)].map((match) => match[1]))];

    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid} >NUL 2>&1`, { stdio: 'ignore', shell: true });
        console.log(`Stopped stale process ${pid} on port ${port}`);
      } catch {
        // ignore already-terminated processes
      }
    }
  } catch {
    // no process found on that port
  }
}

killProcessOnPort(4028);

const isWin = process.platform === 'win32';

const child = isWin
  ? spawn('cmd.exe', ['/d', '/s', '/c', 'npx next dev -p 4028'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
    })
  : spawn('npx', ['next', 'dev', '-p', '4028'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
    });

child.on('exit', (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error('Failed to start dev server:', error);
  process.exit(1);
});
