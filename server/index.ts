#!/usr/bin/env node

/**
 * Module dependencies.
 */

 import app from './server';
 const debug = require('debug')('filestorageutil:server');
 import http from 'http';
 
 
 /**
  * Create HTTP server.
  */
 
 const server = http.createServer(app);
 
 /**
  * Listen on provided port, on all network interfaces.
  */
 
 
 server.on('error', onError);
 server.on('listening', onListening);
 
 /**
  * Normalize a port into a number, string, or false.
  */
 
 function normalizePort(val:any) {
   const port = parseInt(val, 10);
 
   if (isNaN(port)) {
     // named pipe
     return val;
   }
 
   if (port >= 0) {
     // port number
     return port;
   }
 
   return false;
 }
 
 /**
  * Event listener for HTTP server "error" event.
  */
 
 function onError(error:any) {
   if (error.syscall !== 'listen') {
     throw error;
   }
 
   const bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;
 
     console.log(bind)
   // handle specific listen errors with friendly messages
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
 }
 
 /**
  * Get port from environment and store in Express.
  */
 
  const port = normalizePort(process.env.PORT || '6000');
  app.set('port', port);
 
 /**
  * Event listener for HTTP server "listening" event.
  */
 
 function onListening() {
   const addr = server.address();
   const bind = typeof addr === 'string'
     ? 'pipe ' + addr
     : 'port ' + addr?.port;
   console.log(`Listening on ${bind}`)
   debug('Listening on ' + bind);
 }
 
 /**
  * Setup DB connection here
  */

  server.listen(port,()=>{
    console.log(`working`)
  })