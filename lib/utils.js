/**
 * Utils
 */

var crypto = require('crypto');

const _hash = (val) => {
    return crypto.createHash('md5').update(val).digest('hex');
}


/** Function that count occurrences of a substring in a string;
 * https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see https://stackoverflow.com/a/7924240/938822
 */
 function occurrences(string, subString, allowOverlapping) {

  string += "";
  subString += "";
  if (subString.length <= 0) return (string.length + 1);

  var n = 0,
      pos = 0,
      step = allowOverlapping ? 1 : subString.length;

  while (true) {
      pos = string.indexOf(subString, pos);
      if (pos >= 0) {
          ++n;
          pos += step;
      } else break;
  }
  return n;
}

exports.hash = _hash
exports.occurrences = occurrences

// on main entry
if (require.main === module) {
    (async function () {
      
       console.log( _hash("fff"))
       console.log( _hash("fff"))
       console.log( _hash("fff"))
       console.log( _hash("红花海南"))

      process.exit(0);
    })();
  }
  