// waiting for another player screen -> overlay
// game play screen
// level completed -> overlay
// game lost screen -> overlay

// keep track of list of players and bullets to determine when one dies
// when one dies play explosion animation at that location...

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
    rotation: number;
}

interface ITankInfo extends ITank {
    type: number;
}

interface IWallInfo {
    position: Pos;
}

interface IBullet {
    id: string;
    position: Position;
    rotation: number;
    type: number;
}

interface IMine {
    id: string;
    position: Position;
}

interface IUpdateInfo {
    tanks: ITank[];
    bullets: IBullet[];
}

interface ILevelInfo {
    tanks: ITankInfo[];
    walls: IWallInfo[];
}

class CreepsClient {
    stage: createjs.Stage;
    width: number;
    height: number;
    gameLoop: number;
    fps: number;
    socket: SocketIOClient.Socket;

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
        const canvas = document.getElementById('theCanvas');
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        console.log('width: ' + this.width);
        console.log('height: ' + this.height);
        this.stage = new createjs.Stage('theCanvas');
        this.fps = 60;

        this.attachSocketListeners();
        this.initUi();

        this.gameLoop = window.setInterval(() => {
            this.stage.update();
        }, 1000 / this.fps);

        this.onLevelStart({
            tanks: [
                {
                    id: '7',
                    position: {
                        x: 50,
                        y: 50
                    },
                    rotation: 0,
                    type: 0
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
        this.socket.on('update', this.onUpdate);
        this.socket.on('levelEnd', this.onLevelEnd);
        this.socket.on('levelStart', this.onLevelStart);
        this.socket.on('loseGame', this.onLoseGame);
        this.socket.on('mineExpiring', this.onMineExpiring);
    }

    onUpdate(updateInfo: IUpdateInfo) {
        console.log('on update');
    }

    onLevelEnd() {
        console.log('on level end');
        this.overlayText.text = 'G-man would be proud. Onwards!';
        this.overlay.visible = true;
    }

    onLevelStart(levelInfo: ILevelInfo) {
        console.log('on level start');
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
            tankSprite.x = tank.position.x;
            tankSprite.y = tank.position.y;
            this.tankSprites[tank.id] = tankSprite;
            this.tanksContainer.addChild(tankSprite);
        });

        levelInfo.walls.forEach(wall => {
            this.wallInfos.push(wall);
            const wallSprite = new createjs.Bitmap('assets/wall.png');
            wallSprite.x = wall.position.x;
            wallSprite.y = wall.position.y;
            this.wallSprites.push(wallSprite);
            this.wallsContainer.addChild(wallSprite);
        });
    }

    onLoseGame() {
        console.log('on lose game');
        this.overlayText.text = 'Get rekt mate...';
        this.overlay.visible = true;
    }

    onMineExpiring(id: string) {
        console.log('on mine expiring');
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