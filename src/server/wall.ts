import { Position } from './tankInfo/baseTank';

export class Wall {
    position: Position;
    topLeft: Position;
    bottomRight: Position;

    constructor(position: Position) {
        this.position = position;
        this.topLeft = new Position(this.position.x - 32 / 2, this.position.y - 32 / 2);
        this.bottomRight = new Position(this.position.x + 32 / 2, this.position.y + 32 / 2);
    }
}