import { clone } from 'lodash';
import { Wall } from '../wall';
import { Vector } from './baseTank';
import { BaseTank } from './baseTank';
import { IConstructorTankObjectInterface } from './constructorTankObjectInterface';

// this tank doesnt move just shoots towards opponent

export class BrownTank extends BaseTank {
    public targetDirectionGun: number;

    constructor(constructorObj: IConstructorTankObjectInterface) { 
        super(constructorObj);
        this.targetDirectionGun = constructorObj.rotationGun;

    }

    // this is whats called if a key is pressed or released
    public adjustGunOrientation() {
        let orientationChange = 2;
        // rotation
        if (Math.abs( this.targetDirectionGun - this.rotationGun) < Math.PI / 180) {
            this.targetDirectionGun = Math.random() * Math.PI * 2;
        } else {
            let normalizedRotationGun = this.normalizeRad(this.rotationGun);
            let normalizedTargetDirectionGun = this.normalizeRad(this.targetDirectionGun);
            if (normalizedTargetDirectionGun > normalizedRotationGun) {
                let diff = normalizedTargetDirectionGun - normalizedRotationGun;
                if (diff < Math.PI) {
                    this.rotationGun += orientationChange * (Math.PI / 180);        
                } else {
                    this.rotationGun -= orientationChange * (Math.PI / 180);        
                }
            } else {
                let diff = normalizedRotationGun - normalizedTargetDirectionGun;
                if (diff < Math.PI) {
                    this.rotationGun -= orientationChange * (Math.PI / 180);        
                } else {
                    this.rotationGun += orientationChange * (Math.PI / 180);        
                }
            }
            this.rotationGun = this.normalizeRad(this.rotationGun);
        }
    }

    // finds the point on border towards which gun is poiting
    private borderTargetPoint(width: number, height: number) {
        let gunTipPosition = this.getBulletPosition();
        let borderTarget = clone(gunTipPosition);
        if (this.rotationGun >= 0 && this.rotationGun < Math.PI / 2) {
            let X = width - gunTipPosition.x;
            let Y = Math.tan(this.rotationGun) * X;
            if (gunTipPosition.y < Y) {
                borderTarget.y = 0;
                borderTarget.x += gunTipPosition.y / Math.tan(this.rotationGun);
            } else {
                borderTarget.x = width;
                borderTarget.y -= Y;
            }
        } else if (this.rotationGun >= Math.PI / 2 && this.rotationGun < Math.PI) {
            let X = gunTipPosition.x;
            let Y = Math.tan(this.rotationGun) * X;
            if (gunTipPosition.y < Y) {
                borderTarget.y = 0;
                borderTarget.x -= gunTipPosition.y / Math.tan(this.rotationGun);
            } else {
                borderTarget.x = 0;
                borderTarget.y -= Y;
            }
        } else if (this.rotationGun >= Math.PI && this.rotationGun < 3 * Math.PI / 2) {
            let X = gunTipPosition.x;
            let Y = Math.tan(this.rotationGun) * X;
            if (height - gunTipPosition.y < Math.abs(Y)) {
                borderTarget.y = height;
                borderTarget.x -= (height - gunTipPosition.y) / Math.tan(this.rotationGun);
            } else {
                borderTarget.x = 0;
                borderTarget.y += Y;
            }
        } else {
            let X = gunTipPosition.x;
            let Y = Math.tan(this.rotationGun) * X;
            if (height - gunTipPosition.y < Math.abs(Y)) {
                borderTarget.y = height;
                borderTarget.x += (height - gunTipPosition.y) / Math.tan(this.rotationGun);
            } else {
                borderTarget.x = width;
                borderTarget.y += Y;
            }
        }
        return borderTarget;
    }

    public shoot(width: number, height: number, enemies: BaseTank[]) {
        // let gunTipPosition = this.getBulletPosition();
        // let borderTargetPoint = this.borderTargetPoint(width, height);
        // let gunSightVector = new Vector(gunTipPosition, borderTargetPoint);
        // for (let tank of enemies) {
        //     let gunToCenterOfTankVector = new Vector(gunTipPosition, tank.position);
        //     let result = this.dotProduct(gunSightVector, gunToCenterOfTankVector);
        //     Math.acos(this.lengthSquared())
        //     arccos((P122 + P132 - P232) / (2 * P12 * P13))
        // }
    }
}