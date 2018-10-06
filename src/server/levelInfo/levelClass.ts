import { Position } from '../tank';
import { Tank } from '../tank';

export class Level {
    public redTank: Tank;
    public blueTank: Tank;
    public height: Number;
    public width: Number;
    public tankInfo: Tank[];
    public wallInfo: Position[];

    constructor(redTank: Tank, blueTank: Tank, height: Number, width: Number, tankInfo: Tank[], wallInfo: Position[]) {
        this.redTank = redTank;
        this.blueTank = blueTank;
        this.height = height;
        this.width = width;
        this.tankInfo = tankInfo;
        this.wallInfo = wallInfo;
    }
}