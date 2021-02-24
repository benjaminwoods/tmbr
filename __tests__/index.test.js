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

    test('Kill by PID', () => {
      return tmbr(
        testState.p.pid
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });

    test('Kill by process', () => {
      return tmbr(
        testState.p
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });

    test('All processes killed', () => {
      return tmbr(
        testState.p
      ).then(result => {
        expect(() => process.kill(testState.p.pid, 0)).toThrow();
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
          result.map(i => [i, {}])
        )
      });
    });

    afterEach(() => {
      testState.p.kill('SIGKILL');
    });

    test('Kill parent by PID', () => {
      return tmbr(
        testState.p.pid
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });

    test('Kill parent by process', () => {
      return tmbr(
        testState.p
      ).then(result => {
        expect(result).toEqual(testState.data);
      });
    });

    // Check recursive kill

    test('All processes killed', () => {
      return tmbr(
        testState.p
      ).then(result => {
        expect(() => process.kill(testState.p.pid, 0)).toThrow();
        for (let pid of Object.keys(testState.data)) {
          expect(() => process.kill(pid, 0)).toThrow();
        }
      });
    });
  });
});

const _process = () => {
  return spawn('node');
}

const _processInShell = () => {
  return spawn('node',{shell:true});
}
