// sandpile 2022
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

/** @type {WebGLRenderingContext} */
const gl = canvas.getContext("webgl");

if (gl == null) throw new Error("gl must not be null!");

// one raster unit = 2 display pixels
const dpr = window.devicePixelRatio;
const dpWidth = canvas.clientWidth * dpr;
const dpHeight = canvas.clientHeight * dpr;
const dpxppx = 10;
const ruWidth = dpWidth / dpxppx;
const ruHeight = dpHeight / dpxppx;

canvas.width = ruWidth;
canvas.height = ruHeight;
gl.viewport(0, 0, ruWidth, ruHeight);

gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

class WebGLError extends Error {
   constructor(what, why) {
      super();
      this.message = `${what.toUpperCase()}: ${why}`;
   }
}

function makeShader(type, glsl) {
   const shader = gl.createShader(type);
   gl.shaderSource(shader, glsl);
   gl.compileShader(shader);
   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const why = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new WebGLError("compile", why);
   }
   return shader;
}

const vertexShader = makeShader(gl.VERTEX_SHADER, /* glsl */ `
   precision mediump float;

   attribute vec2 v_pos;
   attribute vec3 v_color;

   varying vec3 f_color;

   void main(void) {
      f_color = v_color; // pass the color to the fragment shader
      gl_Position = vec4(v_pos, 0.0, 1.0);
      gl_PointSize = 1.0;
   }
`);

const fragmentShader = makeShader(gl.FRAGMENT_SHADER, /* glsl */ `
   precision mediump float;

   varying vec3 f_color;

   void main(void) {
      gl_FragColor = vec4(f_color, 1.0);
   }
`);

const program = gl.createProgram();
if (program == null) {
   throw new WebGLError("create program", "???");
}
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
   const why = gl.getProgramInfoLog(program);
   gl.deleteProgram(program);
   throw new WebGLError("link", why);
}

gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
   const why = gl.getProgramInfoLog(program);
   gl.deleteProgram(program);
   throw new WebGLError("validate", why);
}


const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 1, 1]), gl.STATIC_DRAW);

function registerAttrib(name, sz, stride, offset) {
   const location = gl.getAttribLocation(program, name);
   if (location === -1) {
      throw new WebGLError("attrib", `Could not find attribute ${name}`);
   }

   gl.vertexAttribPointer(
      location,
      sz,
      gl.FLOAT,
      gl.FALSE,
      stride,
      offset,
   );

   gl.enableVertexAttribArray(location);
}

const sz_Float = Float32Array.BYTES_PER_ELEMENT;

registerAttrib(
   "v_pos",
   2,
   5 * sz_Float,
   0 * sz_Float,
);

registerAttrib(
   "v_color",
   3,
   5 * sz_Float,
   2 * sz_Float,
);

gl.useProgram(program);
gl.drawArrays(gl.POINTS, 0, 1);
