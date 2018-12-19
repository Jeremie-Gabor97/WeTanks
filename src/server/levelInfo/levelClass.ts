import { Bullet } from '../bulletInfo/bullet';
import { Mine } from '../mine';
import { Position } from '../tankInfo/baseTank';
import { BaseTank } from '../tankInfo/baseTank';
import { Wall } from '../wall';

export class Level {
    public p1Tank: BaseTank;
    public p2Tank: BaseTank;
    public height: number;
    public width: number;
    public enemyTanks: BaseTank[];
    public wallInfo: Wall[];
    public bullets: Bullet[];
    public mines: Mine[];
    public bulletCount: number;
    public mineCount: number;

    constructor(p1Tank: BaseTank, p2Tank: BaseTank, height: number, width: number, tankInfo: BaseTank[], wallInfo: Wall[]) {
        this.p1Tank = p1Tank;
        this.p2Tank = p2Tank;
        this.height = height;
        this.width = width;
        this.enemyTanks = tankInfo;
        this.wallInfo = wallInfo;
        this.bulletCount = 0;
        this.mineCount = 0;
        this.bullets = [];
        this.mines = [];
    }
}