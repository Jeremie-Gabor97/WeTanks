import { Bullet } from '../bullet';
import { Mine } from '../mine';
import { Position } from '../tank';
import { Tank } from '../tank';
import { Wall } from '../wall';

export class Level {
    public p1Tank: Tank;
    public p2Tank: Tank;
    public height: Number;
    public width: Number;
    public enemyTanks: Tank[];
    public wallInfo: Wall[];
    public bullets: Bullet[];
    public mines: Mine[];
    public bulletCount: number;
    public mineCount: number;

    constructor(p1Tank: Tank, p2Tank: Tank, height: Number, width: Number, tankInfo: Tank[], wallInfo: Wall[]) {
        this.p1Tank = p1Tank;
        this.p2Tank = p2Tank;
        this.height = height;
        this.width = width;
        this.enemyTanks = tankInfo;
        this.wallInfo = wallInfo;
        this.bulletCount = 0;
        this.mineCount = 0;
    }
}