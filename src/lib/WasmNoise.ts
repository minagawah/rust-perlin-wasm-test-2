let instance: any;

export const getIndex: Function = ({ rows = 0, row = 0, col = 0 }): number => {
  return row * rows + col;
};

export const memory: Function = async (): Promise<any> => {
  const { memory } = await import('../../wasm-noise/pkg/index_bg.wasm') || {};
  return memory;
};

export default async function factory (): Promise<any> {
  if (!instance) {
    try {
      instance = await import('../../wasm-noise/pkg');
    } catch (err) {
      console.error(err);
    }
  }
  return instance;
}
