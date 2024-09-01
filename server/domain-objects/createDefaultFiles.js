export const defaultSketch = `let svgArray = [];

function setup() {
  createCanvas(400, 400, SVG);
  noLoop();
  
  // Generate multiple SVGs on setup
  generateMultipleSVGs();

  // Setup Save SVG Button
  let saveButton = select('#saveButton');
  saveButton.mousePressed(saveImage);

  // Setup Export All as ZIP Button
  let exportZipButton = select('#exportZipButton');
  exportZipButton.mousePressed(exportAsZip);
}

function draw() {
  background(220);
  // Your drawing code (e.g., the body, legs, head, etc.)
}

// Function to create and store SVGs
function createSVG(index) {
  clear();
  
  // Example drawing commands
  fill(255);
  ellipse(200, 300, 150, 200); // Body
  ellipse(250, 350, 50, 50);   // Right Leg
  ellipse(150, 350, 50, 50);   // Left Leg
  ellipse(200, 200, 100, 100); // Head
  ellipse(170, 120, 30, 100);  // Left Ear
  ellipse(230, 120, 30, 100);  // Right Ear
  fill(0);
  ellipse(180, 190, 20, 20);    // Left Eye
  ellipse(220, 190, 20, 20);    // Right Eye
  fill(255, 182, 193);
  ellipse(200, 220, 15, 10);    // Nose
  line(200, 230, 190, 240);     // Left Mouth Line
  line(200, 230, 210, 240);     // Right Mouth Line
  line(160, 220, 190, 220);     // Left Whiskers
  line(210, 220, 240, 220);     // Right Whiskers

  // Store SVG in array
  svgArray.push(document.querySelector('svg').outerHTML);
  
  // Update the gallery UI
  updateGallery();
}

// Function to generate multiple SVGs
function generateMultipleSVGs() {
  const numberOfSVGs = 5; // Adjust as needed
  for (let i = 0; i < numberOfSVGs; i++) {
    createSVG(i);
  }
}

// Storage Management Functions
function storeSVG(svgData) {
  svgArray.push(svgData);
}

function retrieveSVG(index) {
  return svgArray[index];
}

function deleteSVG(index) {
  svgArray.splice(index, 1);
}

// UI Management Functions
function updateGallery() {
  let galleryDiv = document.getElementById('gallery');
  galleryDiv.innerHTML = '';
  
  svgArray.forEach((svg, index) => {
    let svgContainer = document.createElement('div');
    svgContainer.className = 'svg-container';
    
    // Create SVG Element
    let svgElement = document.createElement('div');
    svgElement.innerHTML = svg;
    svgContainer.appendChild(svgElement);
    
    // Create Export Button
    let exportBtn = document.createElement('button');
    exportBtn.innerText = 'Export';
    exportBtn.onclick = () => exportSVG(index);
    svgContainer.appendChild(exportBtn);
    
    // Create Delete Button
    let deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = () => {
      deleteSVG(index);
      updateGallery();
    };
    svgContainer.appendChild(deleteBtn);
    
    galleryDiv.appendChild(svgContainer);
  });
}

// Export Functions
function exportSVG(index) {
  let svgData = svgArray[index];
  let blob = new Blob([svgData], { type: 'image/svg+xml' });
  let url = URL.createObjectURL(blob);
  
  let a = document.createElement('a');
  a.href = url;
  a.download = \`output-\${index + 1}.svg\`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportAllSVGs() {
  svgArray.forEach((svg, index) => exportSVG(index));
}

function exportAsZip() {
  const zip = new JSZip();
  
  svgArray.forEach((svg, index) => {
    zip.file(\`output-\${index + 1}.svg\`, svg);
  });
  
  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, 'SVGs.zip');
  });
}

// Save Single SVG Image
function saveImage() {
  save(); // Existing save functionality
}
`;

export const defaultHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5.js-svg@1.5.0"></script>  
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/addons/p5.sound.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
    <meta charset="utf-8" />
    <title>p5.js Mint</title>
  </head>
  <body>
    <main>
      <button id="saveButton">Save SVG</button>
      <button id="exportZipButton">Export All as ZIP</button>
      <div id="gallery" class="gallery"></div> <!-- Gallery for SVGs -->
    </main>
    <script src="sketch.js"></script>
  </body>
</html>
`;

export const defaultCSS = `html, body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
canvas {
  display: block;
  margin: 20px auto;
}
main {
  text-align: center;
}
button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
}
.gallery {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}
.svg-container {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
}
.svg-container div {
  width: 150px;
  height: 150px;
  margin-bottom: 10px;
}
.svg-container button {
  margin: 5px;
  padding: 5px 10px;
  font-size: 14px;
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
