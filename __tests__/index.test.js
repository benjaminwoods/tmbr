const tmbr = require('..');
const { spawn } = require('child_process');
const psTree = require('ps-tree');

describe('One process (no shell)', () => {
  describe('p syntax', () => {
    const testState = {};

    beforeEach(() => {
      testState.p = _process();
      testState.data = {};
      testState.data[testState.p.pid] = {};
    });

    afterEach(() => {
      testState.p.kill('SIGKILL');
    });

    test('PID', () => {
      return tmbr(
        testState.p.pid
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });

    test('Process', () => {
      return tmbr(
        testState.p
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });
  });

  describe('Signal = SIGINT', () => {
    const testState = {};

    beforeEach(() => {
      testState.p = _process();
      testState.data = {};
      testState.data[testState.p.pid] = {};
    });

    afterEach(() => {
      testState.p.kill('SIGKILL');
    });

    test('PID', () => {
      return tmbr(
        testState.p.pid,
        'SIGINT'
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });

    test('Process', () => {
      return tmbr(
        testState.p,
        'SIGINT'
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });
  });

  describe('Signal = SIGKILL', () => {
    const testState = {};

    beforeEach(() => {
      testState.p = _process();
      testState.data = {};
      testState.data[testState.p.pid] = {};
    });

    afterEach(() => {
      testState.p.kill('SIGKILL');
    });

    test('PID', () => {
      return tmbr(
        testState.p.pid,
        'SIGKILL'
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });

    test('Process', () => {
      return tmbr(
        testState.p,
        'SIGKILL'
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });
  });
});

describe('One process (in shell)', () => {
  describe('p syntax', () => {
    const testState = {};

    beforeEach(() => {
      testState.p = _process(shell=true);
      testState.data = {};

      return new Promise(resolve => {
        psTree(testState.p.pid, (err, children) => {
          resolve(children.map(c => c.PID));
        });
      }).then(result => {
        testState.data[testState.p.pid] = Object.fromEntries(
          result.map(i => [i, true])
        )
      });
    });

    afterEach(() => {
      testState.p.kill('SIGKILL');
    });

    test('PID', () => {
      return tmbr(
        testState.p.pid
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });

    test('Process', () => {
      return tmbr(
        testState.p
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });
  });
});

const _process = (shell=false) => {
  let cmd, args;
  if (process.platform === 'win32') {
    cmd = 'ping';
    args = ['127.0.0.1', '-n', '31'];
  } else {
    cmd = 'sleep';
    args = ['30'];
  }

  return spawn(
    cmd, args,
    options={shell:shell}
  );
}
