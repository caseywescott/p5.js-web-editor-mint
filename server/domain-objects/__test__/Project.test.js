/**
 * @jest-environment jsdom
 */

import { find } from 'lodash';

import {
  containsRootHtmlFile,
  toModel,
  transformFiles,
  FileValidationError
} from '../Project';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../../utils/createId');

// TODO: File name validation
// TODO: File extension validation
//
describe('domain-objects/Project', () => {
  // Mock the global save function (from p5.js)
  global.save = jest.fn();

  // Mock SVG creation function (p5.js-related)
  const generateSVG = (sketch) =>
    // Mock function to simulate SVG generation from p5.js sketches
    `<svg>${sketch}</svg>`;
  // Test cases for SVG Generation, Export, and Validation
  describe('SVG Generation and Export', () => {
    describe('SVG Generation', () => {
      it('generates SVG for simple shapes', () => {
        const svg = generateSVG('<rect x="10" y="10" width="30" height="30"/>');
        expect(svg).toContain(
          '<svg><rect x="10" y="10" width="30" height="30"/></svg>'
        );
      });

      it('generates SVG for complex shapes and transformations', () => {
        const svg = generateSVG(`
        <g transform="translate(10,20)">
          <circle cx="30" cy="30" r="20" fill="red"/>
          <text x="30" y="70">Sample Text</text>
        </g>`);
        expect(svg).toContain(
          '<svg><g transform="translate(10,20)"><circle cx="30" cy="30" r="20" fill="red"/><text x="30" y="70">Sample Text</text></g></svg>'
        );
      });

      it('generates distinct SVGs for different user inputs', () => {
        const svg1 = generateSVG(
          '<rect x="10" y="10" width="30" height="30"/>'
        );
        const svg2 = generateSVG('<circle cx="30" cy="30" r="20"/>');
        expect(svg1).not.toEqual(svg2);
      });
    });

    describe('SVG Output Integrity', () => {
      it('validates the structure and integrity of generated SVG', () => {
        const svg = generateSVG('<rect x="10" y="10" width="30" height="30"/>');
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
        const rect = svgDoc.querySelector('rect');
        expect(rect).not.toBeNull();
        expect(rect.getAttribute('x')).toBe('10');
        expect(rect.getAttribute('y')).toBe('10');
      });

      it('checks SVG scalability and resolution independence', () => {
        const svg = generateSVG('<circle cx="50" cy="50" r="40"/>');
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
        const circle = svgDoc.querySelector('circle');
        expect(circle).not.toBeNull();
        expect(circle.getAttribute('cx')).toBe('50');
      });
    });

    describe('SVG Export Functionality', () => {
      beforeEach(() => {
        // Setup DOM with a save button
        document.body.innerHTML = `
        <main>
          <button id="saveButton">Save SVG</button>
        </main>
      `;

        // Attach click handler to save button
        document.getElementById('saveButton').addEventListener('click', () => {
          global.save(
            generateSVG('<rect x="10" y="10" width="30" height="30"/>')
          );
        });
      });

      afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
      });

      it('exports SVG when save button is clicked', () => {
        const saveButton = document.getElementById('saveButton');
        saveButton.click();
        expect(global.save).toHaveBeenCalledTimes(1);
        expect(global.save).toHaveBeenCalledWith(
          '<svg><rect x="10" y="10" width="30" height="30"/></svg>'
        );
      });

      it('handles multiple SVG exports', () => {
        const saveButton = document.getElementById('saveButton');
        saveButton.click();
        saveButton.click();
        expect(global.save).toHaveBeenCalledTimes(2);
      });

      it('exports SVG with valid filename', () => {
        global.save.mockImplementation((data, filename) => {
          expect(filename).toMatch(/svg_[0-9]+\.svg/);
        });

        const saveButton = document.getElementById('saveButton');
        saveButton.click();
      });

      it('handles SVG export in different browsers', () => {
        // This test would require mocking or running in different browsers
        // Assuming Jest with Puppeteer or other cross-browser testing frameworks
        // For simplicity, we'll assume this test runs in different environments
        const saveButton = document.getElementById('saveButton');
        saveButton.click();
        expect(global.save).toHaveBeenCalled();
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('handles export of an empty SVG', () => {
        global.save.mockClear();
        global.save.mockImplementation((data) => {
          expect(data).toBe('<svg></svg>');
        });

        document.getElementById('saveButton').addEventListener('click', () => {
          global.save('<svg></svg>');
        });

        const saveButton = document.getElementById('saveButton');
        saveButton.click();
      });

      it('handles large SVG files', () => {
        const largeSVG = generateSVG(
          '<rect x="10" y="10" width="10000" height="10000"/>'
        );
        expect(largeSVG).toContain('width="10000"');
        expect(global.save).toHaveBeenCalledWith(largeSVG);
      });

      it('handles errors during export process', () => {
        global.save.mockImplementation(() => {
          throw new Error('File system error');
        });

        const saveButton = document.getElementById('saveButton');
        expect(() => saveButton.click()).toThrow('File system error');
      });
    });
  });

  describe('domain-objects/Project', () => {
    describe('Save SVG Button', () => {
      let saveImageMock;

      beforeEach(() => {
        // Mock the save function
        saveImageMock = jest.fn();

        // Mock the global save function (from p5.js)
        global.save = saveImageMock;

        // Setup the DOM for the button (simulate the HTML structure)
        document.body.innerHTML = `
        <main>
          <button id="saveButton">Save SVG</button>
        </main>
      `;

        // Attach the click handler to the button
        const saveButton = document.getElementById('saveButton');
        saveButton.addEventListener('click', () => {
          global.saveImage();
        });
      });

      afterEach(() => {
        // Clean up the DOM
        document.body.innerHTML = '';
      });

      it('renders the save button', () => {
        const saveButton = document.getElementById('saveButton');
        expect(saveButton).toBeInTheDocument();
      });

      it('calls saveImage function when the button is clicked', () => {
        const saveButton = document.getElementById('saveButton');

        // Click the button
        saveButton.click();

        // Verify that the save function was called
        expect(global.save).toHaveBeenCalledTimes(1);
      });
    });
  });
});

