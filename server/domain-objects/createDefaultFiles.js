export const defaultSketch = `function setup() {
  createCanvas(400, 400, SVG);
  noLoop();
  let saveButton = select('#saveButton');
  saveButton.mousePressed(saveImage);
}
function draw() {
  background(255); // Set the background to white

  // Dark purple color (equivalent to hsl(257, 62%, 18%))
  let darkPurple = color(48, 25, 67);

  // Fill color for glasses
  fill(darkPurple);
  noStroke();

  // Glasses frames (two squares)
  rect(100, 110, 60, 60);  // Left glass frame
  rect(170, 110, 60, 60);  // Right glass frame

  // Bridge of the glasses (small rectangle)
  rect(160, 130, 10, 10);  // Bridge

  // Left-side extension of the glasses
  rect(70, 130, 30, 10);  // Horizontal extension
  rect(70, 140, 10, 20);  // Vertical extension

  // Inner parts of the glasses (white and black alternating inside)
  // Left glass
  fill(255);  // White
  rect(110, 120, 20, 40);
  
  fill(0);  // Black
  rect(130, 120, 20, 40);
  
  // Right glass
  fill(255);  // White
  rect(180, 120, 20, 40);
  
  fill(0);  // Black
  rect(200, 120, 20, 40);
}

function saveImage() {
  save();
}`;

export const defaultHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5.js-svg@1.5.0"></script>  
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/addons/p5.sound.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
    <meta charset="utf-8" />

  </head>
  <body>
    <main>
    <button id="saveButton">Save SVG</button>
    </main>
    <script src="sketch.js"></script>
  </body>
</html>
`;

export const defaultCSS = `html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
`;

export default function createDefaultFiles() {
  return {
    'index.html': {
      content: defaultHTML
    },
    'style.css': {
      content: defaultCSS
    },
    'sketch.js': {
      content: defaultSketch
    }
  };
}
