import WasmNoiseFactory from './lib/WasmNoise';
import debounce from 'debounce-ctx';
import { clamp, requestAnimFrame } from './lib/util';
import { Rect } from './types';
import './style.css';

import createFlows from './Flows';

const CONTAINER_ID = 'app';

const int = Math.trunc;
const print = (s: string): void => console.log(`[app] ${s}`);

// const requestAnimFrame = function (): Function {
//   return (window as any).requestAnimationFrame ||
//     (window as any).webkitRequestAnimationFrame ||
//     (window as any).mozRequestAnimationFrame ||
//     function (f: Function): void { (window as any).setTimeout(f, 1E3/60) }
// }();

// Checks out the container size, and calculates the same for canvas.
const getCanvasSize = (): Rect => {
  const maxWidth = 920;
  const body = document.body;
  const cont = document.getElementById(CONTAINER_ID);
  const { width: fullWidth, height: fullHeight }: any = (body && body.getBoundingClientRect()) || {};
  const { y: heightUsed }: any = (cont && cont.getBoundingClientRect()) || {};
  const availHeight = (fullHeight - heightUsed) * 0.9;
  const width = (fullWidth > maxWidth) ? maxWidth : fullWidth;
  const height = availHeight;
  return { width, height };
};

let canvas: HTMLCanvasElement;

let flo: any;
let dt = 1;
let lt = 0;
let et = 0;
let tick = 0;

const reset = () => {
  print('+++++++ reset()');
  const { width, height }: Rect = getCanvasSize();
  print(`${width}x${height}`);

  canvas.width = width;
  canvas.height = height;

  const num: number = width * height / 900;
  // const num = 60;
  flo.reset({ num, width, height });
};

let suspend = false;
let inProcess = false;

const step = () => {
  if (inProcess || suspend) {
    return;
  }
  inProcess = true;
  requestAnimFrame(step);

  flo.update();
  flo.draw();

  let now = Date.now();
  dt = clamp((now - lt) / (1000 / 60), 0.001, 10);
  lt = now;
  et += dt;
  tick++;

  inProcess = false;
};

(async () => {
  try {
    const noise: any = await WasmNoiseFactory();
    noise.hello_web_sys_console();

    canvas = <HTMLCanvasElement> document.getElementById('canvas');

    flo = await createFlows(canvas);

    (window as any).addEventListener('resize', debounce(reset, 800), false);
    (window as any).addEventListener('click', reset, false);

    reset();
    step();
  } catch (err) {
    console.error(err);
  }
})();
