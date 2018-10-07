import * as socketIO from 'socket.io';
import { Key } from 'ts-key-enum';
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
    private levelState: Level;

    constructor(players: socketIO.Socket[], ioServer: socketIO.Server) {
        this.ioServer = ioServer;
        this.player1 = players[0]; // is a socket
        this.player2 = players[1]; // is a socket
        this.levelNum = 1;
    }

    attachSocketListeners() {
        this.player1.on('key', this.onPlayer1Key);
        this.player1.on('rotation', this.onPlayer1Rotation);
        this.player1.on('click', this.onPlayer1Click);
        this.player2.on('key', this.onPlayer2Key);
        this.player2.on('rotation', this.onPlayer2Rotation);
        this.player2.on('click', this.onPlayer2Click);
    }

    public newLevel(): void {
        // Pre game set up if we want
        this.levelState = levels[this.levelNum - 1];
        this.ioServer.emit('levelStart',
            {
                'tanks': this.levelState.enemyTanks.concat(this.levelState.p1Tank, this.levelState.p2Tank),
                'walls': this.levelState.wallInfo,
                'height': this.levelState.height,
                'width': this.levelState.width
            }
        );
        console.log(this.levelState.p1Tank.id);
        console.log('setup method');
        setInterval(this.gameLoop, 1000 / 30);
    }

    onPlayer1Click = (clickInfo: any) => {
        if (clickInfo.button === 0) {
            this.levelState.bulletCount += 1;
            this.levelState.p1Tank.bulletsActive += 1;
            this.levelState.bullets.push(new Bullet(this.levelState.p1Tank.rotationGun, this.levelState.p1Tank.position,
                this.levelState.p1Tank, 0, String(this.levelState.bulletCount)));
        } else {
            this.levelState.mineCount += 1;
            this.levelState.p1Tank.minesActive += 1;
            this.levelState.mines.push(new Mine(this.levelState.p1Tank.position, this.levelState.p1Tank, String(this.levelState.mineCount)));
        }
    }

    onPlayer2Click = (clickInfo: any) => {
        if (clickInfo.button === 0) {
            this.levelState.bulletCount += 1;
            this.levelState.p2Tank.bulletsActive += 1;
            this.levelState.bullets.push(new Bullet(this.levelState.p2Tank.rotationGun, this.levelState.p2Tank.position,
                this.levelState.p2Tank, 0, String(this.levelState.bulletCount)));
        } else {
            this.levelState.mineCount += 1;
            this.levelState.p2Tank.minesActive += 1;
            this.levelState.mines.push(new Mine(this.levelState.p2Tank.position, this.levelState.p2Tank, String(this.levelState.mineCount)));
        }

    }

    onPlayer1Rotation = (rotationInfo: any) => {
        this.levelState.p1Tank.rotationGun = rotationInfo.angle;
    }

    onPlayer2Rotation = (rotationInfo: any) => {
        this.levelState.p2Tank.rotationGun = rotationInfo.angle;
    }

    onPlayer1Key = (directionInfo: any) => {
        if (directionInfo.isDown === true) {
            this.levelState.p1Tank.keysPushed.unshift(directionInfo.Key);
        } else {
            this.levelState.p1Tank.keysPushed.splice( this.levelState.p1Tank.keysPushed.indexOf(directionInfo.Key), 1 );
        }
        this.levelState.p1Tank.setTargetDirection();
    }

    onPlayer2Key = (directionInfo: any) => {
        if (directionInfo.isDown === true) {
            this.levelState.p2Tank.keysPushed.unshift(directionInfo.Key);
        } else {
            this.levelState.p2Tank.keysPushed.splice( this.levelState.p1Tank.keysPushed.indexOf(directionInfo.Key), 1 );
        }
        this.levelState.p2Tank.setTargetDirection();
    }

    gameLoop = () => {
        if (this.levelState.p1Tank.targetDirectionBase !== this.levelState.p1Tank.rotationBase) {
            this.levelState.p1Tank.adjustBaseOrientation();
        }
        if (this.levelState.p2Tank.targetDirectionBase !== this.levelState.p2Tank.rotationBase) {
            this.levelState.p2Tank.adjustBaseOrientation();
        }
        if (this.levelState.p1Tank.keysPushed.length !== 0) {
            this.levelState.p1Tank.updatePosition(this.levelState.width, this.levelState.height);
        }
        if (this.levelState.p2Tank.keysPushed.length !== 0) {
            this.levelState.p2Tank.updatePosition(this.levelState.width, this.levelState.height);
        }
        this.levelState.bullets.forEach(bullet => {
            bullet.updatePosition(this.levelState.width, this.levelState.height);
        });
        this.ioServer.emit('update',
            {
                'tanks': this.levelState.enemyTanks.push(this.levelState.p1Tank, this.levelState.p2Tank),
                'bullets': this.levelState.bullets
            });
    }

        // https://divillysausages.com/2015/07/12/an-intro-to-socket-io/
        // https://blog.harveydelaney.com/creating-a-game-using-html5-canvas-typescript-and-webpack/
        // interesting read about timing of updates
        // https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
    }