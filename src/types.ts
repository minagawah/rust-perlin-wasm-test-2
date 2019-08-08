import { Vec2 } from './Vec2';

export interface Point2 {
  x: number;
  y: number;
}

export interface Rect {
  x?: number;
  y?: number;
  width: number;
  height: number;
}

export interface Arc {
  x: number;
  y: number;
  radius: number;
}

export interface Particle {
  pos: Vec2;
  update: Function;
  draw: Function;
}
