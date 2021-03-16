
const path = require('path');

const negotiatePort = require('nlab/negotiatePort');

var Busboy = require('busboy');

var inspect = require('util').inspect;

const express = require('express');


require('dotenv').config();

const web = path.resolve(__dirname, 'public');

// process.env validation
(function (i) {

  if ( ! i.test(process.env.NODE_PORT) ) {

    throw new Error(`process.env.NODE_PORT '${process.env.NODE_PORT}' don't match ${i}`)
  }

  if ( typeof process.env.NODE_HOST !== 'string' || !process.env.NODE_HOST.trim() ) {

    throw new Error(`process.env.NODE_HOST '${process.env.NODE_HOST}' is invalid`)
  }

}(/^\d+$/));


const app = express();

/**
 * let's use streams, there is no need to write file on the server, we can handle it on the fly
 */
app.post('*', (req, res) => {

  var busboy = new Busboy({ headers: req.headers });

  // looks like order of fields in html form determines which handler will be fired first .on('file') or .on('field')
  // so I will be able to handle 'file' handler differently
  // based on 'type' field value provided in 'field' event
  let type;

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

    if ( /^(total|unique)$/.test(type) ) {

      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

      file.on('data', function(data) {
        console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      });

      file.on('end', function() {
        console.log('File [' + fieldname + '] Finished');
      });
    }
    else {

      // https://www.npmjs.com/package/busboy#busboy-special-events
      // Note: if you listen for this event, you should always handle the stream no matter if you care about
      // the file contents or not (e.g. you can simply just do stream.resume(); ...

      console.log(`upload error: type field invalid: '${type}'`);

      file.resume();
    }
  });

  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {

    console.log('Field [' + fieldname + ']: value: ' + inspect(val));

    type = val;
  });

  busboy.on('finish', function() {

    console.log('Done parsing form!');

    res.writeHead(303, { Connection: 'close', Location: '/' });

    res.end();
  });

  req.pipe(busboy);
});

app.use(express.static(web));

app.listen(process.env.NODE_PORT, process.env.NODE_HOST, () => {

  console.log(
    `\n 🌎  Server is running http://${process.env.NODE_HOST}${negotiatePort('http', process.env.NODE_PORT, ':')}\n`
  )
});