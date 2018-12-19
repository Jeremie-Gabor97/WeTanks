import { Position } from '../tankInfo/baseTank';

export class BulletCollision {
    public pointOfContact: Position;
    public directionOfBulletWhenMadeContact: string;

    constructor(pointOfContact: Position, directionOfBulletWhenMadeContact: string) {
        this.pointOfContact = pointOfContact;
        this.directionOfBulletWhenMadeContact = directionOfBulletWhenMadeContact;
    }
}

// export type BulletDirectionTypes = 'up' | 'down' | 'right' | 'left';