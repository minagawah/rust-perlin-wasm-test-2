# rust-perlin-wasm-test-2

Using wasm-pack to play with Perlin noise.

__Update: 2023.4.15__  
This is a very old app. If you want the lates WASM app using Perlin noise,
check out [perlin-experiment-2](https://github.com/minagawah/perlin-experiment-2).
Instead of using JS for canvas animation, the whole thing
is written in WASM for this new version.  
Or, if you want a simpler WASM app for your learning, check out
[very-simple-wasm-2023](https://github.com/minagawah/very-simple-wasm-2023).


[1. About](#about)  
[2. What I did](#what)  
[3. Run](#run)  
[4. Notes](#notes)  
&nbsp; [4-1. MIME TYPE](#notes-mime)  
&nbsp; [4-2. Typescript: Dynamic Import](#notes-typescript-dynamic)  
[5. LICENSE](#license)  

![screenshot](screenshot.png "Screenshot")

[View Demo](http://tokyo800.jp/minagawah/rust-perlin-wasm-test-2/)

**IMPORTANT:**  
Please note **THIS IS VERY OLD**.  
Check out my [perlin-experiment](https://github.com/minagawah/perlin-experiment).  
It is doing something different, but has the latest setup.

<a id="about"></a>
## 1. About

While [the previous sample](https://github.com/minagawah/rust-perlin-wasm-test)
used `nightly` toolchain to build `*.wasm` without much effort.
This time, I used [wasm-pack](https://github.com/rustwasm/wasm-pack)
(via [@wasm-tool/wasm-pack-plugin](https://github.com/wasm-tool/wasm-pack-plugin))
to bridge between WASM and Webpack.

As you visit [wasm-pack](https://github.com/rustwasm/wasm-pack) website,
the official document gives you 2 options to either use
[rust-webpack](https://github.com/rustwasm/rust-webpack-template)
or
[wasm-app](https://github.com/rustwasm/create-wasm-app),
where they differ slightly in its features and of how they manage projects:

### (a) [wasm-app](https://github.com/rustwasm/create-wasm-app)
- JS sources managed in `src`.
- Needs to prepare your own Cargo under the root directory.
- Starts with `bootstrap.js` and asynchronously imports all the others.
- Uses `copy-webpack-plugin` to copy `index.html` to `dist`.

### (b) [rust-webpack](https://github.com/rustwasm/rust-webpack-template)
- JS sources managed in `js` and Rust in `src`.
- Already has [web-sys](https://rustwasm.github.io/wasm-bindgen/web-sys/index.html) setups.
- Also allows you to test using [js-sys](https://docs.rs/js-sys/0.3.25/js_sys/) and [futures](https://docs.rs/futures/0.1.28/futures/).
- Uses `wasm-pack-plugin` to build Cargo, and builds to right under the root.
- Directly imports (dynamically) `{YOUR_CRATE_DIRECTORY}/pkg/index.js` which loads `*.wasm`. No `bootstrap.js` is needed (as it does in `wasm-pack`) and worry free of asynchronous issues.


```shell
# Try it yourself
npm init wasm-app a1;
npm init rust-webpack a2;
```

However, I want good parts from both,
so I decided to go with my own (I mean, for the Webpack setups).  
Here is the idea:

1. Git clone `rust-perlin-wasm-test-2` which I created on Github.
2. Use `wasm-pack-plugin`, so that worries nothing about asynchronous issues (no `bootstrap.js`).
3. Use `cargo-generate` to create my own Cargo project under the root directory.
4. Use `html-webpack-plugin` (and other handy Webpack plugins) to dynamically generates all the HTMNL (or CSS).
5. Add supports for `web-sys`.



<a id="what"></a>
## 2. What I did

Here's what I actually did.  
Of course, you need basic tools (Ex. `npm`, `rustup`, etc.)  
You also need [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/).

For NPM:

```shell
# Git clone `rust-perlin-wasm-test-2` which I created on Github.
git clone https://github.com/minagawah/rust-perlin-wasm-test-2.git;

# Installed minimum required NPM packages for Webpack + TypeScript + WASM
yarn add typescript webpack webpack-cli webpack-dev-server ts-loader html-webpack-plugin @wasm-tool/wasm-pack-plugin --dev

# For Webpack config files merging
yarn add webpack-merge --dev

# For ESLint on TypeScript
yarn add eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --dev

# For `tape` test on TypeScript
yarn global add ts-node
yarn add tape @types/tape --dev

# Copying `assets`
yarn add copy-webpack-plugin --dev

# Cleaning the previously built in `dist`
yarn add clean-webpack-plugin --dev

# Extract LICENSE information from `vender.js`
yarn add license-webpack-plugin --dev

# For CSS files (`style-loader` is for `dev`)
yarn add style-loader css-loader postcss-loader autoprefixer mini-css-extract-plugin --dev

# For Fonts & Image files
yarn add file-loader --dev

# So, it looks like this:
yarn add typescript webpack webpack-cli webpack-dev-server ts-loader html-webpack-plugin @wasm-tool/wasm-pack-plugin webpack-merge eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin tape @types/tape copy-webpack-plugin clean-webpack-plugin license-webpack-plugin style-loader css-loader postcss-loader autoprefixer mini-css-extract-plugin file-loader --dev

# For service use.
yarn add debounce-ctx
yarn add victor
```

For Cargo:

```shell
# Use `cargo-generate` to create a new Cargo project (called `wasm-noise`)
cd rust-perlin-wasm-test-2
cargo generate --git https://github.com/rustwasm/wasm-pack-template --name wasm-noise

# Modifiy some files a bit
cd wasm-noise
rm -fR .git
rm -f LICENSE_APACHE
mv LICENSE_MIT LICENSE
vi .gitignore
-----------------------
# wasm-pack related
bin/
pkg/
wasm-pack.log
-----------------------
```

`wasm-noise/Cargo.toml`:

```diff
[dependencies]
-wasm-bindgen = "0.2"
+wasm-bindgen = "^0.2"
+noise = "0.5.1"

+[dependencies.web-sys]
+version = "0.3.22"
+features = ["console"]

[dev-dependencies]
-wasm-bindgen-test = "0.2"
+wasm-bindgen-test = "^0.2"
+futures = "0.1.27"
+js-sys = "0.3.22"
+wasm-bindgen-futures = "0.3.22"

+[profile.dev]
+lto = true
+opt-level = 3

[profile.release]
-opt-level = "s"
+opt-level = 3
+lto = true
```

`wasm-noise/src/lib.rs`:

```diff
+extern crate web_sys;
+extern crate noise;
 mod utils;
 
 use wasm_bindgen::prelude::*;
+use web_sys::console;
+use noise::{NoiseFn, Perlin, Seedable};
 
+#[wasm_bindgen]
+extern "C" {
+    #[wasm_bindgen(js_namespace = console)]
+    fn log(s: &str);
+
+    #[wasm_bindgen(js_namespace = console, js_name = log)]
+    fn log_u32(a: u32);
+
+    #[wasm_bindgen(js_namespace = console, js_name = log)]
+    fn log_many(a: &str, b: &str);
+}

+macro_rules! console_log {
+    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
+}

+#[wasm_bindgen]
+pub extern fn hello_web_sys_console() {
+    console_log!("Hello {}! using macro", "world");
+    console::log_1(&"Hello world! using web-sys".into());
+}

+#[wasm_bindgen]
+pub extern fn perlin(x: f32, y: f32, z: f32) -> f64 {
+    let perlin = Perlin::new();
+    perlin.set_seed(0);
+    perlin.get([x as f64, y as f64, z as f64])
+}
```

```shell
###(not needed) cargo build
###(not needed) wasm-pack build

# See `wasm-pack-plugin` takes care of everything!
```


<a id="run"></a>
## 3. Run

Running the bellow, runs `wasm-pack`,
builds `{YOUR_CRATE_DIRECTORY}/target/wasm32-unknown-unknown`,
and prepares `{YOUR_CRATE_DIRECTORY}/pkg/*` for you.

```shell
# dev
yarn serve

# prod
yarn build
```


<a id="notes"></a>
## 4. Notes


<a id="notes-mime"></a>
## 4-1. MIME TYPE

Simply uploading WASM file to the remote server won't work.  
Your server must send a MIME header specific to the WASM file.  
SSH your hosting server and simply set to `.htaccess`:

```apache_conf
AddType application/wasm .wasm
```

<a id="notes-typescript-dynamic"></a>
## 4-2. TypeScript: Dynamic Import Syntax

While the current settings works just fine,
when it comes to dynamically import a module,
TypeScript does not seem to like a module
which does not yet exist.

In `src/lib/WasmNoise.ts`, I have the following code:  
(which is currently commented out)

```js
export const memory: Function = async (): Promise<any> => {
  const wasm = await import('../../wasm-noise/pkg/index_bg.wasm') || {};
  const memory: any = wasm.memory || {};
  return memory;
};
```

Since `wasm-noise/pkg/index_bg.wasm` is generated
using `wasm-pack-plugin` (via `wasm-pack`),
it does not yet exist when TypeScript trys
to look into the module content,
and gives me the following error:

```shell
[tsl] ERROR in /{...}/rust-perlin-wasm-test-2/src/lib/WasmNoise.ts(8,29)
      TS2307: Cannot find module '../../wasm-noise/pkg/index_bg.wasm'
```

Henceforth, I am currently commenting out the mentioned code.  
When I actually decides to use the dynamic import in the future,
I sort of have a workaround (but not quite solving the issue)
which is to add `transpileOnly` to `ts-loader` in webpack config:

```js
module: {
  rules: [
    {
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        transpileOnly: true,
        compilerOptions: {
          'sourceMap': true,
        },
      }
    },
```

The drawback, however, of having `transpileOnly`
is that you no longer have TypeScript warns you
of anything at all. By adding `transpileOnly`,
you are basically ignoring the issue...



<a id="license"></a>
## 5. License

Provided under [WTFPL](./LICENSE).  
Remember, there are some NPM libraries that are under certain license restrictions.  
Build the project, and `license-webpack-plugin` extracts license information,
and you can see them in separate files under `dist`.

