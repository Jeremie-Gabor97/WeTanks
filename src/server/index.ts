import * as express from 'express';
// import { RequestHandler } from '../../node_modules/@types/express-serve-static-core';
import { NextFunction, Request, Response } from 'express';
// const express = require('express');
import * as socketIO from 'socket.io';

import { Game } from './game';

const app = express();
const http = require('http').Server(app);
const path = require('path');
// const ioServer = require('socket.io')(http);
const ioServer = socketIO(http);

app.use(express.static('public'));

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../../', 'index.html'));
});

let players: socketIO.Socket[] = [];

ioServer.on('connection', function (socket: socketIO.Socket) {
    // players.push(socket);
    // console.log('a user connected');
    socket.on('disconnect', function () {
        players = players.filter(obj => obj !== socket);
        console.log('user disconnected');
    });

    socket.on('joinedGame2Players', function () {
        players.push(socket);
        if (players.length === 2) {
            console.log('2 players have joined');
            players[0].emit('playerId',
            { 'id': 'player1'});
            players[1].emit('playerId',
            { 'id': 'player2'});
            let game = new Game(players, ioServer);
            game.newLevel();
        }
    });

    socket.on('joinedGame1Player', function () {
        console.log('1 player has joined');
        socket.emit('playerId',
        { 'id': 'player1'});
        let game = new Game([socket], ioServer);
        game.newLevel();
    });
});

// Start the server
http.listen(3000, function () {
    console.log('listening on *:3000');
});