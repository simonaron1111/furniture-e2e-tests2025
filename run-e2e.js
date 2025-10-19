/**
 * Custom E2E runner for Windows-friendly process management.
 * - Starts the Angular dev server from repo root
 * - Waits for http://localhost:4200 to be ready
 * - Runs mocha Selenium tests
 * - Cleans up the server process at the end
 */
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const treeKill = require('tree-kill');

const ROOT_DIR = path.resolve(__dirname, '..');
const E2E_DIR = path.resolve(__dirname, '.');;
const SERVER_URL = 'http://localhost:4200/';

function spawnShell(command, cwd) {
  // Use shell to improve Windows compatibility (avoids spawn EINVAL issues)
  return spawn(command, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
}

async function main() {
  console.log('Starting Angular dev server...');
  const serverProc = spawnShell('npm run start', ROOT_DIR);

  let serverExited = false;
  serverProc.on('exit', (code, signal) => {
    serverExited = true;
    console.log(`Angular dev server exited with code ${code}, signal ${signal}`);
  });

  // Ensure we clean up server on termination
  const cleanup = () => {
    if (serverProc && !serverExited) {
      console.log('Stopping Angular dev server...');
      try {
        treeKill(serverProc.pid, 'SIGTERM');
      } catch (e) {
        console.error('Failed to kill dev server process:', e);
      }
    }
  };
  process.on('SIGINT', () => { cleanup(); process.exit(130); });
  process.on('SIGTERM', () => { cleanup(); process.exit(143); });
  process.on('exit', cleanup);

  // Wait for the dev server to come up
  try {
    console.log(`Waiting for ${SERVER_URL} to be ready...`);
    await waitOn({
      resources: [SERVER_URL],
      timeout: 120000, // 2 minutes
      validateStatus: (status) => status >= 200 && status < 400
    });
    console.log('Server is up.');
  } catch (err) {
    console.error('Dev server did not come up in time:', err);
    cleanup();
    process.exit(1);
  }

  // Run mocha tests
  console.log('Running mocha tests...');
  const testProc = spawnShell('npm run test:mocha', E2E_DIR);

  testProc.on('exit', (code, signal) => {
    console.log(`Mocha exited with code ${code}, signal ${signal}`);
    cleanup();
    // Propagate test exit code
    process.exit(code ?? 1);
  });

  testProc.on('error', (err) => {
    console.error('Error running mocha:', err);
    cleanup();
    process.exit(1);
  });
}

main().catch((e) => {
  console.error('Runner failed:', e);
  process.exit(1);
});
