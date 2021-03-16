
const readline = require('readline');

const reg = /\s+/g

const mod = fileStream => new Promise((resolve, reject) => {

  const rl = readline.createInterface({
    input: fileStream
  });

  const buff = {}

  rl.on('line', line => {

    const split = line.trim().split(reg);

    if (typeof line === 'string' && split.length === 2) {

      if (Array.isArray(buff[split[0]])) {

        if ( ! buff[split[0]].includes(split[1])) {

          buff[split[0]].push(split[1]);
        }
      }
      else {

        buff[split[0]] = [split[1]];
      }
    }
    else {

      reject(`Wrong format of line found in log '${line}'`);

      rl.close();
    }
  });

  rl.on('close', e => {

    const sorted = Object.entries(buff).map(([url, list]) => ([url, list.length]));

    sorted.sort((a, b) => {

      if (a[1] === b[1]) {

        return 0;
      }

      return a[1] < b[1] ? 1 : -1;
    });

    resolve(sorted);
  });
});

mod.format = (url, count) => `${url} ${count} unique views\n`;

module.exports = mod;


