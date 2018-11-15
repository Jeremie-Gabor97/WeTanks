import { Position } from './baseTank';

export interface IConstructorTankObjectInterface {
    id: string;
    position: Position;
    rotationGun: number;
    rotationBase: number;
    type: number;
    allowedBounces: number;
    allowedBulletsActive: number;
    targetDirectionBase: number;
    speed: number;
 }