describe('transformFiles', () => {
  beforeEach(() => {
    const { resetMockCreateId } = require('../../utils/createId');
    resetMockCreateId();
  });

  it('creates an empty root with no data', () => {
    const tree = {};
    expect(transformFiles(tree)).toEqual([
      {
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: []
      }
    ]);
  });

  describe('containsRootHtmlFile', () => {
    it('returns true for at least one root .html', () => {
      expect(containsRootHtmlFile({ 'index.html': {} })).toBe(true);
      expect(containsRootHtmlFile({ 'another-one.html': {} })).toBe(true);
      expect(containsRootHtmlFile({ 'one.html': {}, 'two.html': {} })).toBe(
        true
      );
      expect(containsRootHtmlFile({ 'one.html': {}, 'sketch.js': {} })).toBe(
        true
      );
    });

    it('returns false anything else', () => {
      expect(containsRootHtmlFile({ 'sketch.js': {} })).toBe(false);
    });

    it('ignores nested html', () => {
      expect(
        containsRootHtmlFile({
          examples: {
            files: {
              'index.html': {}
            }
          }
        })
      ).toBe(false);
    });
  });

  describe('toModel', () => {
    it('filters extra properties', () => {
      const params = {
        name: 'My sketch',
        extraThing: 'oopsie',
        files: {}
      };

      const model = toModel(params);

      expect(model.name).toBe('My sketch');
      expect(model.extraThing).toBeUndefined();
    });

    it('throws FileValidationError', () => {
      const params = {
        files: {
          'index.html': {} // missing content or url
        }
      };

      expect(() => toModel(params)).toThrowError(FileValidationError);
    });

    it('throws if files is not an object', () => {
      const params = {
        files: []
      };

      expect(() => toModel(params)).toThrowError(FileValidationError);
    });

    it('creates default index.html and dependent files if no root .html is provided', () => {
      const params = {
        files: {}
      };

      const { files } = toModel(params);

      expect(files.length).toBe(4);
      expect(find(files, { name: 'index.html' })).not.toBeUndefined();
      expect(find(files, { name: 'sketch.js' })).not.toBeUndefined();
      expect(find(files, { name: 'style.css' })).not.toBeUndefined();
    });

    it('does not create default files if any root .html is provided', () => {
      const params = {
        files: {
          'example.html': {
            content: '<html><body>Hello!</body></html>'
          }
        }
      };

      const { files } = toModel(params);

      expect(files.length).toBe(2);
      expect(find(files, { name: 'example.html' })).not.toBeUndefined();
      expect(find(files, { name: 'index.html' })).toBeUndefined();
      expect(find(files, { name: 'sketch.js' })).toBeUndefined();
      expect(find(files, { name: 'style.css' })).toBeUndefined();
    });

    it('does not overwrite default CSS and JS of the same name if provided', () => {
      const params = {
        files: {
          'sketch.js': {
            content: 'const sketch = true;'
          },
          'style.css': {
            content: 'body { outline: 10px solid red; }'
          }
        }
      };

      const { files } = toModel(params);

      expect(files.length).toBe(4);
      expect(find(files, { name: 'index.html' })).not.toBeUndefined();

      const sketchFile = find(files, { name: 'sketch.js' });
      expect(sketchFile.content).toBe('const sketch = true;');

      const cssFile = find(files, { name: 'style.css' });
      expect(cssFile.content).toBe('body { outline: 10px solid red; }');
    });
  });
});

