const tmbrUtil = require('../util')
const { spawn } = require('child_process')

describe('asyncKill', () => {
  const testState = {};

  beforeEach(() => {
    testState.p = _process();
    testState.data = {};
    testState.data[testState.p.pid] = true;
  });

  afterEach(() => {
    testState.p.kill('SIGKILL');
  });

  describe('Good inputs', () => {
    test('PID only', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.asyncKill(
        testState.p.pid
      )).resolves.toEqual(testState.data);
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(false);
    });

    test('PID + signal', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.asyncKill(
        testState.p.pid,
        'SIGKILL'
      )).resolves.toEqual(testState.data);
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(false);
    });
  });

  describe('Bad inputs', () => {
    test('Bad PID', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.asyncKill(
        -1
      )).resolves.toEqual({});
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
    });

    test('Bad signal', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.asyncKill(
        testState.p.pid,
        'BADSIGNAL'
      )).rejects.toThrow();
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
    });
  });
});

describe('killAndCheck', () => {
  const testState = {};

  beforeEach(() => {
    testState.p = _process();
    testState.data = {};
    testState.data[testState.p.pid] = true;
  });

  afterEach(() => {
    testState.p.kill('SIGKILL');
  });

  describe('Good inputs, responsive process', () => {
    test('PID only', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.killAndCheck(
        testState.p.pid
      )).resolves.toEqual(testState.data);
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(false);
    });

    test('PID + signal', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.killAndCheck(
        testState.p.pid,
        'SIGKILL'
      )).resolves.toEqual(testState.data);
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(false);
    });
  });

  describe('Bad inputs', () => {
    test('Bad PID', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.killAndCheck(
        -1
      )).resolves.toEqual({});
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
    });

    test('Bad signal', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.killAndCheck(
        testState.p.pid,
        'BADSIGNAL'
      )).rejects.toBe(`Error terminating PID ${testState.p.pid}.`);
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
    });
  });
});

describe('processExists', () => {
  const testState = {};

  beforeEach(() => {
    testState.p = _process();
  });

  afterEach(() => {
    testState.p.kill('SIGKILL');
  });

  test('PID exists', () => {
    expect(process.kill(testState.p.pid ,0)).toBe(true);
    expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
    expect(process.kill(testState.p.pid, 0)).toBe(true);
  });

  test('PID does not exist (1000000000)', () => {
    expect(process.kill(testState.p.pid, 0)).toBe(true);
    expect(tmbrUtil.processExists(1000000000)).toBe(false);
    expect(process.kill(testState.p.pid, 0)).toBe(true);
  });

  test('Bad PID', () => {
    expect(process.kill(testState.p.pid, 0)).toBe(true);
    expect(() => tmbrUtil.processExists('invalid input')).toThrow();
    expect(process.kill(testState.p.pid, 0)).toBe(true);
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
