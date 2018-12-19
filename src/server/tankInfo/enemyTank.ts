import { clone } from 'lodash';
import { BulletCollision } from '../bulletInfo/bulletCollision';
import { Wall } from '../wall';
import { Position } from './baseTank';
import { Vector } from './baseTank';
import { BaseTank } from './baseTank';
import { IConstructorTankObjectInterface } from './constructorTankObjectInterface';

// this tank doesnt move just shoots towards opponent

export abstract class EnemyTank extends BaseTank {
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
    // the bulletPosition parameter takes in the result of getBulletPosition
    public borderTargetPoint(width: number, height: number, bulletPosition: Position, bulletOrientation: number) {
        let directionContact = 'up';
        // let bulletPosition = this.getBulletPosition();
        let borderTarget = clone(bulletPosition);
        if (bulletOrientation >= 0 && bulletOrientation < Math.PI / 2) {
            let X = width - bulletPosition.x;
            let Y = Math.abs(Math.tan(bulletOrientation) * (width - X));
            if (bulletPosition.y < Y) {
                directionContact = 'up';
                borderTarget.y = 0;
                borderTarget.x += bulletPosition.y / Math.abs(Math.tan(bulletOrientation));
            } else {
                directionContact = 'right';
                borderTarget.x = width;
                borderTarget.y -= Y;
            }
        } else if (bulletOrientation >= Math.PI / 2 && bulletOrientation < Math.PI) {
            let X = bulletPosition.x;
            let Y = Math.abs(Math.tan(this.rotationGun) * X);
            if (bulletPosition.y < Y) {
                directionContact = 'up';
                borderTarget.y = 0;
                borderTarget.x -= bulletPosition.y / Math.abs(Math.tan(bulletOrientation));
            } else {
                directionContact = 'left';
                borderTarget.x = 0;
                borderTarget.y -= Y;
            }
        } else if (bulletOrientation >= Math.PI && bulletOrientation < 3 * Math.PI / 2) {
            let X = bulletPosition.x;
            let Y = Math.abs(Math.tan(bulletOrientation) * X);
            if (height - bulletPosition.y < Math.abs(Y)) {
                directionContact = 'down';
                borderTarget.y = height;
                borderTarget.x -= (height - bulletPosition.y) / Math.abs(Math.tan(bulletOrientation));
            } else {
                directionContact = 'left';
                borderTarget.x = 0;
                borderTarget.y += Y;
            }
        } else {
            let X = bulletPosition.x;
            let Y = Math.abs(Math.tan(bulletOrientation) * (width - X));
            if (height - bulletPosition.y < Math.abs(Y)) {
                directionContact = 'down';
                borderTarget.y = height;
                borderTarget.x += (height - bulletPosition.y) / Math.abs(Math.tan(bulletOrientation));
            } else {
                directionContact = 'right';
                borderTarget.x = width;
                borderTarget.y += Y;
            }
        }
        return new BulletCollision(borderTarget, directionContact);
    }

    public checkLineOfSightWallCollision(gunTipPosition: Position, borderTargetPoint: Position, wall: Wall) {
        let slope = (gunTipPosition.y - borderTargetPoint.y) / (gunTipPosition.x - borderTargetPoint.x);
        let intercept = gunTipPosition.y - slope * gunTipPosition.x;
        let collision = new Position(-1, -1);
        let directionWhenMadeContact = '';
        // check top wall
        let X = (wall.topLeft.y - intercept) / slope;
        if (wall.topLeft.x <= X && wall.bottomRight.x >= X) {
            collision.x = X;
            collision.y = wall.topLeft.y;
            directionWhenMadeContact = 'down';
        }
        // check bottom wall
        X = (wall.bottomRight.y - intercept) / slope;
        if (wall.topLeft.x <= X && wall.bottomRight.x >= X) {
            if (collision.x === -1) {
                collision.x = X;
                collision.y = wall.bottomRight.y;
                directionWhenMadeContact = 'up';
            } else {
                let oldDistance = this.lengthSquared(new Vector(gunTipPosition, collision));
                let newDistance = this.lengthSquared(new Vector(gunTipPosition, new Position(X, wall.bottomRight.y)));
                if (newDistance < oldDistance) {
                    collision.x = X;
                    collision.y = wall.bottomRight.y;
                    directionWhenMadeContact = 'up';
                }
            }
        }
        // check left wall
        let Y = wall.topLeft.x * slope + intercept;
        if (wall.topLeft.y <= Y && wall.bottomRight.y >= Y) {
            if (collision.x === -1) {
                collision.x = wall.topLeft.x;
                collision.y = Y;
                directionWhenMadeContact = 'right';
            } else {
                let oldDistance = this.lengthSquared(new Vector(gunTipPosition, collision));
                let newDistance = this.lengthSquared(new Vector(gunTipPosition, new Position(wall.topLeft.x, Y)));
                if (newDistance < oldDistance) {
                    collision.x = wall.topLeft.x;
                    collision.y = Y;
                    directionWhenMadeContact = 'right';
                }
            }
        }
        // check right wall
        Y = wall.bottomRight.x * slope + intercept;
        if (wall.topLeft.y <= Y && wall.bottomRight.y >= Y) {
            if (collision.x === -1) {
                collision.x = wall.bottomRight.x;
                collision.y = Y;
                directionWhenMadeContact = 'left';
            } else {
                let oldDistance = this.lengthSquared(new Vector(gunTipPosition, collision));
                let newDistance = this.lengthSquared(new Vector(gunTipPosition, new Position(wall.bottomRight.x, Y)));
                if (newDistance < oldDistance) {
                    collision.x = wall.bottomRight.x;
                    collision.y = Y;
                    directionWhenMadeContact = 'left';
                }
            }
        }
        return new BulletCollision(collision, directionWhenMadeContact);
    }

