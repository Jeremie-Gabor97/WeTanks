Server sends:
- 'update'
    - tanks: Tank[]
    - bullets: Bullet[]

- 'levelEnd'

- 'levelStart'
    - tanks: Tank[];
    - walls: Position[];
    - height: number;
    - width: number;

- 'loseGame'

- 'mineCreated'
    - id: string;
    - position: Position;
- 'mineExpiring'
    - id: string;
- 'mineDestroyed'
    - id: string;

- 'playerId'
    - id: string;

Client sends:
- 'key'
    - key: string
    - isDown: boolean

- 'rotation'
    - angle: number;

- 'click'
    - button: number;


Structures:

Tank
    - id: string;
    - position: Position;
    - rotationBase: number;
    - rotationGun: number;

Bullet
    - id: string;
    - position: Position;
    - rotation: number;
    - type: number;

TankInfo
    - id: string;
    - position: Position;
    - rotation: number;
    - type: number;

WallInfo
    - position: Position;