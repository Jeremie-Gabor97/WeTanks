import { Position } from './tankInfo/baseTank';

export class Wall {
    position: Position;

    constructor(position: Position) {
        this.position = position;
    }
}