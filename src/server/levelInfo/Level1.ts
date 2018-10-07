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
    [new Wall(new Position(20, 20)), new Wall(new Position(40, 20)), new Wall(new Position(60, 20)),
        new Wall(new Position(80, 7)), new Wall(new Position(200, 8)), new Wall(new Position(220, 9)),
        new Wall(new Position(100, 10)), new Wall(new Position(180, 11)), new Wall(new Position(240, 12)),
        new Wall(new Position(120, 13)), new Wall(new Position(160, 14)), new Wall(new Position(260, 15)),
        new Wall(new Position(140, 16))]
);