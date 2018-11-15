import { clone } from 'lodash';
import { cloneDeep } from 'lodash';
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
    private gameInterval: NodeJS.Timer;
    private wallSize: number;

    constructor(players: socketIO.Socket[], ioServer: socketIO.Server) {
        this.ioServer = ioServer;
        this.player1 = players[0]; // is a socket
        this.player2 = players[1]; // is a socket
        this.levelNum = 1;
        this.wallSize = 32;
        this.attachSocketListeners();
    }

    attachSocketListeners() {
        this.player1.on('key', this.onPlayer1Key);
        this.player1.on('rotation', this.onPlayer1Rotation);
        this.player1.on('click', this.onPlayer1Click);
        this.player2.on('key', this.onPlayer2Key);
        this.player2.on('rotation', this.onPlayer2Rotation);
        this.player2.on('click', this.onPlayer2Click);
        this.player1.on('reset', this.reset);
        this.player2.on('reset', this.reset);
    }

    reset = () => {
        this.newLevel();
    }

    public newLevel(): void {
        // Pre game set up if we want
        this.levelState = cloneDeep(levels[this.levelNum - 1]);
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
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(this.gameLoop, 1000 / 30);
    }

    onPlayer1Click = (clickInfo: any) => {
        if (clickInfo.button === 0 && this.levelState.p1Tank.alive && this.levelState.p1Tank.bulletsActive < this.levelState.p1Tank.allowedBulletsActive) {
            this.levelState.bulletCount += 1;
            this.levelState.p1Tank.bulletsActive += 1;
            this.levelState.bullets.push(new Bullet(this.levelState.p1Tank.rotationGun, this.levelState.p1Tank.getBulletPosition(),
                this.levelState.p1Tank, 0, String(this.levelState.bulletCount)));
        } else if (this.levelState.p1Tank.alive) {
            this.levelState.mineCount += 1;
            this.levelState.p1Tank.minesActive += 1;
            this.levelState.mines.push(new Mine(clone(this.levelState.p1Tank.position), this.levelState.p1Tank, String(this.levelState.mineCount)));
        }
    }

    onPlayer2Click = (clickInfo: any) => {
        if (clickInfo.button === 0 && this.levelState.p2Tank.alive && this.levelState.p2Tank.bulletsActive < this.levelState.p2Tank.allowedBulletsActive) {
            this.levelState.bulletCount += 1;
            this.levelState.p2Tank.bulletsActive += 1;
            this.levelState.bullets.push(new Bullet(this.levelState.p2Tank.rotationGun, this.levelState.p2Tank.getBulletPosition(),
                this.levelState.p2Tank, 0, String(this.levelState.bulletCount)));
        } else if (this.levelState.p2Tank.alive) {
            this.levelState.mineCount += 1;
            this.levelState.p2Tank.minesActive += 1;
            this.levelState.mines.push(new Mine(clone(this.levelState.p2Tank.position), this.levelState.p2Tank, String(this.levelState.mineCount)));
        }

    }

    onPlayer1Rotation = (rotationInfo: any) => {
        this.levelState.p1Tank.rotationGun = rotationInfo.angle;
    }

    onPlayer2Rotation = (rotationInfo: any) => {
        this.levelState.p2Tank.rotationGun = rotationInfo.angle;
    }

    onPlayer1Key = (directionInfo: any) => {
        let directions = [Key.ArrowDown, Key.ArrowLeft, Key.ArrowRight, Key.ArrowUp];
        let directionsSecondary = ['s', 'a', 'd', 'w'];
        const secondaryIndex = directionsSecondary.indexOf(directionInfo.key);
        if (secondaryIndex >= 0) {
            directionInfo.key = directions[secondaryIndex];
        }
        if (directionInfo.isDown === true && directions.indexOf(directionInfo.key) > -1) {
            this.levelState.p1Tank.keysPushed.unshift(directionInfo.key);
        } else if (directions.indexOf(directionInfo.key) > -1) {
            this.levelState.p1Tank.keysPushed.splice( this.levelState.p1Tank.keysPushed.indexOf(directionInfo.key), 1 );
        }
        this.levelState.p1Tank.setTargetDirection();
    }

    onPlayer2Key = (directionInfo: any) => {
        let directions = [Key.ArrowDown, Key.ArrowLeft, Key.ArrowRight, Key.ArrowUp];
        let directionsSecondary = ['s', 'a', 'd', 'w'];
        const secondaryIndex = directionsSecondary.indexOf(directionInfo.key);
        if (secondaryIndex >= 0) {
            directionInfo.key = directions[secondaryIndex];
        }
        if (directionInfo.isDown === true && directions.indexOf(directionInfo.key) > -1) {
            this.levelState.p2Tank.keysPushed.unshift(directionInfo.key);
        } else if (directions.indexOf(directionInfo.key) > -1) {
            this.levelState.p2Tank.keysPushed.splice( this.levelState.p2Tank.keysPushed.indexOf(directionInfo.key), 1 );
        }
        this.levelState.p2Tank.setTargetDirection();
    }

    private detectCollisionTankBullet(tank: Tank, bullet: Bullet) {
        let distance = (tank.position.x - bullet.position.x) ** 2 + (tank.position.y - bullet.position.y) ** 2;
        if (bullet.tank === tank) {
            // if bullet was shot by this tank
            if ((distance < (tank.radius + bullet.radius) ** 2) && bullet.bounces === 1) {
                // for bullet to kills its own tank, has to have bounced
                return true;
            }
            return false;
        }
        // if bullet was shot by another tank
        if (distance < (tank.radius + bullet.radius) ** 2) {
            return true;
        }
        return false;
    }

    private resolveCollisions() {
        // bullets bouncing of walls
        this.levelState.bullets.forEach( bullet => {
            bullet.resolveCollision(this.levelState.width, this.levelState.height, this.levelState.bullets, this.levelState.wallInfo, this.wallSize);
            if (bullet.bounces > bullet.allowedBounces) {
                bullet.tank.bulletsActive -= 1;
                bullet.live = 0;
            }
        });
        this.levelState.bullets.forEach( bullet => {
            if (bullet.live === 0) {
                this.levelState.bullets.splice( this.levelState.bullets.indexOf(bullet), 1 );        
            }
        });

        // check if colliding with bullets
        if (this.levelState.p1Tank.alive === 1) {
            for (let bullet of this.levelState.bullets) {
                if (this.detectCollisionTankBullet(this.levelState.p1Tank, bullet)) {
                    bullet.tank.bulletsActive -= 1;
                    this.levelState.p1Tank.alive = 0;
                    this.levelState.bullets.splice( this.levelState.bullets.indexOf(bullet), 1 );
                    break;
                }
            }
        }
        if (this.levelState.p2Tank.alive === 1) {
            for (let bullet of this.levelState.bullets) {
                if (this.detectCollisionTankBullet(this.levelState.p2Tank, bullet)) {
                    bullet.tank.bulletsActive -= 1;
                    this.levelState.p2Tank.alive = 0;
                    this.levelState.bullets.splice( this.levelState.bullets.indexOf(bullet), 1 );
                    break;
                }
            }    
        }
        for (let tank of this.levelState.enemyTanks) {
            for (let bullet of this.levelState.bullets) {
                if (this.detectCollisionTankBullet(tank, bullet)) {
                    bullet.tank.bulletsActive -= 1;
                    this.levelState.enemyTanks.splice( this.levelState.enemyTanks.indexOf(tank), 1 );
                    this.levelState.bullets.splice( this.levelState.bullets.indexOf(bullet), 1 );
                    break;
                }   
            }
        }

        this.levelState.p1Tank.detectCollison(this.levelState.width, this.levelState.height,
             this.levelState.enemyTanks.concat(this.levelState.p2Tank), this.levelState.wallInfo, this.wallSize);
        this.levelState.p2Tank.detectCollison(this.levelState.width, this.levelState.height,
             this.levelState.enemyTanks.concat(this.levelState.p1Tank), this.levelState.wallInfo, this.wallSize);
        this.levelState.enemyTanks.forEach(tank => {
            tank.detectCollison(this.levelState.width, this.levelState.height,
                 this.levelState.enemyTanks.concat(this.levelState.p1Tank, this.levelState.p2Tank), this.levelState.wallInfo, this.wallSize);
        });
    }

    gameLoop = () => {
        // rotation
        if (Math.abs( this.levelState.p1Tank.targetDirectionBase - this.levelState.p1Tank.rotationBase) > Math.PI / 180) {
            this.levelState.p1Tank.adjustBaseOrientation();
        }
        // rotation
        if (Math.abs( this.levelState.p2Tank.targetDirectionBase - this.levelState.p2Tank.rotationBase) > Math.PI / 180) {
            this.levelState.p2Tank.adjustBaseOrientation();
        }
        // movement
        if (this.levelState.p1Tank.keysPushed.length !== 0) {
            this.levelState.p1Tank.updatePosition(this.levelState.width, this.levelState.height);
        }
        // movement
        if (this.levelState.p2Tank.keysPushed.length !== 0) {
            this.levelState.p2Tank.updatePosition(this.levelState.width, this.levelState.height);
        }
        this.levelState.bullets.forEach(bullet => {
            bullet.updatePosition(this.levelState.width, this.levelState.height);
        });
        this.resolveCollisions();
        let allTanks = this.levelState.enemyTanks.concat(this.levelState.p1Tank, this.levelState.p2Tank);
        if (this.levelState.p1Tank.alive === 0 && this.levelState.p2Tank.alive === 0) {
            allTanks = this.levelState.enemyTanks;
        } else if (this.levelState.p1Tank.alive === 0) {
            allTanks = this.levelState.enemyTanks.concat(this.levelState.p2Tank);
        } else if (this.levelState.p2Tank.alive === 0) {
            allTanks = this.levelState.enemyTanks.concat(this.levelState.p1Tank);
        }
        this.levelState.enemyTanks.concat(this.levelState.p1Tank, this.levelState.p2Tank).forEach( tank => {
            tank.prevPosition = clone(tank.position);
        });
        this.ioServer.emit('update',
            {
                'tanks': allTanks,
                'bullets': this.levelState.bullets
            });
    }

        // https://divillysausages.com/2015/07/12/an-intro-to-socket-io/
        // https://blog.harveydelaney.com/creating-a-game-using-html5-canvas-typescript-and-webpack/
        // interesting read about timing of updates
        // https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
    }