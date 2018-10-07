import { Position } from './tank';
import { Tank } from './tank';

export class Bullet {
    private id: string;
    private rotation: number;
    private position: Position;
    private type: number;
    private tank: Tank;
    private bounces: number;


    constructor(rotation: number, position: Position, tank: Tank, type: number, id: string) {
        this.rotation = rotation;
        this.position = position;
        this.tank = tank;
        this.type = type;
        this.id = id;
        this.bounces = 0;
    }

    public updatePosition(width: number, height: number) {
        // distance travelled in one update
        let distance =  2;
        this.position.x = Math.cos(this.rotation) * distance;
        this.position.y = Math.sin(this.rotation) * distance;
    }
}