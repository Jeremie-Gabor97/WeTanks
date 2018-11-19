import { clone } from 'lodash';
import { Wall } from '../wall';
import { Position } from './baseTank';
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
        // rotation
        if (Math.abs( this.targetDirectionGun - this.rotationGun) < Math.PI / 180) {
            this.targetDirectionGun = Math.random() * Math.PI * 2;
        } else {
            let normalizedRotationGun = this.normalizeRad(this.rotationGun);
            let normalizedTargetDirectionGun = this.normalizeRad(this.targetDirectionGun);
            if (normalizedTargetDirectionGun > normalizedRotationGun) {
                let diff = normalizedTargetDirectionGun - normalizedRotationGun;
                if (diff < Math.PI) {
                    this.rotationGun += this.turretRotationSpeed * (Math.PI / 180);        
                } else {
                    this.rotationGun -= this.turretRotationSpeed * (Math.PI / 180);        
                }
            } else {
                let diff = normalizedRotationGun - normalizedTargetDirectionGun;
                if (diff < Math.PI) {
                    this.rotationGun -= this.turretRotationSpeed * (Math.PI / 180);        
                } else {
                    this.rotationGun += this.turretRotationSpeed * (Math.PI / 180);        
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
            let Y = Math.abs(Math.tan(this.rotationGun) * X);
            if (gunTipPosition.y < Y) {
                borderTarget.y = 0;
                borderTarget.x += gunTipPosition.y / Math.abs(Math.tan(this.rotationGun));
            } else {
                borderTarget.x = width;
                borderTarget.y -= Y;
            }
        } else if (this.rotationGun >= Math.PI / 2 && this.rotationGun < Math.PI) {
            let X = gunTipPosition.x;
            let Y = Math.abs(Math.tan(this.rotationGun) * X);
            if (gunTipPosition.y < Y) {
                borderTarget.y = 0;
                borderTarget.x -= gunTipPosition.y / Math.abs(Math.tan(this.rotationGun));
            } else {
                borderTarget.x = 0;
                borderTarget.y -= Y;
            }
        } else if (this.rotationGun >= Math.PI && this.rotationGun < 3 * Math.PI / 2) {
            let X = gunTipPosition.x;
            let Y = Math.abs(Math.tan(this.rotationGun) * X);
            if (height - gunTipPosition.y < Math.abs(Y)) {
                borderTarget.y = height;
                borderTarget.x -= (height - gunTipPosition.y) / Math.abs(Math.tan(this.rotationGun));
            } else {
                borderTarget.x = 0;
                borderTarget.y += Y;
            }
        } else {
            let X = gunTipPosition.x;
            let Y = Math.abs(Math.tan(this.rotationGun) * X);
            if (height - gunTipPosition.y < Math.abs(Y)) {
                borderTarget.y = height;
                borderTarget.x += (height - gunTipPosition.y) / Math.abs(Math.tan(this.rotationGun));
            } else {
                borderTarget.x = width;
                borderTarget.y += Y;
            }
        }
        return borderTarget;
    }

    public checkLineOfSightWallCollision(gunTipPosition: Position, borderTargetPoint: Position, tankPosition: Position, wall: Wall, wallSize: number) {
        let slope = (gunTipPosition.y - borderTargetPoint.y) / (gunTipPosition.x - borderTargetPoint.x);
        let intercept = gunTipPosition.y - slope * gunTipPosition.x;
        let collision = new Position(-1, -1);
        // check top wall
        let X = (wall.topLeft.y - intercept) / slope;
        if (wall.topLeft.x <= X && wall.bottomRight.x >= X) {
            collision.x = X;
            collision.y = wall.topLeft.y;
        }
        // check bottom wall
        X = (wall.bottomRight.y - intercept) / slope;
        if (wall.topLeft.x <= X && wall.bottomRight.x >= X) {
            if (collision.x === -1) {
                collision.x = X;
                collision.y = wall.bottomRight.y;
            } else {
                let oldDistance = this.lengthSquared(new Vector(gunTipPosition, collision));
                let newDistance = this.lengthSquared(new Vector(gunTipPosition, new Position(X, wall.bottomRight.y)));
                if (newDistance < oldDistance) {
                    collision.x = X;
                    collision.y = wall.bottomRight.y;
                }
            }
        }
        // check left wall
        let Y = wall.topLeft.x * slope + intercept;
        if (wall.topLeft.y <= Y && wall.bottomRight.y >= Y) {
            if (collision.x === -1) {
                collision.x = wall.topLeft.x;
                collision.y = Y;
            } else {
                let oldDistance = this.lengthSquared(new Vector(gunTipPosition, collision));
                let newDistance = this.lengthSquared(new Vector(gunTipPosition, new Position(wall.topLeft.x, Y)));
                if (newDistance < oldDistance) {
                    collision.x = wall.topLeft.x;
                    collision.y = Y;
                }
            }
        }
        // check right wall
        Y = wall.bottomRight.x * slope + intercept;
        if (wall.topLeft.y <= Y && wall.bottomRight.y >= Y) {
            if (collision.x === -1) {
                collision.x = wall.bottomRight.x;
                collision.y = Y;
            } else {
                let oldDistance = this.lengthSquared(new Vector(gunTipPosition, collision));
                let newDistance = this.lengthSquared(new Vector(gunTipPosition, new Position(wall.bottomRight.x, Y)));
                if (newDistance < oldDistance) {
                    collision.x = wall.bottomRight.x;
                    collision.y = Y;
                }
            }
        }
        return collision;
    }

    public shoot(width: number, height: number, enemies: BaseTank[], counter: number, walls: Wall[], wallSize: number) {
        // time check for shooting
        if (counter !== 20) {
            return false;
        }
        let gunTipPosition = this.getBulletPosition();
        let borderTargetPoint = this.borderTargetPoint(width, height);
        let gunSightVector = new Vector(gunTipPosition, clone(borderTargetPoint));
        this.normalize(gunSightVector);
        let bottom = gunTipPosition.y;
        let top = borderTargetPoint.y;
        let right = borderTargetPoint.x;
        let left = gunTipPosition.x;
        if (borderTargetPoint.x < gunTipPosition.x) {
            right = gunTipPosition.x;
            left = borderTargetPoint.x;
        }
        if (borderTargetPoint.y > gunTipPosition.y) {
            bottom = borderTargetPoint.y;
            top = gunTipPosition.y;
        }
        let closestPoint = new Position(0, 0);
        for (let tank of enemies) {
            if (tank.position.x < left) {
                closestPoint.x = left;
            } else if (tank.position.x > right) {
                closestPoint.x = right;
            } else {
                closestPoint.x = tank.position.x;
            }
            if (tank.position.y > bottom) {
                closestPoint.y = bottom;
            } else if (tank.position.y < top) {
                closestPoint.y = top;
            } else {
                closestPoint.y = tank.position.y;
            }
            let distanceToTankSquared = this.lengthSquared(new Vector(closestPoint, tank.position));
            if (distanceToTankSquared > this.radius ** 2) {
                continue;
            }
            let gunToCenterOfTankVector = new Vector(gunTipPosition, tank.position);
            let distanceFromGunToPointClosestToTank = Math.abs(this.dotProduct(gunSightVector, gunToCenterOfTankVector));
            let distanceFromTankCenterToLine = this.lengthSquared(gunToCenterOfTankVector) - distanceFromGunToPointClosestToTank ** 2;
            if (distanceFromTankCenterToLine < tank.radius) {
                // this.bulletsActive += 1;
                let wallInWay = false;
                for (let wall of walls) {
                    let collision = this.checkLineOfSightWallCollision(gunTipPosition, borderTargetPoint, tank.position, wall, wallSize);
                    if (collision.x !== -1) {
                        let gunTipToTankDistance = this.lengthSquared(new Vector(gunTipPosition, tank.position));
                        let gunTipToWallDistance = this.lengthSquared(new Vector(gunTipPosition, collision));
                        if (gunTipToWallDistance < gunTipToTankDistance) {
                            wallInWay = true;
                            break;
                        }
                    }
                }
                if (wallInWay) {
                    continue;
                }
                return true;
            }
        }
        return false;
    }
}