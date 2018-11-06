import { Position } from '../tank';
import { Tank } from '../tank';
import { Level } from './levelClass';
export { level1 };
import { Wall } from '../wall';

let level1 = new Level(
    new Tank('player1', new Position(100, 100), 0, 0, 0, 1),
    new Tank('player2', new Position(100, 300), 0, 0, 1, 1),
    480,
    600,
    [new Tank('brown1', new Position(400, 400), 0, 0, 2, 1)],
    [new Wall(new Position(150, 100)), new Wall(new Position(150, 132)), new Wall(new Position(150, 164)),
        new Wall(new Position(150, 196)), new Wall(new Position(150, 128)), new Wall(new Position(150, 160)),
        new Wall(new Position(150, 192)), new Wall(new Position(150, 224)), new Wall(new Position(150, 256)),
        new Wall(new Position(150, 288)), new Wall(new Position(150, 320)), new Wall(new Position(150, 352)),
        new Wall(new Position(150, 384))]
);