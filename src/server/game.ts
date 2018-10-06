import * as socketIO from 'socket.io';
import { Bullet } from './bullet';
import { levels } from './levelInfo/allLevels';
import { level1 } from './levelInfo/Level1';
import { Level } from './levelInfo/levelClass';
import { Mine } from './mine';
import { Tank } from './tank';

export class Game {
    private ioServer: socketIO.Server;
    private player1: socketIO.Socket;
    private player2: socketIO.Socket;
    private levelNum: number;
    
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
         {  'player1Tank': levelInfo.p1Tank,
            'player2Tank': levelInfo.p2Tank,
            'tanks': levelInfo.enemyTanks,
            'walls': levelInfo.wallInfo,
            'height': levelInfo.height,
            'width': levelInfo.width
         }
        );
        console.log('setup method');
        this.gameLoop(levelInfo);
    }

    private gameLoop(levelState: Level): void {
        this.player1.on( 'click', function(msg: any) {
            if (msg.button === 1) {
                levelState.bulletCount += 1;
                levelState.p1Tank.bulletsActive += 1;
                levelState.bullets.push(new Bullet(levelState.p1Tank.rotationGun, levelState.p1Tank.position,
                     levelState.p1Tank, 0, String(levelState.bulletCount)));
            } else {
                levelState.mineCount += 1;
                levelState.p1Tank.minesActive += 1;
                levelState.mines.push(new Mine(levelState.p1Tank.position, levelState.p1Tank, String(levelState.mineCount)));
            }
        });
        this.player2.on( 'click', function(msg: any) {
            if (msg.button === 1) {
                levelState.bulletCount += 1;
                levelState.p2Tank.bulletsActive += 1;
                levelState.bullets.push(new Bullet(levelState.p2Tank.rotationGun, levelState.p2Tank.position,
                     levelState.p2Tank, 0, String(levelState.bulletCount)));
            } else {
                levelState.mineCount += 1;
                levelState.p2Tank.minesActive += 1;
                levelState.mines.push(new Mine(levelState.p2Tank.position, levelState.p2Tank, String(levelState.mineCount)));
            }
        });
        this.player1.on( 'rotation', function (msg: any) {
            levelState.p1Tank.rotationGun = msg.angle;
        });
        this.player2.on( 'rotation', function (msg: any) {
            levelState.p2Tank.rotationGun = msg.angle;
        });
        this.player1.on( 'key', function (msg: any) {
            levelState.p1Tank.rotationBase = msg.angle;
        }); 
        this.player2.on( 'key', function (msg: any) {
            levelState.p2Tank.rotationBase = msg.angle;
        });
        this.ioServer.emit('update',
         {  'tanks': levelState.enemyTanks.push(levelState.p1Tank, levelState.p2Tank);
            'bullets': levelState.bullets
         });
        if (levelState.enemyTanks.length === 0) {
             this.ioServer.emit('levelEnd');
        } else {
            this.gameLoop(levelState);    
        }
    }

    // https://divillysausages.com/2015/07/12/an-intro-to-socket-io/
    // https://blog.harveydelaney.com/creating-a-game-using-html5-canvas-typescript-and-webpack/
}