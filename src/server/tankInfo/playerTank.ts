import { Key } from 'ts-key-enum';
import { Wall } from '../wall';
import { BaseTank } from './baseTank';
import { IConstructorTankObjectInterface } from './constructorTankObjectInterface';

export class PlayerTank extends BaseTank {
    constructor(constructorObj: IConstructorTankObjectInterface) { super(constructorObj); }

    // takes in an array of directions and returns the corresponding direction
    // so for eg: up right, is something like PI/2 rad
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

    // takes in to directions, eg: up, right and says if they are compatible
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

    // for example if up and down are pushed, ony one can be applied
    // this returns the applicable ones
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

    // this is whats called if a key is pressed or released
    public setTargetDirection() {
        let applicableDirections = this.getApplicableDirections();
        this.targetDirectionBase = this.getRadians(applicableDirections);
    }

    public adjustGunOrientation() {
        // rotation
        if (Math.abs( this.targetDirectionBase - this.rotationBase) > Math.PI / 180) {
            this.adjustBaseOrientation();
        }
    }

    public shoot(width: number, height: number, enemies: BaseTank[], walls: Wall[], wallSize: number) {
        this.bulletsActive += 1;
        return false;
    }
}