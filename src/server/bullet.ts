import { Position } from './tank';
import { Tank } from './tank';

export class Bullet {
    private id: string;
    private rotation: number;
    public position: Position;
    private type: number;
    public tank: Tank;
    public bounces: number;
    public allowedBounces: number;
    public radius: number;
    public live: number;

    constructor(rotation: number, position: Position, tank: Tank, type: number, id: string) {
        this.rotation = rotation;
        this.position = position;
        this.tank = tank;
        this.type = type;
        this.id = id;
        this.bounces = 0;
        this.radius = 4;
        this.live = 1;
        this.allowedBounces = 1;
    }

    public updatePosition(width: number, height: number) {
        // distance travelled in one update
        let distance = 4;
        this.position.x += Math.cos(this.rotation) * distance;
        this.position.y -= Math.sin(this.rotation) * distance;
    }

    public resolveCollision(width: number, height: number, bullets: Bullet[]) {
        bullets.forEach( bullet => {
            if (bullet !== this && bullet.live === 1) {
                let distance = (this.position.x - bullet.position.x) ** 2 + (this.position.y - bullet.position.y) ** 2;
                if (distance < (bullet.radius + this.radius) ** 2) {
                    this.live = 0;
                    this.tank.bulletsActive -= 1;
                    bullet.live = 0;
                    bullet.tank.bulletsActive -= 1;
                }
            }
        });
        if (this.live === 1) {
            if (this.position.x < 0) {
                this.bounces += 1;
                let newX = -Math.cos(this.rotation);
                let newY = Math.sin(this.rotation);
                this.rotation = Math.atan2(newY, newX);
            } else if (this.position.x > width) { // 
                this.bounces += 1;
                let newX = -Math.cos(this.rotation);
                let newY = Math.sin(this.rotation);
                this.rotation = Math.atan2(newY, newX);
            }
            if (this.position.y < 0) {
                this.bounces += 1;
                let newX = Math.cos(this.rotation);
                let newY = -Math.sin(this.rotation);
                this.rotation = Math.atan2(newY, newX);
            } else if (this.position.y > height) { // 
                this.bounces += 1;
                let newX = Math.cos(this.rotation);
                let newY = -Math.sin(this.rotation);
                this.rotation = Math.atan2(newY, newX);
            }
        }
    }
}