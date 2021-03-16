
const path = require('path');

const fs = require('fs');

const processor = require('../app/libs/unique');

const regular = path.resolve(__dirname, 'samples', 'regular.log');

const wrong_line = path.resolve(__dirname, 'samples', 'wrong_line.log');

describe('unique', () => {

  test('regular', async done => {

    const data = await processor(fs.createReadStream(regular));

    expect(data).toEqual([
      [
        "/about/2",
        3
      ],
      [
        "/home",
        2
      ],
      [
        "/contact",
        2
      ],
      [
        "/help_page/1",
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

    expect(processor.format('/url', 70)).toEqual(`/url 70 unique views\n`);

    done();
  });
})