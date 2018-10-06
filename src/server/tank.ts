export class Tank {
    private id: string;
    private type: string;
    private position: Position;
    private rotationGun: number;
    private rotationBase: number;

    constructor(id: string, position: Position, rotationGun: number, rotationBase: number, type: string) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.rotationGun = rotationGun;
        this.rotationBase = rotationBase;
    }
}

export class Position {
    private x: Number;
    private y: Number;

    constructor(x: Number, y: Number) {
        this.x = x;
        this.y = y;
    }
}