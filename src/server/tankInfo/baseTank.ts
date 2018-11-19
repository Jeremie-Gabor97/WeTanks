import { clone } from 'lodash';
import { normalize } from 'path';
import { start } from 'repl';
import { Key } from 'ts-key-enum';
import { Wall } from '../wall';
import { IConstructorTankObjectInterface } from './constructorTankObjectInterface';

export abstract class BaseTank {
    public id: string;
    public type: number;
    public position: Position;
    public rotationGun: number;
    public rotationBase: number;
    public targetDirectionBase: number;
    public bulletsActive: number;
    public allowedBulletsActive: number;
    public minesActive: number;
    public keysPushed: string[];
    public allowedBounces: number;
    public radius: number;
    public alive: number;
    public prevPosition: Position;
    public speed: number;
    public turretRotationSpeed: number;

    constructor(constructorObj: IConstructorTankObjectInterface) {
        this.id = constructorObj.id;
        this.type = constructorObj.type;
        this.position = constructorObj.position;
        this.rotationGun = constructorObj.rotationGun;
        this.rotationBase = constructorObj.rotationBase;
        this.targetDirectionBase = constructorObj.targetDirectionBase;
        this.bulletsActive = 0;
        this.allowedBulletsActive = constructorObj.allowedBulletsActive;
        this.minesActive = 0;
        this.keysPushed = [];
        this.allowedBounces = constructorObj.allowedBounces;
        this.radius = 14;
        this.alive = 1;
        this.prevPosition = constructorObj.position;
        this.speed = constructorObj.speed;
        this.turretRotationSpeed = 1;
    }

    public setTargetDirection() {
        // TODO
    }

    public normalizeRad(radians: number) {
        while (radians >= 2 * Math.PI || radians < 0) {
            if (radians >= 2 * Math.PI) {
                radians -= 2 * Math.PI;
            } else if (radians < 0) {
                radians += 2 * Math.PI;
            }
        }
        return radians;
    }

    abstract adjustGunOrientation(): void;

    abstract shoot(width: number, height: number, enemies: BaseTank[], counter: number): void;

    public adjustBaseOrientation() {
        let orientationChange = 2;
        let normalizedRotationBase = this.normalizeRad(this.rotationBase);
        let normalizedTargetDirectionBase = this.normalizeRad(this.targetDirectionBase);
        if (normalizedTargetDirectionBase > normalizedRotationBase) {
            let diff = normalizedTargetDirectionBase - normalizedRotationBase;
            if (diff < Math.PI) {
                this.rotationBase += orientationChange * (Math.PI / 180);        
            } else {
                this.rotationBase -= orientationChange * (Math.PI / 180);        
            }
        } else {
            let diff = normalizedRotationBase - normalizedTargetDirectionBase;
            if (diff < Math.PI) {
                this.rotationBase -= orientationChange * (Math.PI / 180);        
            } else {
                this.rotationBase += orientationChange * (Math.PI / 180);        
            }
        }
        while (this.rotationBase > Math.PI || this.rotationBase < -Math.PI) {
            if (this.rotationBase > Math.PI) {
                this.rotationBase -= 2 * Math.PI;
            } else if (this.rotationBase < -Math.PI) {
                this.rotationBase += 2 * Math.PI;
            }
        }
    }

    public updatePosition(width: number, height: number) {
        this.position.x += Math.cos(this.rotationBase) * this.speed;
        this.position.y -= Math.sin(this.rotationBase) * this.speed;
    }

    // returns the position of the tip of the gun
    public getBulletPosition() {
        let distanceAway = 20;
        let currPosition = clone(this.position);
        currPosition.x += distanceAway * Math.cos(this.rotationGun);
        currPosition.y -= distanceAway * Math.sin(this.rotationGun);
        return currPosition;
    }

    // sets vector length to 1
    public normalize(vector: Vector) {
        let length = Math.sqrt((vector.end.x - vector.beg.x) ** 2 + (vector.end.y - vector.beg.y) ** 2);
        if (length > 0) {
            vector.end.x = vector.beg.x + (vector.end.x - vector.beg.x) / length;
            vector.end.y = vector.beg.y + (vector.end.y - vector.beg.y) / length;
        }
    }

