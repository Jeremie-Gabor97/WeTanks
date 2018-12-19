import { Position } from '../tankInfo/baseTank';
import { BaseTank } from '../tankInfo/baseTank';
import { Wall } from '../wall';

export class Bullet {
    private id: string;
    private rotation: number;
    public position: Position;
    public prevPosition: Position;
    private type: number;
    public tank: BaseTank;
    public bounces: number;
    public allowedBounces: number;
    public radius: number;
    public live: number;

    constructor(rotation: number, position: Position, tank: BaseTank, type: number, id: string) {
        this.rotation = rotation;
        this.position = position;
        this.prevPosition = new Position(position.x, position.y);
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
        this.prevPosition.x = this.position.x;
        this.prevPosition.y = this.position.y;
        this.position.x += Math.cos(this.rotation) * distance;
        this.position.y -= Math.sin(this.rotation) * distance;
    }

    public resolveCollision(width: number, height: number, bullets: Bullet[], walls: Wall[], wallSize: number) {
        let bounced = false;
        let bounceCount = 0;
        bullets.forEach( bullet => {
            if (bullet !== this && bullet.live === 1 && this.live === 1) {
                let distance = (this.position.x - bullet.position.x) ** 2 + (this.position.y - bullet.position.y) ** 2;
                if (distance < (bullet.radius + this.radius) ** 2) {
                    this.live = 0;
                    this.tank.bulletsActive -= 1;
                    bullet.live = 0;
                    bullet.tank.bulletsActive -= 1;
                }
            }
        });
        for ( let wall of walls) {
            if (bounceCount > 0) {
                continue;
            }
            let closestPoint = new Position(0, 0);
            
            // find the closest point on the square to the center of the circle (the tank)
            if (this.position.x < wall.position.x - wallSize / 2) {
                closestPoint.x = wall.position.x - wallSize / 2;
            } else if (this.position.x > wall.position.x + wallSize / 2) {
                closestPoint.x = wall.position.x + wallSize / 2;
            } else {
                closestPoint.x = this.position.x;
            }
            if (this.position.y < wall.position.y - wallSize / 2) {
                closestPoint.y = wall.position.y - wallSize / 2;
            } else if (this.position.y > wall.position.y + wallSize / 2) {
                closestPoint.y = wall.position.y + wallSize / 2;
            } else {
                closestPoint.y = this.position.y;
            }
            // distance from closest point on square to center of tank
            let distanceSquared = (this.position.x - closestPoint.x) ** 2 + (this.position.y - closestPoint.y) ** 2;
            if (distanceSquared < this.radius ** 2) {
                let L = wall.position.x - wallSize / 2;
                let T = wall.position.y - wallSize / 2;
                let R = wall.position.x + wallSize / 2;
                let B = wall.position.y + wallSize / 2;
                let dx = this.position.x - this.prevPosition.x;
                let dy = this.position.y - this.prevPosition.y;
    
                // calculating intersection times with each sides plane
                let ltime = Number.MAX_VALUE;
                let rtime = Number.MAX_VALUE;
                let ttime = Number.MAX_VALUE;
                let btime = Number.MAX_VALUE;
                if (this.prevPosition.x - this.radius < L && this.position.x + this.radius > L) {
                    ltime = ((L - this.radius) - this.prevPosition.x) / dx;
                }
                if (this.prevPosition.x + this.radius > R && this.position.x - this.radius < R) {
                    rtime = (this.prevPosition.x - (R + this.radius)) / -dx;
                }
                if (this.prevPosition.y - this.radius < T && this.position.y + this.radius > T) {
                    ttime = ((T - this.radius) - this.prevPosition.y) / dy;
                }
                if (this.prevPosition.y + this.radius > B && this.position.y - this.radius < B) {
                    btime = (this.prevPosition.y - (B + this.radius)) / -dy;
                }
    
                if (ltime >= 0.0 && ltime <= 1.0) {
                    let ly = dy * ltime + this.prevPosition.y;
                    if (ly >= T && ly <= B) {
                        if (!bounced) {
                            this.bounces += 1;
                            bounced = true;
                            bounceCount += 1;
                        }
                        let newX = -Math.cos(this.rotation);
                        let newY = Math.sin(this.rotation);
                        this.rotation = Math.atan2(newY, newX);
                        this.position.x = L - (this.radius ** 2) / 2;
                        // left plane collison
                        continue;
                    }
                }
                else if (rtime >= 0.0 && rtime <= 1.0) {
                    let ry = dy * rtime + this.prevPosition.y;
                    if (ry >= T && ry <= B) {
                        if (!bounced) {
                            this.bounces += 1;
                            bounced = true;
                            bounceCount += 1;
                        }
                        let newX = -Math.cos(this.rotation);
                        let newY = Math.sin(this.rotation);
                        this.rotation = Math.atan2(newY, newX);
                        this.position.x = R + (this.radius ** 2) / 2;
                        // right plane collison
                        continue;
                    }
                }
    
                if (ttime >= 0.0 && ttime <= 1.0) {
                    let tx = dx * ttime + this.prevPosition.x;
                    if (tx >= L && tx <= R) {
                        if (!bounced) {
                            this.bounces += 1;
                            bounced = true;
                            bounceCount += 1;
                        }
                        let newX = Math.cos(this.rotation);
                        let newY = -Math.sin(this.rotation);
                        this.rotation = Math.atan2(newY, newX);
                        this.position.y = T - (this.radius ** 2) / 2;
                        // Top plane collision
                        continue;
                    }
                } else if (btime >= 0.0 && btime <= 1.0) {
                    let bx = dx * btime + this.prevPosition.x;
                    if (bx >= L && bx <= R) {
                        if (!bounced) {
                            this.bounces += 1;
                            bounced = true;
                            bounceCount += 1;
                        }
                        let newX = Math.cos(this.rotation);
                        let newY = -Math.sin(this.rotation);
                        this.rotation = Math.atan2(newY, newX);
                        this.position.y = B + (this.radius ** 2) / 2;
                        // bottom plane collision
                        continue;
                    }
                }
                
                if (Math.abs(this.position.x - this.prevPosition.x) > Math.abs(this.position.y - this.prevPosition.y)) {
                    if (!bounced) {
                        this.bounces += 1;
                        bounced = true;
                        bounceCount += 1;
                    }
                    let newX = -Math.cos(this.rotation);
                    let newY = Math.sin(this.rotation);
                    this.rotation = Math.atan2(newY, newX);
                    if (this.position.x > this.prevPosition.x) {
                        this.position.x = L - (this.radius ** 2) / 2;    
                    } else {
                        this.position.x = R + (this.radius ** 2) / 2;  
                    }
                    continue;
                } else {
                    if (!bounced) {
                        this.bounces += 1;
                        bounced = true;
                        bounceCount += 1;
                    }
                    let newX = Math.cos(this.rotation);
                    let newY = -Math.sin(this.rotation);
                    this.rotation = Math.atan2(newY, newX);
                    if (this.position.y > this.prevPosition.y) {
                        this.position.y = T - (this.radius ** 2) / 2;    
                    } else {
                        this.position.y = B + (this.radius ** 2) / 2;
                    }
                    continue;
                }
            }
        }
        if (this.live === 1) {
            if (this.position.x < 0) {
                if (!bounced) {
                    this.bounces += 1;
                    bounced = true;
                    bounceCount += 1;
                }
                let newX = -Math.cos(this.rotation);
                let newY = Math.sin(this.rotation);
                this.rotation = Math.atan2(newY, newX);
            } else if (this.position.x > width) { // 
                if (!bounced) {
                    this.bounces += 1;
                    bounced = true;
                    bounceCount += 1;
                }
                let newX = -Math.cos(this.rotation);
                let newY = Math.sin(this.rotation);
                this.rotation = Math.atan2(newY, newX);
            }
            if (this.position.y < 0) {
                if (!bounced) {
                    this.bounces += 1;
                    bounced = true;
                    bounceCount += 1;
                }
                let newX = Math.cos(this.rotation);
                let newY = -Math.sin(this.rotation);
                this.rotation = Math.atan2(newY, newX);
            } else if (this.position.y > height) { // 
                if (!bounced) {
                    this.bounces += 1;
                    bounced = true;
                    bounceCount += 1;
                }
                let newX = Math.cos(this.rotation);
                let newY = -Math.sin(this.rotation);
                this.rotation = Math.atan2(newY, newX);
            }
        }
    }

    public detectCollisionTankBullet(tank: BaseTank) {
        let distance = (tank.position.x - this.position.x) ** 2 + (tank.position.y - this.position.y) ** 2;
        if (this.tank === tank) {
            // if bullet was shot by this tank
            if ((distance < (tank.radius + this.radius) ** 2) && this.bounces === 1) {
                // for bullet to kills its own tank, has to have bounced
                return true;
            }
            return false;
        }
        // if bullet was shot by another tank
        if (distance < (tank.radius + this.radius) ** 2) {
            return true;
        }
        return false;
    }
}