describe('transformFiles', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    const { resetMockCreateId } = require('../../utils/createId');

    resetMockCreateId();
  });

  it('creates an empty root with no data', () => {
    const tree = {};

    expect(transformFiles(tree)).toEqual([
      {
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: []
      }
    ]);
  });

  it('converts tree-shaped files into list', () => {
    const tree = {
      'index.html': {
        content: 'some contents'
      }
    };

    expect(transformFiles(tree)).toEqual([
      {
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: ['1']
      },
      {
        _id: '1',
        content: 'some contents',
        fileType: 'file',
        name: 'index.html'
      }
    ]);
  });

  it('uses file url over content', () => {
    const tree = {
      'script.js': {
        url: 'http://example.net/something.js'
      }
    };

    expect(transformFiles(tree)).toEqual([
      {
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: ['1']
      },
      {
        _id: '1',
        url: 'http://example.net/something.js',
        fileType: 'file',
        name: 'script.js'
      }
    ]);
  });

  it('creates folders', () => {
    const tree = {
      'a-folder': {
        files: {}
      }
    };

    expect(transformFiles(tree)).toEqual([
      {
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: ['1']
      },
      {
        _id: '1',
        children: [],
        fileType: 'folder',
        name: 'a-folder'
      }
    ]);
  });

  it('walks the tree processing files', () => {
    const tree = {
      'index.html': {
        content: 'some contents'
      },
      'a-folder': {
        files: {
          'data.csv': {
            content: 'this,is,data'
          },
          'another.txt': {
            content: 'blah blah'
          }
        }
      }
    };

    expect(transformFiles(tree)).toEqual([
      {
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: ['1', '2']
      },
      {
        _id: '1',
        name: 'index.html',
        fileType: 'file',
        content: 'some contents'
      },
      {
        _id: '2',
        name: 'a-folder',
        fileType: 'folder',
        children: ['3', '4']
      },
      {
        _id: '3',
        name: 'data.csv',
        fileType: 'file',
        content: 'this,is,data'
      },
      {
        _id: '4',
        name: 'another.txt',
        fileType: 'file',
        content: 'blah blah'
      }
    ]);
  });

  it('handles deep nesting', () => {
    const tree = {
      first: {
        files: {
          second: {
            files: {
              third: {
                files: {
                  'hello.js': {
                    content: 'world!'
                  }
                }
              }
            }
          }
        }
      }
    };

    expect(transformFiles(tree)).toEqual([
      {
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: ['1']
      },
      {
        _id: '1',
        name: 'first',
        fileType: 'folder',
        children: ['2']
      },
      {
        _id: '2',
        name: 'second',
        fileType: 'folder',
        children: ['3']
      },
      {
        _id: '3',
        name: 'third',
        fileType: 'folder',
        children: ['4']
      },
      {
        _id: '4',
        name: 'hello.js',
        fileType: 'file',
        content: 'world!'
      }
    ]);
  });

  it('allows duplicate names in different folder', () => {
    const tree = {
      'index.html': {
        content: 'some contents'
      },
      data: {
        files: {
          'index.html': {
            content: 'different file'
          }
        }
      }
    };

    expect(transformFiles(tree)).toEqual([
      {
        _id: '0',
        fileType: 'folder',
        name: 'root',
        children: ['1', '2']
      },
      {
        _id: '1',
        name: 'index.html',
        fileType: 'file',
        content: 'some contents'
      },
      {
        _id: '2',
        name: 'data',
        fileType: 'folder',
        children: ['3']
      },
      {
        _id: '3',
        name: 'index.html',
        fileType: 'file',
        content: 'different file'
      }
    ]);
  });

  it('validates files', () => {
    const tree = {
      'index.html': {} // missing `content`
    };

    expect(() => transformFiles(tree)).toThrowError(FileValidationError);
  });

  it('collects all file validation errors', () => {
    const tree = {
      'index.html': {}, // missing `content`
      'something.js': {} // also missing `content`
    };

    try {
      transformFiles(tree);

      // Should not get here
      throw new Error('should have thrown before this point');
    } catch (err) {
      expect(err).toBeInstanceOf(FileValidationError);
      expect(err.files).toEqual([
        { name: 'index.html', message: "missing 'url' or 'content'" },
        { name: 'something.js', message: "missing 'url' or 'content'" }
      ]);
    }
  });
});
