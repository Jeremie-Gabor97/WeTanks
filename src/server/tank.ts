export class Tank {
    public id: string;
    public type: string;
    public position: Position;
    public rotationGun: number;
    public rotationBase: number;
    public bulletsActive: number;
    public minesActive: number;


    constructor(id: string, position: Position, rotationGun: number, rotationBase: number, type: string) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.rotationGun = rotationGun;
        this.rotationBase = rotationBase;
        this.bulletsActive = 0;
        this.minesActive = 0;
    }
}

export class Position {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}