
const path = require('path');

const fs = require('fs');

const processor = require('../app/libs/total');

const regular = path.resolve(__dirname, 'samples', 'regular.log');

const wrong_line = path.resolve(__dirname, 'samples', 'wrong_line.log');

describe('total', () => {

  test('regular', async done => {

    const data = await processor(fs.createReadStream(regular));

    expect(data).toEqual([
      [
        "/about/2",
        6
      ],
      [
        "/home",
        3
      ],
      [
        "/help_page/1",
        3
      ],
      [
        "/contact",
        2
      ],
      [
        "/index",
        2
      ]
    ]);

    done();
  });

  test('wrong line', async done => {

    try {

      await processor(fs.createReadStream(wrong_line));

      done(`should fail`);
    }
    catch (e) {

      expect(String(e)).toEqual(`Wrong format of line found in log '/home 016.464.657.359 x'`);

      done();
    }
  });

  test('format method', done => {

      expect(processor.format('/url', 70)).toEqual(`/url 70 visits\n`);

      done();
  });
});