const psTree = require('ps-tree');
const { ChildProcess } = require('child_process');

const tmbrUtil = require('./util');

// Qualify as @module tmbr

/**
 * Asynchronously kill processes and process trees.
 *
 * @function
 * @alias tmbr
 * @param {(child_process.ChildProcess|number)} p - Child process or PID.
 * @param {string} [signal='SIGTERM'] - Kill signal.
 * @param {Object} [options={}] - Additional options.
 * @param {number} options.retries - How many times to retry killing each process.
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

  if (typeof options.retries === 'undefined') {
    options.retries = 0;
  }

  // Kill children
  return new Promise((resolve,reject) => {
    psTree(pid, async(err, children) => {
      if (err) {
        throw(err);
      }

      // Wait for all children to be killed.
      let arr = await Promise.all(
        children.map(async(c) => {
          try {
            // Assign result from lagKill into results
            return await tmbrUtil.lagKill(
              int(c.PID), signal, options
            );
          } catch (_) {
            // Try multiple times
            for (let j = 0; j < options.retries; j++) {
              try {
                // Assign result from lagKill into results
                return await tmbrUtil.lagKill(
                  int(c.PID), signal, options,
                  lag=1000
                );
              } catch (_) {
                // If lagKill failed, try again
                continue;
              }
            }
          }

          // If no success, throw
          throw(`Process could not be killed using signal ${signal}.`);
        })
      ).catch(reject);

      let results = {};
      for (let r of arr) {
        Object.assign(results, r);
      }
      resolve(results);
    });
  }).then(async(results) => {
    // Kill p
    await tmbrUtil.lagKill(
      pid, signal
    );

    let obj = {};
    obj[pid] = results;

    return obj;
  })
};
const tmbr = module.exports;
