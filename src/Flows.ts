/**
 * Based on Johan Karlsson's blog post:
 * https://codepen.io/DonKarlssonSan/post/particles-in-simplex-noise-flow-field
 */
import { Vec2 } from './Vec2';
import { Rect, Particle } from './types';
import { rand, withinRect } from './lib/util';
import WasmNoiseFactory from './lib/WasmNoise';

const PARTICLE_SIZE = 3;

const int = Math.trunc;
const print = (s: string): void => console.log(`[Flow] ${s}`);

interface CreateParticle {
  ctx: any;
  index: number;
  width: number;
  height: number;
}

let noise;

/**
 * @public
 * @param {Object} [canvas]
 * @returns {Object}
 */
export default async function factory (canvas: HTMLCanvasElement) {
  const noise: any = await WasmNoiseFactory();

  // @todo
  // TS2339: Property 'strokeStyle' does not exist on type 'HTMLCanvasElement'.
  const ctx: any = canvas && (canvas as any).getContext('2d');

  // const size = 15;
  const size = 20;
  
  let width = 0;
  let height = 0;
  let cols = 1;
  let rows = 1;
  let zin = 0;
  let particles: any[] = [];
  let field: any[] = [];

  // --------------------------
  // Reset
  // --------------------------
  
  const resetParticles = (num: number): void => {
    particles.length = 0;
    zin = 0;
    for (let index = 0; index < num; index++) {
      particles.push(
        createParticle({ ctx, index, width, height })
      );
    }
  };

  const resetField = (): void => {
    field = new Array(cols);
    for (let x = 0; x < cols; x++) {
      field[x] = new Array(rows);
      for (let y = 0; y < rows; y++) {
        field[x][y] = new Vec2(0, 0);
      }
    }
  };

  /**
   * @protected
   * @param {Object} [o]
   * @param {number} [o.num] Number of partcles.
   * @param {number} [o.width] Canvas width
   * @param {number} [o.height] Canvas height
   */
  const reset = (args: any = {}) => {
    print('+++++++ reset()');
    const { num, width: w, height: h }: { num: number, width: number, height: number } = args;

    width = canvas.width = w;
    height = canvas.height = h;

    // "fill" would be the same, but "stroke" changes.
    ctx.strokeStyle = 'hsla(0, 0%, 100%, 1)';
    ctx.fillStyle = 'hsla(0, 0%, 100%, 0.9)';

    cols = Math.round(width / size) + 1;
    rows = Math.round(height / size) + 1;

    resetParticles(num);
    resetField();
  };

  // --------------------------
  // Update
  // --------------------------

  // Perlin noise to set new "angle" for each in the field.
  // const angleZoom = (n: number): number => n/20;
  const angleZoom = (n: number): number => n/100;
  const getPerlinAngle = (x: number, y: number, zin: number): number => {
    return noise.perlin(angleZoom(x), angleZoom(y), zin) * Math.PI * 2;
  };

  // Perlin noise to set new "length" for each in the field.
  // const distOffset = 40000;
  const distOffset = 10;
  // const disZoom = (n: number): number => n/40 + distOffset;
  const disZoom = (n: number): number => n/80 + distOffset;
  const getPerlinDist = (x: number, y: number, zin: number): number => {
    return noise.perlin(disZoom(x), disZoom(y), zin) * 0.5;
  };

  const updateField = (): void => {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const p: Vec2 = field[x][y];
        p.setAngle(getPerlinAngle(x, y, zin));
        p.setLength(getPerlinDist(x, y, zin));
      }
    }
    // zin += 0.001;
    zin += 0.00015;
  };

  const updateParticles = (): void => {
    const rect: Rect = { x: 0, y: 0, width: cols, height: rows };
    particles.forEach((p: Particle): void => {
      const copy = p.pos.clone().divide(size, size); // (x, y)
      let v: Vec2;
      if (withinRect(copy, rect)) {
        v = <Vec2> field[int(copy.x)][int(copy.y)];
      }
      p.update(v);
    });
  };

  /**
   * @protected
   */
  const update = (): void => {
    updateField();
    updateParticles();
  };

  // --------------------------
  // Draw
  // --------------------------
  
  const drawField = (): void => {
    ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.4)';
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const px0 = x * size;
        const py0 = y * size;
        const px1 = px0 + field[x][y].x * size * 2;
        const py1 = py0 + field[x][y].y * size * 2;
        ctx.beginPath();
        ctx.moveTo(px0, py0);
        ctx.lineTo(px1, py1);
        ctx.stroke();
      }
    }
  };

  const drawParticles = (): void => {
    ctx.strokeStyle = 'hsla(0, 0%, 100%, 1)';
    particles.forEach((p: Particle) => p.draw());
  };

  /**
   * @protected
   */
  const draw = (args: any = {}) => {
    const { bg }: { bg: any } = args; // @todo: Give a specific type to `bg`.
    if (!ctx) { throw new Error('No context for flows.'); }
    if (bg) {
      ctx.putImageData(bg, 0, 0);
    }
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.stroke();
    drawField();
    drawParticles();
  };

  return {
    reset,
    update,
    draw
  };
}

/**
 * @private
 * @param {Object} [o]
 * @param {Object} [o.ctx] Canvas context
 * @param {number} [o.index] Index for the instance stored in "particles".
 * @param {number} [o.width] Canvas width
 * @param {number} [o.height] Canvas height
 * @returns {Object}
 */
function createParticle ({ ctx, index, width, height }: CreateParticle): Particle {

  const size = PARTICLE_SIZE;
  const pos = new Vec2(rand(0, width), rand(0, height));
  const vel = new Vec2(rand(-1, 1), rand(-1, 1));
  
  return {
    pos,
    update: (v: Vec2) => {
      if (v) {
        vel.add(v);
      }
      pos.add(vel);

      if (vel.getLength() > 2) {
        vel.setLength(2);
      }
      if (pos.x > width) {
        pos.x = 0;
      } else if (pos.x < -size) {
        pos.x = width - 1;
      }
      if (pos.y > height) {
        pos.y = 0;
      } else if (pos.y < -size) {
        pos.y = height - 1;
      }
    },
    draw: () => {
      ctx.fillRect(pos.x, pos.y, size, size);
    }
  };
}
