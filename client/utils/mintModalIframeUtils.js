const iframeHtmlTemplate = (svgContent) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5.js-svg@1.5.0"></script>  
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/addons/p5.sound.min.js"></script>
  </head>
  <body>
    <main>
      <button id="saveButton">Save SVG</button>
    </main>
    <script id="svgScript">
      ${svgContent}
    </script>
  </body>
  </html>
  `;

export default iframeHtmlTemplate;
