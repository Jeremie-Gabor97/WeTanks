import { BaseTank } from '../tankInfo/baseTank';
import { Position } from '../tankInfo/baseTank';
import { IConstructorTankObjectInterface } from '../tankInfo/constructorTankObjectInterface';
import { Level } from './levelClass';
export { level1 };
import { PlayerTank } from '../tankInfo/playerTank';
import { Wall } from '../wall';

let level1 = new Level(
    new PlayerTank({id: 'player1', position: new Position(100, 100), rotationGun: 0,
     rotationBase: 0, type: 0, allowedBounces: 1, allowedBulletsActive: 5, targetDirectionBase: 0, speed: 2}),
    new PlayerTank({id: 'player2', position: new Position(100, 300), rotationGun: 0,
     rotationBase: 0, type: 1, allowedBounces: 1, allowedBulletsActive: 5, targetDirectionBase: 0, speed: 2}),
    480,
    600,
    [new BaseTank({id: 'brown1', position: new Position(400, 400), rotationGun: 0,
     rotationBase: 0, type: 2, allowedBounces: 1, allowedBulletsActive: 5, targetDirectionBase: 0, speed: 2})],
    [new Wall(new Position(150, 100)), new Wall(new Position(150, 132)), new Wall(new Position(150, 164)),
        new Wall(new Position(150, 196)), new Wall(new Position(150, 128)), new Wall(new Position(150, 160)),
        new Wall(new Position(150, 192)), new Wall(new Position(150, 224)), new Wall(new Position(150, 256)),
        new Wall(new Position(150, 288)), new Wall(new Position(150, 320)), new Wall(new Position(150, 352)),
        new Wall(new Position(150, 384))]
);