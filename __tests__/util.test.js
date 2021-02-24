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

describe('lagKill', () => {
  const testState = {};

  beforeEach(() => {
    testState.p = _process();
    testState.data = {};
    testState.data[testState.p.pid] = true;
  });

  afterEach(() => {
    testState.p.kill('SIGKILL');
  });

  // Allow 500 milliseconds to process the resolved Promise
  let lag = 500;

  describe('Good inputs, no lag', () => {
    test('PID only', () => {
      return new Promise(async(resolve, reject) => {
        expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
        let result = tmbrUtil.lagKill(
          testState.p.pid
        );

        // Wait 500 milliseconds
        setInterval(reject, 500);

        // Result should resolve in time
        await expect(result).resolves.toEqual(testState.data);
        expect(tmbrUtil.processExists(testState.p.pid)).toBe(false);
        resolve();
      })
    });

    test('PID + signal', () => {
      return new Promise(async(resolve, reject) => {
        expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
        let result = tmbrUtil.lagKill(
          testState.p.pid,
          'SIGKILL'
        );

        // Wait 500 milliseconds
        setInterval(reject, 500);

        // Result should resolve in time
        await expect(result).resolves.toEqual(testState.data);
        expect(tmbrUtil.processExists(testState.p.pid)).toBe(false);
        resolve();
      });
    });
  });

  describe('Bad inputs', () => {
    test('Bad PID', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.lagKill(
        -1
      )).resolves.toEqual({});
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
    });

    test('Bad signal', async() => {
      expect(tmbrUtil.processExists(testState.p.pid)).toBe(true);
      await expect(tmbrUtil.lagKill(
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

const _process = () => {
  return spawn('node');
};
