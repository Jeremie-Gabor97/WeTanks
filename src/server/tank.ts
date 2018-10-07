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

    constructor(id: string, position: Position, rotationGun: number, rotationBase: number, type: number) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.rotationGun = rotationGun;
        this.rotationBase = rotationBase;
        this.targetDirectionBase = 0;
        this.bulletsActive = 0;
        this.minesActive = 0;
    }

    private getDegrees(direction: string) {
        switch (direction) {
            case Key.ArrowRight:
                return 0;
            case Key.ArrowLeft:
                return 180;
            case Key.ArrowDown:
                return 270;
            default:
                return 90;
        }
    }

    private getRadians (direction: string) {
        switch (direction) {
            case Key.ArrowRight:
                return 0;
            case Key.ArrowLeft:
                return Math.PI;
            case Key.ArrowDown:
                return -(Math.PI / 2);
            default:
                return Math.PI / 2;
        }
    }

    private degreesToRadians (degrees: number) {
        let rad = degrees * Math.PI / 180;
        // make sure rad value is between -pi and +pi
        if (rad > Math.PI) {
            return rad - 2 * Math.PI;
        } else if (rad < -Math.PI) {
            return rad + 2 * Math.PI;
        } else {
            return rad;
        }
    }

    public setTargetDirection() {
        if (this.keysPushed.length === 0) {
            this.targetDirectionBase = this.rotationBase;
        } else if (this.keysPushed.length === 1) {
            this.targetDirectionBase = this.getRadians(this.keysPushed[0]);
        } else {
            let firstDirection = this.getDegrees(this.keysPushed[0]);
            let secondDirection = this.getDegrees(this.keysPushed[1]);
            if (secondDirection - firstDirection === 180 || secondDirection - firstDirection === -180) {
                // if diretions are opposite directions, just use latest one pushed
                if (this.keysPushed.length > 2) {
                    // if 3 keys or more and 1st and second are opposite, third is guaranteed not to be opposite from first
                    this.targetDirectionBase = this.degreesToRadians((firstDirection + this.getDegrees(this.keysPushed[2])) / 2);
                } else {
                    // if only two keys and are opposite, just use most latest one
                    this.targetDirectionBase = this.getRadians(this.keysPushed[0]);
                }
            } else {
                // if first and second are not opposite from each other, use the first two
                this.targetDirectionBase = this.degreesToRadians((firstDirection + secondDirection) / 2);
            }
        }
    }

    public adjustBaseOrientation() {
        this.rotationBase += Math.PI / 180;
    }
}

export class Position {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}