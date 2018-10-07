// waiting for another player screen -> overlay
// game play screen
// level completed -> overlay
// game lost screen -> overlay

// keep track of list of players and bullets to determine when one dies
// when one dies play explosion animation at that location...
import { throttle } from 'lodash';
import KeyManager from './keys';
import { Degrees } from './utils';

type Dictionary<T> = {
    [index: string]: T;
};

type Pos = {
    x: number;
    y: number;
};

interface ITank {
    id: string;
    position: Pos;
    rotationBase: number;
}

interface ITankInfo extends ITank {
    type: number;
}

interface IWallInfo {
    position: Pos;
}

interface IBullet {
    id: string;
    position: Pos;
    rotation: number;
    type: number;
}

interface IMine {
    id: string;
    position: Pos;
}

interface IPlayerIdInfo {
    id: string;
}

interface IUpdateInfo {
    tanks: ITank[];
    bullets: IBullet[];
}

interface ILevelInfo {
    tanks: ITankInfo[];
    walls: IWallInfo[];
}

const fakeUpdate: IUpdateInfo = {
    tanks: [
        {
            id: '7',
            position: {
                x: 40,
                y: 40
            },
            rotationBase: Math.PI
        },
        {
            id: '8',
            position: {
                x: 100,
                y: 100
            },
            rotationBase: -Math.PI / 2
        }
    ],
    bullets: []
};

class CreepsClient {
    stage: createjs.Stage;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    gameLoop: number;
    fps: number;
    socket: SocketIOClient.Socket;
    mousePosition: Pos;
    frameNum: number;
    keyManager: KeyManager;
    playerId: string;

    tankInfos: Dictionary<ITankInfo>;
    bulletInfos: Dictionary<IBullet>;
    mineInfos: Dictionary<IMine>;
    wallInfos: IWallInfo[];

    tankSprites: Dictionary<createjs.Bitmap>;
    bulletSprites: Dictionary<createjs.Bitmap>;
    mineSprites: Dictionary<createjs.Bitmap>;
    wallSprites: createjs.Bitmap[];

    overlay: createjs.Container;
    overlayText: createjs.Text;

    levelContainer: createjs.Container;
    tanksContainer: createjs.Container;
    wallsContainer: createjs.Container;
    bulletsContainer: createjs.Container;
    minesContainer: createjs.Container;

    constructor() {
        this.socket = io();
        this.canvas = document.getElementById('theCanvas') as HTMLCanvasElement;
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        console.log('width: ' + this.width);
        console.log('height: ' + this.height);
        this.stage = new createjs.Stage('theCanvas');
        this.fps = 30;
        this.frameNum = 0;
        this.keyManager = new KeyManager();

        this.attachSocketListeners();
        this.attachEventListeners();
        this.initUi();

        this.gameLoop = window.setInterval(this.tick, 1000 / this.fps);

        this.onLevelStart({
            tanks: [
                {
                    id: '7',
                    position: {
                        x: 0,
                        y: 0
                    },
                    rotationBase: Math.PI / 4,
                    type: 0
                },
                {
                    id: '8',
                    position: {
                        x: 32,
                        y: 32
                    },
                    rotationBase: 3 * Math.PI / 4,
                    type: 1
                }
            ],
            walls: [
                {
                    position: {
                        x: 200,
                        y: 200
                    }
                }
            ]
        });
    }

    tick = () => {
        this.stage.update();
        if (this.frameNum === 5) {
            this.socket.emit('rotation', this.getPlayerRotation);
        }
        this.frameNum = (this.frameNum + 1) % 6;
    }

    getPlayerRotation() {
        const mousePosition = this.mousePosition;
        const playerPosition = this.tankInfos[this.playerId].position;
        return Math.atan2(mousePosition.y - playerPosition.y, mousePosition.x - playerPosition.y);
    }

    initUi() {
        this.overlay = new createjs.Container();
        this.overlay.x = Math.floor(this.width / 4);
        this.overlay.y = Math.floor(this.height / 4);

        const overlayBG = new createjs.Shape();
        overlayBG.graphics.beginFill('#99999999');
        overlayBG.graphics.drawRect(0, 0, Math.floor(this.width / 2), Math.floor(this.height / 2));
        overlayBG.graphics.endFill();
        this.overlay.addChild(overlayBG);

        this.overlayText = new createjs.Text('Waiting for game to start...');
        this.overlayText.textAlign = 'center';
        this.overlayText.textBaseline = 'middle';
        this.overlayText.x = Math.floor(this.width / 4);
        this.overlayText.y = Math.floor(this.height / 4);
        this.overlayText.font = '20px Arial';
        this.overlay.addChild(this.overlayText);

        this.levelContainer = new createjs.Container();
        this.tanksContainer = new createjs.Container();
        this.wallsContainer = new createjs.Container();
        this.bulletsContainer = new createjs.Container();
        this.minesContainer = new createjs.Container();

        this.levelContainer.addChild(this.wallsContainer);
        this.levelContainer.addChild(this.minesContainer);
        this.levelContainer.addChild(this.tanksContainer);
        this.levelContainer.addChild(this.bulletsContainer);
        this.stage.addChild(this.levelContainer);
        this.stage.addChild(this.overlay);
    }

    attachSocketListeners() {
        this.socket.on('playerId', this.onPlayerId);
        this.socket.on('update', this.onUpdate);
        this.socket.on('levelEnd', this.onLevelEnd);
        this.socket.on('levelStart', this.onLevelStart);
        this.socket.on('loseGame', this.onLoseGame);
        this.socket.on('mineExpiring', this.onMineExpiring);
    }

