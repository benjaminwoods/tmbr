const tmbr = require('..');
const { spawn } = require('child_process');
const psTree = require('ps-tree');

describe('One process (no shell)', () => {
  describe('p syntax', () => {
    const testState = {};

    beforeEach(() => {
      let cmd, args;
      if (process.platform === 'win32') {
        cmd = 'ping';
        args = ['127.0.0.1', '-n', '31', '>', 'nul']
      } else {
        cmd = 'sleep';
        args = ['30'];
      }

      testState.p = spawn(cmd, args);
      testState.data = {};
      testState.data[testState.p.pid] = {};
    });

    afterEach(() => {
      testState.p.kill('SIGKILL');
    });

    test('PID', () => {
      return tmbr(testState.p.pid).then(result => {
        expect(result).toEqual(testState.data)
      });
    });

    test('Process', () => {
      return tmbr(testState.p).then(result => {
        expect(result).toEqual(testState.data)
      });
    });
  });
});

describe('One process (in shell)', () => {
  describe('p syntax', () => {
    const testState = {};

    beforeEach(() => {
      let cmd, args;
      if (process.platform === 'win32') {
        cmd = 'ping';
        args = ['127.0.0.1', '-n', '31', '>', 'nul'];
      } else {
        cmd = 'sleep';
        args = ['30'];
      }

      testState.p = spawn(
        cmd, args,
        options={shell:true}
      );
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
      return tmbr(testState.p.pid).then(result => {
        expect(result).toEqual(testState.data)
      });
    });

    test('Process', () => {
      return tmbr(testState.p).then(result => {
        expect(result).toEqual(testState.data)
      });
    });
  });
});
