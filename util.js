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
  * Kill process and check for PID afterwards.
  *
  * @param {number} pid - PID.
  * @param {string} [signal='SIGTERM'] - Kill signal.
  * @param {Object} [options={}] - Additional options.
  * @param {boolean} options.recursive - Recursive kill.
  * @returns {Promise<Object>} Resolves if PID kill was successful, rejects otherwise.
  */
 module.exports.killAndCheck = (pid, signal='SIGTERM', options={}) => {
   return asyncKill(
     pid, signal, options
   ).then(
     result => {
       // If kill attempt did not error, lookup the PID
       if (processExists(pid)) {
         throw('PID failed to be killed.');
       }

       // Otherwise, return result from asyncKill
       return result;
     },
     // Otherwise, error
     msg => {
       throw(`Error terminating PID ${pid}.`)
     }
   );
 };
 const killAndCheck = module.exports.killAndCheck;

 /**
  * Wait lag milliseconds, then run killAndCheck.
  *
  * @param {number} pid - PID.
  * @param {string} [signal='SIGTERM'] - Kill signal.
  * @param {Object} [options={}] - Additional options.
  * @param {boolean} options.recursive - Recursive kill.
  * @returns {Promise} Resolves if PID kill was successful, rejects otherwise.
  */
 module.exports.lagKill = (pid, signal='SIGTERM', options={}, lag=0) => {
   return new Promise ((resolve, reject) => {
     setTimeout(() => {
       killAndCheck(
         pid, signal, options
       ).then(resolve, reject);
     }, lag);
   });
 };
 const lagKill = module.exports.lagKill;

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
    throw('Bad input. pid must be an integer > 0.');
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
