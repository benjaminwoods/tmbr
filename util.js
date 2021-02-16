/**
 * @module tmbr/util
 */

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
    process.kill(pid,0);
  } catch (err) {
    if (err.code === 'ESRCH') {
      flag = false
    }
  } finally {
    return flag
  }
}
const processExists = module.exports.processExists;
