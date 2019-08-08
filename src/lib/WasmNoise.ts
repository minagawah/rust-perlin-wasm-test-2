let instance: any;

/**
 * @public
 * @returns {Promise}
 */
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
