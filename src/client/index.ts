class CreepsClient {
    stage: createjs.Stage;
    gameLoop: number;
    fps: number;
    socket: SocketIOClient.Socket;

    constructor() {
        this.socket = io();
        this.stage = new createjs.Stage('theCanvas');
        this.fps = 60;
        this.gameLoop = window.setInterval(() => {
            this.stage.update();
        }, 1000 / this.fps);

        const circle = new createjs.Shape();
        circle.graphics.beginFill('red').drawCircle(0, 0, 50);
        circle.x = 100;
        circle.y = 100;
        this.stage.addChild(circle);
        this.stage.update();
    }
}

const creepsClient = new CreepsClient();