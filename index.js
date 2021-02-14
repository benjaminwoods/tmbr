const psTree = require('ps-tree');
const { ChildProcess } = require('child_process');

// Qualify as @module tmbr

/**
 * Asynchronously kill processes and process trees.
 *
 * @param {(child_process.ChildProcess|number)} p - Child process or PID.
 * @param {string} [signal='SIGTERM'] - Kill signal.
 * @param {Object} [options={}] - Additional options.
 * @param {number} options.timeout - Set a timeout for each kill (milliseconds)
 * @param {boolean} options.recursive - Recursive kill.
 * @returns {Promise<Object>} - Promise with information about the process tree.
 */
module.exports = (p, signal='SIGTERM', options={}) => {
  // Flexible input
  if (p instanceof ChildProcess) {
    pid = p.pid;
  } else if (Number.isInteger(p)) {
    pid = p;
  }


  // Kill children
  return new Promise((resolve,reject) => {
    psTree(pid, async(err, children) => {
      let results = {};

      if (err) {
        throw(err);
      }

      // Wait for all children to be killed.
      await Promise.all(
        children.map(async(c) => {
            if (typeof options.timeout !== 'undefined') {
              // The async call here creates a race to timeout against signal.
              await Promise.race([
                _asyncKill(c.PID, signal, options),
                new Promise(
                  (_, rej) => setTimeout(rej, options.timeout)
                )
              ]).then(
                result => {
                  // Update
                  results[c.PID] = result;
                },
                msg => {
                  // If SIGKILL fails, error
                  if (msg) {
                    throw(`Error terminating PID ${c.PID}.`);
                  } else {
                    throw(`Timeout terminating PID ${c.PID}.`);
                  }
                }
              );
            } else {
              _asyncKill(
                c.PID, signal, options
              ).then(
                result => {
                  // Update
                  results[c.PID] = result;
                },
                msg => {
                  throw(msg);
                }
              );
            }
          }
        )
      ).catch(reject);

      resolve(results);
    });
  }).then(results => {
    // Kill p
    try {
      process.kill(pid, signal)
    } catch (err) {
      if (err.code != 'ESRCH') {
        // Error if not ESRCH
        throw(err)
      }
    }

    let obj = {};
    obj[pid] = results;

    return obj;
  })
};
const tmbr = module.exports;

const _asyncKill = async(pid, signal, options) => {
  if (options.recursive) {
    return await tmbr(pid, signal, options);
  } else {
    return process.kill(pid, signal);
  }
}
