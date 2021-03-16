
const a = require('../app/a');

describe('a', () => {

  test('+', done => {

    expect(a(5, 3)).toEqual(8);

    done();
  });
})