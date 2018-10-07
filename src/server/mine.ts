import { Position } from './tank';
import { Tank } from './tank';

export class Mine {
    private position: Position;
    private tank: Tank;
    private id: string;

    constructor(position: Position, tank: Tank, id: string) {
        this.position = position;
        this.tank = tank;
        this.id = id;
    }
}