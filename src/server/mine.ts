import { Position } from './tankInfo/baseTank';
import { BaseTank } from './tankInfo/baseTank';

export class Mine {
    private position: Position;
    private tank: BaseTank;
    private id: string;

    constructor(position: Position, tank: BaseTank, id: string) {
        this.position = position;
        this.tank = tank;
        this.id = id;
    }
}