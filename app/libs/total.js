
const readline = require('readline');

const reg = /\s+/g

const log = require('inspc');

module.exports = fileStream => new Promise((resolve, reject) => {

  const rl = readline.createInterface({
    input: fileStream
  });

  const buff = {}

  rl.on('line', line => {

    const split = line.trim().split(reg);

    if (typeof line === 'string' && split.length === 2) {

      if (buff[split[0]]) {

        buff[split[0]] += 1;
      }
      else {

        buff[split[0]] = 1;
      }
    }
    else {

      reject(`Wrong format of line from log '${line}'`);

      rl.close();
    }
  });

  rl.on('close', e => {

    const sorted = Object.entries(buff);

    sorted.sort((a, b) => {

      if (a[1] === b[1]) {

        return 0;
      }

      return a[1] < b[1] ? 1 : -1;
    });

    resolve(sorted);
  });
})


