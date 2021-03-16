
var Busboy = require('busboy');

var inspect = require('util').inspect;

const processors = {
  total   : require('../libs/total'),
  unique  : require('../libs/unique'),
}

/**
 * let's use streams, there is no need to write file on the server, we can handle it on the fly
 */
module.exports = (req, res) => {

  var busboy = new Busboy({ headers: req.headers });

  // looks like order of fields in html form determines which handler will be fired first .on('file') or .on('field')
  // so I will be able to handle 'file' handler differently
  // based on 'type' field value provided in 'field' event
  let type;

  let response = 'download';

  let data;

  let error;

  /**
   * event 'finish' fires too early, let's wait for processing
   */
  let resolveForFinish;
  const promiseForFinish = new Promise((res) => resolveForFinish = res);

  busboy.on('field', function(fieldname, val) {

    if (fieldname === 'type' && /^(total|unique)$/) {

      type = val;
    }

    if (fieldname === 'response' && /^(screen|download)$/) {

      response = val;
    }
  });

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {

    if ( type ) {

      try {

        data = await processors[type](file);
      }
      catch (e) {

        error = e;
      }
    }
    else {

      // https://www.npmjs.com/package/busboy#busboy-special-events
      // Note: if you listen for this event, you should always handle the stream no matter if you care about
      // the file contents or not (e.g. you can simply just do stream.resume(); ...

      error = `upload error: type field invalid: '${type}'`;

      file.resume();
    }

    resolveForFinish();
  });

  busboy.on('finish', async () => {

    await promiseForFinish;

    if ( Array.isArray(data) && data.length > 0 ) {

      if (response === 'screen') {

        res.set({
          'Content-type': 'text/plain; charset=UTF-8'
        });
      }
      else {

        res.set({
          'Content-Disposition': 'attachment'
        });
      }

      data.forEach(element => res.write(processors[type].format(...element)));

      res.end();

      return;
    }

    console.log("Here is the natural place to use error logger:", error);

    res.writeHead(303, { Connection: 'close', Location: '/?processingerror' });

    res.end();
  });

  req.pipe(busboy);
}