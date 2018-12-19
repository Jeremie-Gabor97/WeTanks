import { clone } from 'lodash';
import { Wall } from '../wall';
import { Position } from './baseTank';
import { Vector } from './baseTank';
import { BaseTank } from './baseTank';
import { IConstructorTankObjectInterface } from './constructorTankObjectInterface';
import { EnemyTank } from './enemyTank';

// might move, havnt decided yet, but will attempt bounce shots if the opportunity is there

export class BlueTank extends EnemyTank {
    constructor(constructorObj: IConstructorTankObjectInterface) { 
        super(constructorObj);
    }

    public shoot(width: number, height: number, enemies: BaseTank[], walls: Wall[], wallSize: number) {
        if (this.directLineOfSightToShoot(width, height, enemies, walls, wallSize, this.getBulletPosition(), this.rotationGun)) {
            return true;
        } else if (this.bounceShoot(width, height, enemies, walls, wallSize, this.getBulletPosition(), this.rotationGun)) {
            return true;
        }

    }
}