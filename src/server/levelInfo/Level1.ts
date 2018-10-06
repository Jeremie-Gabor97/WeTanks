import { Position } from '../tank';
import { Tank } from '../tank';
import { Level } from './levelClass';
export { level1 };

let level1 = new Level(
    new Tank('player1', new Position(2, 5), 90, 90, 'red'),
    new Tank('player2', new Position(2, 15), 90, 90, 'blue'),
    20,
    20,
    [new Tank('brown1', new Position(17, 10), 270, 270, 'brown')],
    [new Position(7, 4), new Position(7, 5), new Position(7, 6),
        new Position(7, 7), new Position(7, 8), new Position(7, 9),
        new Position(7, 10), new Position(7, 11), new Position(7, 12),
        new Position(7, 13), new Position(7, 14), new Position(7, 15),
        new Position(7, 16)]
);