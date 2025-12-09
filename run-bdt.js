/**
 * Custom BDT runner for containerized environment.
 * - Waits for test backend to be ready
 * - Starts the Angular dev server from repo root
 * - Waits for http://localhost:4200 to be ready
 * - Runs Cucumber BDT tests
 * - Cleans up the server process at the end
 */
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const treeKill = require('tree-kill');

const ROOT_DIR = path.resolve(__dirname, '..');
const E2E_DIR = path.resolve(__dirname, '.');
const SERVER_URL = 'http://localhost:4200/';
const BACKEND_HOST = process.env.BACKEND_HOST || 'furniture_backend_e2e';
const BACKEND_PORT = process.env.BACKEND_PORT || '8080';
const BACKEND_URL = `tcp:${BACKEND_HOST}:${BACKEND_PORT}`;

function spawnShell(command, cwd) {
  // Use shell to improve Windows compatibility (avoids spawn EINVAL issues)
  return spawn(command, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
}

async function main() {
  // Wait for test backend to be ready (using TCP check)
  try {
    console.log(`Waiting for test backend at ${BACKEND_HOST}:${BACKEND_PORT} to be ready...`);
    await waitOn({
      resources: [BACKEND_URL],
      timeout: 120000
    });
    console.log('Test backend is up.');
  } catch (err) {
    console.error('Test backend did not come up in time:', err);
    process.exit(1);
  }

  console.log('Starting Angular dev server with test backend proxy...');
  const serverProc = spawnShell('npm run start -- --host 0.0.0.0 --port 4200 --proxy-config proxy.conf.test.json', ROOT_DIR);

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

  // Run Cucumber BDT tests
  console.log('Running Cucumber BDT tests...');
  const testProc = spawnShell('npm run test:cucumber', E2E_DIR);

  testProc.on('exit', (code, signal) => {
    console.log(`Cucumber exited with code ${code}, signal ${signal}`);
    cleanup();
    // Propagate test exit code
    process.exit(code ?? 1);
  });

  testProc.on('error', (err) => {
    console.error('Error running Cucumber:', err);
    cleanup();
    process.exit(1);
  });
}

main().catch((e) => {
  console.error('Runner failed:', e);
  process.exit(1);
});

