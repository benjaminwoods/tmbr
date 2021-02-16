/**
 * @module tmbr/util
 */

 /**
  * Asynchronous kill.
  *
  * Silently resolves if ESRCH is returned from process.kill(pid, signal).
  * @param {number} pid - PID.
  * @param {string} [signal='SIGTERM'] - Kill signal.
  * @param {Object} [options={}] - Additional options.
  * @param {boolean} options.recursive - Recursive kill.
  * @returns {Promise<Object>} Resolves if PID kill did not error, rejects otherwise.
  */
 module.exports.asyncKill = async(pid, signal='SIGTERM', options={}) => {
   const tmbr = require('.');

   if (options.recursive) {
     return await tmbr(pid, signal, options);
   } else {
     let obj = {};

     try {
       obj[pid] = process.kill(pid, signal);
     } catch (err) {
       if (err.code !== 'ESRCH') {
         // Error if not ESRCH
         throw(err);
       }
     }

     return obj;
   }
 };
 const asyncKill = module.exports.asyncKill;

/**
 * Process with PID exists.
 *
 * @param {number} pid - PID.
 * @returns {boolean} True if the PID exists, false otherwise.
 */
module.exports.processExists = (pid) => {
  try {
    if (typeof pid !== 'number') {
      throw 1;
    } else if (!Number.isInteger(pid)) {
      throw 1;
    }
  } catch (err) {
    throw('Bad input. pid must be an integer > 0.')
  }

  let flag = true;
  try {
    process.kill(pid, 0);
  } catch (err) {
    if (err.code === 'ESRCH') {
      flag = false
    }
  } finally {
    return flag
  }
}
const processExists = module.exports.processExists;
