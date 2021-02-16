const tmbrUtil = require('../util')
const { spawn } = require('child_process')

describe('processExists', () => {
  const testState = {};

  beforeEach(() => {
    testState.p = _process();
  });

  afterEach(() => {
    testState.p.kill('SIGKILL');
  });

  test('PID exists', () => {
    expect(process.kill(testState.p.pid,0)).toBe(true);
    expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
    expect(process.kill(testState.p.pid,0)).toBe(true);
  });

  test('PID does not exist', () => {
    expect(process.kill(testState.p.pid,0)).toBe(true);
    expect(tmbrUtil.processExists(1000000000)).toBe(false);
    expect(process.kill(testState.p.pid,0)).toBe(true);
  });

  test('Bad PID', () => {
    expect(process.kill(testState.p.pid,0)).toBe(true);
    expect(() => tmbrUtil.processExists('invalid input')).toThrow();
    expect(process.kill(testState.p.pid,0)).toBe(true);
  });
});

const _process = (shell=false) => {
  let cmd, args;
  if (process.platform === 'win32') {
    cmd = 'ping';
    args = ['127.0.0.1', '-n', '31'];
  } else if (process.platform == 'linux') {
    cmd = './__tests__/hang.sh';
    args = [];
  } else {
    throw('process.platform must be "win32" or "linux".')
  }

  return spawn(
    cmd, args,
    options={shell:shell}
  );
}
