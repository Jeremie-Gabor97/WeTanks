import * as express from 'express';
// import { RequestHandler } from '../../node_modules/@types/express-serve-static-core';
import { NextFunction, Request, Response } from 'express';
// const express = require('express');
import * as socketIO from 'socket.io';

const app = express();
const http = require('http').Server(app);
const path = require('path');
// const ioServer = require('socket.io')(http);
const ioServer = socketIO(http);

app.use(express.static('public'));

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../../', 'index.html'));
});

let socketId = 1;

ioServer.on('connection', function (socket: socketIO.Socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

// Start the server
http.listen(3000, function () {
    console.log('listening on *:3000');
});