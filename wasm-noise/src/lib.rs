extern crate noise;
mod utils;

use wasm_bindgen::prelude::*;
use noise::{NoiseFn, Perlin, Seedable};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm!");
}

#[wasm_bindgen]
pub extern fn perlin(x: f32, y: f32, z: f32) -> f64 {
    let perlin = Perlin::new();
    perlin.set_seed(0);
    perlin.get([x as f64, y as f64, z as f64])
}
