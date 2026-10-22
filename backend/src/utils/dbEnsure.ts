import net from 'net';
import { spawn } from 'child_process';
import path from 'path';

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

export async function ensureDatabaseRunning(): Promise<void> {
  const isRunning = await checkPort(5432);
  if (isRunning) {
    return;
  }

  console.log('🔄 PostgreSQL not detected on port 5432. Auto-starting built-in database...');
  const pgDataDir = path.join(__dirname, '../../pgdata');

  const pgliteProc = spawn(
    'npx',
    ['pglite-server', '-p', '5432', '-d', pgDataDir, '-m', '10'],
    {
      shell: true,
      detached: false,
      stdio: 'ignore',
    }
  );

  pgliteProc.unref();

  // Wait up to 10 seconds for port 5432 to become available
  const startTime = Date.now();
  while (Date.now() - startTime < 10000) {
    await new Promise((res) => setTimeout(res, 400));
    const active = await checkPort(5432);
    if (active) {
      console.log('✅ PostgreSQL is ready on localhost:5432');
      return;
    }
  }

  console.warn('⚠️ Could not confirm PostgreSQL on port 5432 within 10s. Continuing startup...');
}
