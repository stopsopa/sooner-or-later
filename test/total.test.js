
const path = require('path');

const fs = require('fs');

const total = require('../app/libs/total');

const regular = path.resolve(__dirname, 'samples', 'regular.log');

const wrong_line = path.resolve(__dirname, 'samples', 'wrong_line.log');

describe('total', () => {

  test('regular', async done => {

    const data = await total(fs.createReadStream(regular));

    expect(data).toEqual([
      [
        "/home",
        3
      ],
      [
        "/about/2",
        3
      ],
      [
        "/contact",
        2
      ],
      [
        "/index",
        2
      ],
      [
        "/help_page/1",
        1
      ]
    ]);

    done();
  });

  test('wrong line', async done => {

    try {

      await total(fs.createReadStream(wrong_line));

      done(`should fail`);
    }
    catch (e) {

      expect(String(e)).toEqual(`Wrong format of line from log '/home 016.464.657.359 x'`);

      done();
    }
  });
})