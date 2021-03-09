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
  * @throws If pid is invalid.
  */
 module.exports.asyncKill = (pid, signal='SIGTERM', options={}) => {
   // If the pid is not valid, throw here
   processExists(pid)

   return new Promise((resolve, reject) => {
     if (options.recursive) {
       const tmbr = require('.');

       tmbr(pid, signal, options).then(
         resolve, reject
       );
     } else {
       let obj = {};

       try {
         obj[pid] = process.kill(pid, signal);

         const processCheck = () => {
           if (processExists(pid)) {
             // If the process still exists,
             // recursively call with 50ms lag
             setTimeout(processCheck, 50);
           } else {
             resolve(obj);
           }
         }

         // Fire
         setTimeout(processCheck, 50)
       } catch (err) {
         if (err.code !== 'ESRCH') {
           // Error if not ESRCH
           reject(err);
         } else {
           // Process did not exist
           // (silently resolves)
           resolve(obj);
         }
       }
     }
   });
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
  * @throws If pid is invalid.
  */
 module.exports.killAndCheck = (pid, signal='SIGTERM', options={}) => {
   // If the pid is not valid, throw here
   processExists(pid)

   return asyncKill(
     pid, signal, options
   ).then(
     async(result) => {
       // If kill attempt did not error, lookup the PID
       if (processExists(pid)) {
         throw('PID failed to be killed.');
       }

       // Otherwise, return result from asyncKill
       return result;
     },
     // Otherwise, error
     async(msg) => {
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
  * @throws If pid is invalid.
  */
 module.exports.lagKill = (pid, signal='SIGTERM', options={}, lag=0) => {
   // If the pid is not valid, throw here
   processExists(pid)

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
    } else if (pid <= 0) {
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