    public dotProduct(first: Vector, second: Vector) {
        return (first.end.x - first.beg.x) * (second.end.x - second.beg.x)
                 + (first.end.y - first.beg.y) * (second.end.y - second.beg.y);
    }

    // returns the length squared of the vector
    public lengthSquared(vector: Vector) {
        return (vector.end.x - vector.beg.x) ** 2 + (vector.end.y - vector.beg.y) ** 2;
    }

    // detect Collision between tank and boundary wall, other thanks, block walls
    public detectCollison(width: number, height: number, otherTanks: BaseTank[], walls: Wall[], wallSize: number) {
        // checking wall collisions
        if (this.position.x < 16) {
            this.position.x = 16;
        } else if (this.position.x > width - 16) {
            this.position.x = width - 16;
        }
        if (this.position.y < 16) {
            this.position.y = 16;
        } else if (this.position.y > height - 16) {
            this.position.y = height - 16;
        }
        if (this.position.x === this.prevPosition.x && this.position.y === this.prevPosition.y) {
            return;
        }
        // checking tank vs tank collisions (circle vs circle)
        otherTanks.forEach( tank => {
            if (this === tank || tank.alive === 0) {
                return;
            }
            let centerToCenterVector = new Vector(this.prevPosition, tank.prevPosition);
            let movementVector = new Vector(this.prevPosition,
                 new Position(this.position.x - (tank.position.x - tank.prevPosition.x), this.position.y - (tank.position.y - tank.prevPosition.y)));
            let movementVectorMagnitude = Math.sqrt(this.lengthSquared(movementVector));
            if (movementVectorMagnitude < (Math.sqrt(this.lengthSquared(centerToCenterVector)) - (this.radius + tank.radius))) {
                return;
            }
            this.normalize(movementVector);
            let D = this.dotProduct(movementVector, centerToCenterVector);
            if (D <= 0) {
                return;
            }
            let shortestDistanceSquared = this.lengthSquared(centerToCenterVector) - D ** 2;
            if (shortestDistanceSquared > (this.radius + tank.radius) ** 2) {
                return;
            }
            let T = (this.radius + tank.radius) ** 2 - shortestDistanceSquared;
            if (T < 0) {
                return;
            }
            let distanceToTravel = D - Math.sqrt(T);
            let ratioToTravel = distanceToTravel / D;
            if (movementVectorMagnitude < distanceToTravel) {
                return;
            }
            this.position.x = this.prevPosition.x + (this.position.x - this.prevPosition.x) * ratioToTravel;
            this.position.y = this.prevPosition.y + (this.position.y - this.prevPosition.y) * ratioToTravel;
            tank.position.x = tank.prevPosition.x + (tank.position.x - tank.prevPosition.x) * ratioToTravel;
            tank.position.y = tank.prevPosition.y + (tank.position.y - tank.prevPosition.y) * ratioToTravel;
        });

        // checking tank vs wall collisions (square vs circle)
        for (let wall of walls) {
            let closestPoint = new Position(0, 0);
            
            // find the closest point on the square to the center of the circle (the tank)
            if (this.position.x < wall.position.x - wallSize / 2) {
                closestPoint.x = wall.position.x - wallSize / 2;
            } else if (this.position.x > wall.position.x + wallSize / 2) {
                closestPoint.x = wall.position.x + wallSize / 2;
            } else {
                closestPoint.x = this.position.x;
            }
            if (this.position.y < wall.position.y - wallSize / 2) {
                closestPoint.y = wall.position.y - wallSize / 2;
            } else if (this.position.y > wall.position.y + wallSize / 2) {
                closestPoint.y = wall.position.y + wallSize / 2;
            } else {
                closestPoint.y = this.position.y;
            }
            // distance from closest point on square to center of tank
            let distanceSquared = this.lengthSquared(new Vector(closestPoint, this.position));
            if (distanceSquared > this.radius ** 2) {
                continue;
            }
            // if distanceSquared is greater than radius squared, there is a collision
            // variables we use often
            let L = wall.position.x - wallSize / 2;
            let T = wall.position.y - wallSize / 2;
            let R = wall.position.x + wallSize / 2;
            let B = wall.position.y + wallSize / 2;
            let dx = this.position.x - this.prevPosition.x;
            let dy = this.position.y - this.prevPosition.y;

            // calculating intersection times with each sides plane
            let ltime = Number.MAX_VALUE;
            let rtime = Number.MAX_VALUE;
            let ttime = Number.MAX_VALUE;
            let btime = Number.MAX_VALUE;
            if (this.prevPosition.x - this.radius < L && this.position.x + this.radius > L) {
                ltime = ((L - this.radius) - this.prevPosition.x) / dx;
            }
            if (this.prevPosition.x + this.radius > R && this.position.x - this.radius < R) {
                rtime = (this.prevPosition.x - (R + this.radius)) / -dx;
            }
            if (this.prevPosition.y - this.radius < T && this.position.y + this.radius > T) {
                ttime = ((T - this.radius) - this.prevPosition.y) / dy;
            }
            if (this.prevPosition.y + this.radius > B && this.position.y - this.radius < B) {
                btime = (this.prevPosition.y - (B + this.radius)) / -dy;
            }

            if (ltime >= 0.0 && ltime <= 1.0) {
                let ly = dy * ltime + this.prevPosition.y;
                if (ly >= T && ly <= B) {
                   this.position.x = dx * ltime + this.prevPosition.x;
                   this.position.y = ly;
                   continue;
                }
            }
            else if (rtime >= 0.0 && rtime <= 1.0) {
                let ry = dy * rtime + this.prevPosition.y;
                if (ry >= T && ry <= B) {
                   this.position.x = dx * rtime + this.prevPosition.x;
                   this.position.y = ry;
                   continue;
                }
            }

            if (ttime >= 0.0 && ttime <= 1.0) {
                let tx = dx * ttime + this.prevPosition.x;
                if (tx >= L && tx <= R) {
                   this.position.x = tx;
                   this.position.y = dy * ttime + this.prevPosition.y;
                   continue;
                }
            }
             else if (btime >= 0.0 && btime <= 1.0) {
                let bx = dx * btime + this.prevPosition.x;
                if (bx >= L && bx <= R) {
                   this.position.x = bx;
                   this.position.y = dy * btime + this.prevPosition.y;
                   continue;
                }
            }

            let cornerX = Number.MAX_VALUE;
            let cornerY = Number.MAX_VALUE;
            if (ltime !== Number.MAX_VALUE) {
                cornerX = L;
            } else if (rtime !== Number.MAX_VALUE) {
                cornerX = R;
            }
            if (ttime !== Number.MAX_VALUE) {
                cornerY = T;
            } else if ( btime !== Number.MAX_VALUE) {
                cornerY = B;
            }
            // Account for time where we dont pass over a size but we do hit its corner
            if (cornerX !== Number.MAX_VALUE && cornerY === Number.MAX_VALUE) {
                cornerY = dy > 0.0 ? B : T;
            }
            if (cornerY !== Number.MAX_VALUE && cornerX === Number.MAX_VALUE) {
                cornerX = dx > 0.0 ? R : L;
            }
            let inverseRadius = 1 / this.radius;
            let lineLength = Math.sqrt( dx * dx + dy * dy);
            let cornerdx = cornerX - this.prevPosition.x;
            let cornerdy = cornerY - this.prevPosition.y;
            let cornerdist = Math.sqrt( cornerdx ** 2 + cornerdy ** 2);
            let innerAngle = Math.acos( ( cornerdx * dx + cornerdy * dy) / (lineLength * cornerdist) );
            let innerAngleSin = Math.sin(innerAngle);
            let angle1Sin = innerAngleSin * cornerdist * inverseRadius;

            // if the angle is too large,there cannot be an intersection
            if (Math.abs( angle1Sin ) > 1.0) {
                break;
            }
            let angle1 = Math.PI - Math.asin(angle1Sin);
            let angle2 = Math.PI - innerAngle - angle1;
            let intersectionDistance = this.radius * Math.sin(angle2) / innerAngleSin;
            let time = intersectionDistance / lineLength;
            // if time is outside the boundaries, return null.
            if (time <= 1 || time >= 0) {
                // solve for the intersection
                let ix = time * dx + this.prevPosition.x;
                let iy = time * dy + this.prevPosition.y;
                this.position.x = ix;
                this.position.y = iy;
            }
        }
    }
}

export class Vector {
    public beg: Position;
    public end: Position;

    constructor(beg: Position, end: Position) {
        this.beg = beg;
        this.end = end;
    }
}

export class Position {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}