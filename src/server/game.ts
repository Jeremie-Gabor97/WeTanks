import * as socketIO from 'socket.io';
import { levels } from './levelInfo/allLevels';
import { Level } from './levelInfo/levelClass';
import { Tank } from './tank';

export class Game {
    private ioServer: socketIO.Server;
    private player1: socketIO.Socket;
    private player2: socketIO.Socket;
    private levelNum: number;
    private redTank: Tank;
    private blueTank: Tank;
    
    constructor(players: socketIO.Socket[], ioServer: socketIO.Server) {
        this.ioServer = ioServer;
        this.player1 = players[0]; // is a socket
        this.player2 = players[1]; // is a socket
        this.levelNum = 1;
    }

    public newLevel(): void {
        // Pre game set up if we want
        let levelInfo = levels[this.levelNum - 1];
        this.ioServer.emit('levelStart',
         {  'redTank': levelInfo.redTank,
            'blueTank': levelInfo.blueTank,
            'tanks': levelInfo.tankInfo,
            'walls': levelInfo.wallInfo,
            'height': levelInfo.height,
            'width': levelInfo.width
         }
        );
        console.log('setup method');
        this.gameLoop();
    }

    private gameLoop(): void {

        // requestAnimationFrame(this.gameLoop.bind(this));

        // this.g
    }

    // https://divillysausages.com/2015/07/12/an-intro-to-socket-io/
    // https://blog.harveydelaney.com/creating-a-game-using-html5-canvas-typescript-and-webpack/
}