    public directLineOfSightToShoot(width: number, height: number, enemies: BaseTank[], walls: Wall[],
                                    wallSize: number, bulletPosition: Position, bulletOrientation: number) {
        // let gunTipPosition = this.getBulletPosition();
        let borderTargetPoint = this.borderTargetPoint(width, height, bulletPosition, bulletOrientation);
        let pointOfContact = borderTargetPoint.pointOfContact;
        let gunSightVector = new Vector(bulletPosition, clone(pointOfContact));
        this.normalize(gunSightVector);
        let bottom = bulletPosition.y;
        let top = pointOfContact.y;
        let right = pointOfContact.x;
        let left = bulletPosition.x;
        if (pointOfContact.x < bulletPosition.x) {
            right = bulletPosition.x;
            left = pointOfContact.x;
        }
        if (pointOfContact.y > bulletPosition.y) {
            bottom = pointOfContact.y;
            top = bulletPosition.y;
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
            let gunToCenterOfTankVector = new Vector(bulletPosition, tank.position);
            let distanceFromGunToPointClosestToTank = Math.abs(this.dotProduct(gunSightVector, gunToCenterOfTankVector));
            let distanceFromTankCenterToLine = this.lengthSquared(gunToCenterOfTankVector) - distanceFromGunToPointClosestToTank ** 2;
            if (distanceFromTankCenterToLine < tank.radius) {
                let wallInWay = false;
                for (let wall of walls) {
                    let collisionStruct = this.checkLineOfSightWallCollision(bulletPosition, pointOfContact, wall);
                    let collisionPoint = collisionStruct.pointOfContact;
                    if (collisionPoint.x !== -1) {
                        let gunTipToTankDistance = this.lengthSquared(new Vector(bulletPosition, tank.position));
                        let gunTipToWallDistance = this.lengthSquared(new Vector(bulletPosition, collisionPoint));
                        if (gunTipToWallDistance < gunTipToTankDistance) {
                            wallInWay = true;
                            console.log('wall in way');
                            break;
                        }
                    }
                }
                if (wallInWay) {
                    continue;
                }
                console.log('shooooot!!');
                return true;
            }
        }
        return false;
    }

// have collision return point of contact but also direction of collision if it was up, down...

    public firstPointOfContact(width: number, height: number, walls: Wall[], bulletPosition: Position, bulletOrientation: number) {
        // first goal is to find first point of contact, be it wall or boundary
        // let gunTipPosition = this.getBulletPosition();
        let borderTargetPoint = this.borderTargetPoint(width, height, bulletPosition, bulletOrientation);
        let pointOfContact = borderTargetPoint.pointOfContact;
        let gunSightVector = new Vector(bulletPosition, clone(pointOfContact));
        let distanceToBoundary = this.lengthSquared(gunSightVector);
        let distanceToShortestPointOfContact = distanceToBoundary;
        let positionOfShortestPointOfContact = clone(borderTargetPoint.pointOfContact);
        let directionOfShortestPointOfContact = borderTargetPoint.directionOfBulletWhenMadeContact;
        this.normalize(gunSightVector);
        for (let wall of walls) {
            let collisionStruct = this.checkLineOfSightWallCollision(bulletPosition, pointOfContact, wall);
            let pointOfCollision = collisionStruct.pointOfContact;
            if (pointOfCollision.x !== -1) {
                let gunTipToWallDistance = this.lengthSquared(new Vector(bulletPosition, pointOfCollision));
                if (gunTipToWallDistance < distanceToBoundary) {
                    distanceToBoundary = gunTipToWallDistance;
                    positionOfShortestPointOfContact = clone(collisionStruct.pointOfContact);
                    directionOfShortestPointOfContact = collisionStruct.directionOfBulletWhenMadeContact;
                }
            }
        }
        return new BulletCollision(positionOfShortestPointOfContact, directionOfShortestPointOfContact);
    }

    // check rotation of gun!!!!!!!!!!!!!!!!!!!!!!!
    public bounceShoot(width: number, height: number, enemies: BaseTank[],
                       walls: Wall[], wallSize: number, bulletPosition: Position, bulletOrientation: number) {
        let firstPointOfContactStruct = this.firstPointOfContact(width, height, walls, bulletPosition, bulletOrientation);
        let newBulletOrientation = bulletOrientation;
        // depending if bounce up down or sideways have to do something different
        // left
        switch (firstPointOfContactStruct.directionOfBulletWhenMadeContact) {
            case 'left': {
                let newX = -Math.cos(bulletOrientation);
                let newY = Math.sin(bulletOrientation);
                newBulletOrientation = Math.atan2(newY, newX);
                break;
            }
            case 'right': {
                let newX = -Math.cos(bulletOrientation);
                let newY = Math.sin(bulletOrientation);
                newBulletOrientation = Math.atan2(newY, newX);        
                break;
            }
            case 'down': {
                let newX = -Math.cos(bulletOrientation);
                let newY = Math.sin(bulletOrientation);
                newBulletOrientation = Math.atan2(newY, newX);        
                break;
            }
            default: {
                let newX = Math.cos(bulletOrientation);
                let newY = -Math.sin(bulletOrientation);
                newBulletOrientation = Math.atan2(newY, newX);               
            }
        }
        if (this.directLineOfSightToShoot(width, height, enemies, walls, wallSize, firstPointOfContactStruct.pointOfContact, newBulletOrientation)) {
            return true;
        }
    }

    abstract shoot(width: number, height: number, enemies: BaseTank[], walls: Wall[], wallSize: number): boolean;
}