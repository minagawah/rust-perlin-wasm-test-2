extern crate web_sys;
extern crate noise;
mod utils;

use wasm_bindgen::prelude::*;
// use web_sys::console;
use noise::{NoiseFn, Perlin, OpenSimplex, Seedable};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Bind `console.log` without `web_sys`.

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

macro_rules! console_log {
    ( $($t:tt)* ) => (
        log(&format_args!( $($t)* ).to_string())
    )
}

// @todo
// macro_rules! logg {
//     ( &( $t:tt )* ) => {
//         console::log_1(&format!( &( $t )* ).info());
//     }
// }

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm!");
}

#[wasm_bindgen]
pub extern fn hello_web_sys_console() {
    console_log!("Hello, {}!", "original");
    web_sys::console::log_1( &( format!("Hello, {}!", "web_sys").into() ) );
}

#[wasm_bindgen]
pub extern fn perlin(x: f32, y: f32, z: f32) -> f64 {
    let perlin = Perlin::new();
    perlin.set_seed(0);
    perlin.get([x as f64, y as f64, z as f64])
}

#[wasm_bindgen]
pub extern fn simplex(x: f32, y: f32, z: f32) -> f64 {
    let simplex = OpenSimplex::new();
    simplex.set_seed(0);
    simplex.get([x as f64, y as f64, z as f64])
}
