/* eslint camelcase: [0] */
/* eslint no-unused-vars: [1] */
import { Vector2 } from './Vector2';
import { deg } from './lib/util';

export class Vec2 extends Vector2 {
  clone () {
    return new Vec2(this.x, this.y);
  }
  getAngle (): number {
    return deg(Math.atan2(this.y, this.x));
  }
  setAngle (angle: number): void {
    const length: number = this.getLength();
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
  }
  setLength (length: number): void {
    const angle: number = this.getAngle();
    this.x = Math.cos(angle) * length;
    this.y = Math.sin(angle) * length;
  }
}