    attachEventListeners() {
        this.canvas.addEventListener('mousemove', throttle(this.onMouseMove, 100));
        this.canvas.addEventListener('click', this.onClick);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    onMouseMove = (e: MouseEvent) => {
        // console.log('emitting mouse move');
        this.mousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    }

    onClick = (e: MouseEvent) => {
        this.socket.emit('click');
        // console.log('emitting clicked');
    }

    onKeyDown = (e: KeyboardEvent) => {
        if (this.keyManager.keyDown(e.key)) {
            // console.log('emitting key down');
            this.socket.emit('key', {
                key: e.key,
                isDown: true
            });

            if (e.key === 'a') {
                this.onUpdate(fakeUpdate);
            }
        }
    }

    onKeyUp = (e: KeyboardEvent) => {
        this.keyManager.keyUp(e.key);
        // console.log('emitting key up');
        this.socket.emit('key', {
            key: e.key,
            isDown: false
        });
    }

    onPlayerId = (playerIdInfo: IPlayerIdInfo) => {
        console.log('receiving player id');
        this.playerId = playerIdInfo.id;
    }

    onUpdate = (updateInfo: IUpdateInfo) => {
        console.log('on update');

        // Remove old tanks
        const newTankIds = updateInfo.tanks.map(tank => tank.id);
        const oldTankIds = Object.keys(this.tankInfos);
        oldTankIds.forEach((id) => {
            if (newTankIds.indexOf(id) < 0) {
                // this tank real dead
                this.tankInfos[id] = null;
                delete this.tankInfos[id];
                this.tanksContainer.removeChild(this.tankSprites[id]);
                this.tankSprites[id] = null;
                delete this.tankSprites[id];
            }
        });

        // Update existing tanks
        updateInfo.tanks.forEach((tank) => {
            const info = this.tankInfos[tank.id];
            if (info) {
                info.position = tank.position;
                info.rotationBase = Degrees(tank.rotationBase);
                const sprite = this.tankSprites[tank.id];
                sprite.x = info.position.x;
                sprite.y = info.position.y;
                sprite.rotation = info.rotationBase * -1;
            }
        });

        // Remove old bullets
        const newBulletIds = updateInfo.bullets.map(bullet => bullet.id);
        const oldBulletIds = Object.keys(this.bulletInfos);
        oldBulletIds.forEach((id) => {
            if (newBulletIds.indexOf(id) < 0) {
                // this bullet real dead
                this.bulletInfos[id] = null;
                delete this.bulletInfos[id];
                this.bulletsContainer.removeChild(this.bulletSprites[id]);
                this.bulletSprites[id] = null;
                delete this.bulletSprites[id];
            }
        });

        // Update existing bullets
        updateInfo.bullets.forEach((bullet) => {
            const info = this.bulletInfos[bullet.id];
            if (info) {
                info.position = bullet.position;
                info.rotation = Degrees(bullet.rotation);
                const sprite = this.bulletSprites[bullet.id];
                sprite.x = info.position.x;
                sprite.y = info.position.y;
                sprite.rotation = info.rotation * -1;
            }
        });
    }

    onLevelEnd = () => {
        console.log('receiving level end');
        this.overlayText.text = 'G-man would be proud. Onwards!';
        this.overlay.visible = true;
    }

    onLevelStart = (levelInfo: ILevelInfo) => {
        console.log('receiving level start');
        this.overlay.visible = false;

        this.tankInfos = {};
        this.bulletInfos = {};
        this.mineInfos = {};
        this.wallInfos = [];

        this.tankSprites = {};
        this.bulletSprites = {};
        this.mineSprites = {};
        this.wallSprites = [];

        this.tanksContainer.removeAllChildren();
        this.bulletsContainer.removeAllChildren();
        this.minesContainer.removeAllChildren();
        this.wallsContainer.removeAllChildren();

        levelInfo.tanks.forEach(tank => {
            this.tankInfos[tank.id] = tank;
            const tankSprite = new createjs.Bitmap(this.getTankSpriteFromType(tank.type));
            tankSprite.regX = 16;
            tankSprite.regY = 16;
            tankSprite.x = tank.position.x;
            tankSprite.y = tank.position.y;
            tankSprite.rotation = Degrees(tank.rotationBase) * -1;
            this.tankSprites[tank.id] = tankSprite;
            this.tanksContainer.addChild(tankSprite);
        });

        levelInfo.walls.forEach(wall => {
            this.wallInfos.push(wall);
            const wallSprite = new createjs.Bitmap('assets/wall.png');
            wallSprite.regX = 16;
            wallSprite.regY = 16;
            wallSprite.x = wall.position.x;
            wallSprite.y = wall.position.y;
            this.wallSprites.push(wallSprite);
            this.wallsContainer.addChild(wallSprite);
        });
    }

    onLoseGame = () => {
        console.log('receiving lose game');
        this.overlayText.text = 'Get rekt mate...';
        this.overlay.visible = true;
    }

    onMineExpiring = (id: string) => {
        console.log('receiving mine expiring');
    }

    getTankSpriteFromType(type: number) {
        switch (type) {
            case 0:
                return 'assets/tankBlue.png';
            case 1:
                return 'assets/tankRed.png';
            case 2:
                return 'assets/tankGreen.png';
            default:
                return 'assets/jeremie.png';
        }
    }
}

const creepsClient = new CreepsClient();