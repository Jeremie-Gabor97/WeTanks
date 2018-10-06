import { Position } from './tank';
import { Tank } from './tank';

export class Bullet {
    private id: string;
    private rotation: number;
    private position: Position;
    private type: number;
    private tank: Tank;

    constructor(rotation: number, position: Position, tank: Tank, type: number, id: string) {
        this.rotation = rotation;
        this.position = position;
        this.tank = tank;
        this.type = type;
        this.id = id;
    }
}