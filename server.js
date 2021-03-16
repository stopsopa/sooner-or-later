
const path = require('path');

const negotiatePort = require('nlab/negotiatePort');

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

app.use((req, res, next) => {

  console.log(`request ${req.method} ${req.url}`);

  next();
});

app.post('*', require('./app/middlewares/statsMiddleware'));

app.use(express.static(web));

app.listen(process.env.NODE_PORT, process.env.NODE_HOST, () => {

  console.log(
    `\n 🌎  Server is running http://${process.env.NODE_HOST}${negotiatePort('http', process.env.NODE_PORT, ':')}\n`
  )
});