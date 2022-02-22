// sandpile 2022
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d", {alpha: false});

// one raster unit = 2 display pixels
const dpr = window.devicePixelRatio;
const dpWidth = canvas.clientWidth * dpr;
const dpHeight = canvas.clientHeight * dpr;
const dpxppx = 10;
const ruWidth = dpWidth / dpxppx | 0;
const ruHeight = dpHeight / dpxppx | 0;

canvas.width = ruWidth;
canvas.height = ruHeight;

const centerX = ruWidth / 2 | 0;
const centerY = ruHeight / 2 | 0;

const map = [];
for (let i = 0; i < ruHeight; i++) {
   map.push(new Array(ruWidth).fill(0|0));
}

const color = [
   "#000000",
   "#302040",
   "#355070",
   "#6D597A",
   "#B56576",
   "#E56B6F",
   "#EAAC8B",
];
const tooMuchColor = "#FED9B7";

let changed = [];
function set(x, y, val) {
   if (x < 0) return;
   if (y < 0) return;
   if (x >= ruWidth) return;
   if (y >= ruHeight) return;

   map[y][x] = val;
   changed.push([x, y]);
}
function add(x, y, val) {
   if (x < 0) return;
   if (y < 0) return;
   if (x >= ruWidth) return;
   if (y >= ruHeight) return;

   map[y][x] += val;
   changed.push([x, y]);
}

// coordinate list of what was changed last tick
function tick(time) {
   // drop sand
   add(centerX, centerY, 8)

   for (let i = 0; i < changed.length; i++) {
      const x = changed[i][0];
      const y = changed[i][1];
      const val = map[y][x];
      if (val < color.length) {
         ctx.fillStyle = color[val];
      } else {
         ctx.fillStyle = tooMuchColor;
      }
      ctx.fillRect(x, y, 1, 1);

      if (val > 8) {
         set(x, y, val % 4);
         add(x - 1, y, val / 4 | 0);
         add(x, y - 1, val / 4 | 0);
         add(x + 1, y, val / 4 | 0);
         add(x, y + 1, val / 4 | 0);
      }
   }

   changed = [];

   requestAnimationFrame(tick);
}
tick();
