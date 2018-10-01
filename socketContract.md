Server sends:
- 'update'
    - tanks: Tank[]
    - bullets: Bullet[]

- 'levelEnd'

- 'levelStart'
    - redTank: coordinates;
    - blueTank: coordinates;
    - tanks: TankInfo[];
    - walls: WallInfo[];
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

Client sends:
- 'key'
    - key: string
    - isDown: boolean

- 'rotation'
    - angle: number;

- 'click'
    - position: Position;
    - button: number;


Structures:

Tank
    - id: string;
    - position: Position
    - rotation: number;

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