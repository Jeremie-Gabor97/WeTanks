import { clone } from 'lodash';
import { normalize } from 'path';
import { start } from 'repl';
import { Key } from 'ts-key-enum';

export class Tank {
    public id: string;
    public type: number;
    public position: Position;
    public rotationGun: number;
    public rotationBase: number;
    public targetDirectionBase: number;
    public bulletsActive: number;
    public minesActive: number;
    public keysPushed: string[];
    public allowedBounces: number;
    public radius: number;
    public alive: number;
    public prevPosition: Position;

    constructor(id: string, position: Position, rotationGun: number, rotationBase: number, type: number, allowedBounces: number) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.rotationGun = rotationGun;
        this.rotationBase = rotationBase;
        this.targetDirectionBase = 0;
        this.bulletsActive = 0;
        this.minesActive = 0;
        this.keysPushed = [];
        this.allowedBounces = allowedBounces;
        this.radius = 14; // was 16
        this.alive = 1;
        this.prevPosition = position;
    }

    private getRadians (directions: string[]) {
        if (directions.length === 0) {
            return this.rotationBase;
        }
        if (directions.length === 1) {
            switch (directions[0]) {
                case Key.ArrowRight:
                     return 0;
                case Key.ArrowLeft:
                    return Math.PI;
                case Key.ArrowDown:
                    return -(Math.PI / 2);
                default:
                    return Math.PI / 2;
            }
        } else {
            if ((directions[0] === Key.ArrowDown && directions[1] === Key.ArrowLeft) ||
                 (directions[0] === Key.ArrowLeft && directions[1] === Key.ArrowDown)) {
                return -( Math.PI * 3 / 4);
            } else if ((directions[0] === Key.ArrowDown && directions[1] === Key.ArrowRight) ||
                 (directions[0] === Key.ArrowRight && directions[1] === Key.ArrowDown)) {
                return -( Math.PI * 1 / 4);
            } else if ((directions[0] === Key.ArrowUp && directions[1] === Key.ArrowRight) ||
                 (directions[0] === Key.ArrowRight && directions[1] === Key.ArrowUp)) {
                return Math.PI / 4;
            } else if ((directions[0] === Key.ArrowUp && directions[1] === Key.ArrowLeft) ||
            (directions[0] === Key.ArrowLeft && directions[1] === Key.ArrowUp)) {
                return Math.PI * 3 / 4;
            }
        }
    }

    private isCompatible(firstDir: string, secondDir: string) {
        if (firstDir === Key.ArrowLeft && secondDir === Key.ArrowRight) {
            return false;
        } else if (firstDir === Key.ArrowRight && secondDir === Key.ArrowLeft) {
            return false;
        } else if (firstDir === Key.ArrowUp && secondDir === Key.ArrowDown) {
            return false;
        } else if (firstDir === Key.ArrowDown && secondDir === Key.ArrowUp) {
            return false;
        } else {
            return true;
        }
    }

    private getApplicableDirections() {
        if (this.keysPushed.length === 0) {
            return [];
        }
        let firstDirection = this.keysPushed[0];
        let index = 1;
        while (index < this.keysPushed.length) {
            if (this.isCompatible(firstDirection, this.keysPushed[index])) {
                return [firstDirection, this.keysPushed[index]];
            }
            index += 1;
        }
        return [firstDirection];

    }

    public setTargetDirection() {
        let applicableDirections = this.getApplicableDirections();
        this.targetDirectionBase = this.getRadians(applicableDirections);
    }

    private normalizeRad(radians: number) {
        while (radians >= 2 * Math.PI || radians < 0) {
            if (radians >= 2 * Math.PI) {
                radians -= 2 * Math.PI;
            } else if (radians < 0) {
                radians += 2 * Math.PI;
            }
        }
        return radians;
    }

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
        // distance travelled in one update
        let distance = 2;
        this.position.x += Math.cos(this.rotationBase) * distance;
        this.position.y -= Math.sin(this.rotationBase) * distance;
    }

    public getBulletPosition() {
        let distanceAway = 20;
        let currPosition = clone(this.position);
        currPosition.x += distanceAway * Math.cos(this.rotationGun);
        currPosition.y -= distanceAway * Math.sin(this.rotationGun);
        return currPosition;
    }

    private normalize(vector: Vector) {
        let length = Math.sqrt((vector.end.x - vector.beg.x) ** 2 + (vector.end.y - vector.beg.y) ** 2);
        if (length > 0) {
            vector.end.x = vector.beg.x + (vector.end.x - vector.beg.x) / length;
            vector.end.y = vector.beg.y + (vector.end.y - vector.beg.y) / length;
        }
    }

    private dotProduct(first: Vector, second: Vector) {
        return (first.end.x - first.beg.x) * (second.end.x - second.beg.x)
                 + (first.end.y - first.beg.y) * (second.end.y - second.beg.y);
    }

    private lengthSquared(vector: Vector) {
        return (vector.end.x - vector.beg.x) ** 2 + (vector.end.y - vector.beg.y) ** 2;
    }

    public detectCollison(width: number, height: number, otherTanks: Tank[]) {
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
    }
}

class Vector {
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