//NicNaksReallyCoolColorPickerThatHeDefinatelyDidntJustCopyFromP5
let img;
let art;
let grid;
let artBackground;
let palette;
let overlay;
let history = [];
let historyIndex = 0;
let selected = {};
let initialClick = {};
let NicNaksReallyCoolColorPickerThatHeDefinatelyDidntJustCopyFromP5;
let eraser;
let download;
let undo;
let redo;
let mx, my, pmx, pmy;
let dim = { w: 32, h: 32 };
let isDrawing = 0;
let fps = 30;

function preload() {
  // img = loadImage("img.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  history.push(createImage(dim.w, dim.h));
  history[0].loadPixels();
  
  art = createImage(dim.w, dim.h);
  art.loadPixels();

  grid = new Grid(dim.w, dim.h);
  grid.showGrid = false;

  artBackground = createImage(dim.w, dim.h);
  artBackground.loadPixels();
  for (let i = 0; i < dim.w; i++) {
    for (let j = 0; j < dim.h; j++) {
      if (typeof img == "object" && i < img.width && j < img.height) {
        let col = img.get(i, j);
        // grid.cells[i][j].set(col);
        art.set(i, j, col);
      }

      let checker = (i + j) % 2 == 0 ? color(255) : color(239);
      artBackground.set(i, j, checker);
    }
  }
  artBackground.updatePixels();

  overlay = createImage(dim.w, dim.h);
  overlay.loadPixels();

  palette = new ColorPalette(10, 2);
  selected.color = palette.colors[0][0];
  selected.index = [0, 0];
  selected.erase = false;
  selected.drawRect = false;

  NicNaksReallyCoolColorPickerThatHeDefinatelyDidntJustCopyFromP5 = createColorPicker(
    selected.color
  ).position(width / 2 + 20, height / 2 - 240 - 24);

  eraser = new Button("eraser", 480 - 24 * 3, 24, 24, 24);
  rectBrush = new Button("rect", 480 - 24 * 4, 24, 24, 24);
  undo = new Button("undo", 480 - 24 * 4, 0, 24, 24);
  redo = new Button("redo", 480 - 24 * 3, 0, 24, 24);
  download = new Button("download", 480 - 24 * 2, 24, 24, 24);

  initialClick = { x: 0, y: 0 };

  noSmooth();
}

function draw() {
  background(32);
  // fps = frameCount % 20 == 0 ? round(frameRate()) : fps;

  palette.colors[selected.index[0]][selected.index[1]] = color(
    NicNaksReallyCoolColorPickerThatHeDefinatelyDidntJustCopyFromP5.color()
  );

  selected.color = palette.colors[selected.index[0]][selected.index[1]];

  image(artBackground, width / 2 - 240, height / 2 - 240 + 32, 480, 480);
  image(art, width / 2 - 240, height / 2 - 240 + 32, 480, 480);
  image(overlay, width / 2 - 240, height / 2 - 240 + 32, 480, 480);

  push();
  translate(width / 2 - 240, height / 2 - 240 - 32);
  for (let i = 0; i < palette.w; i++) {
    for (let j = 0; j < palette.h; j++) {
      palette.display(i, j);
    }
  }

  if (!selected.erase) {
    noFill();
    stroke(255);
    strokeWeight(3);
    square(selected.index[0] * 24, selected.index[1] * 24, 24);
    stroke(selected.color);
    strokeWeight(1);
    square(selected.index[0] * 24, selected.index[1] * 24, 24);
  }

  eraser.display();
  rectBrush.display();
  undo.display();
  redo.display();
  download.display();
  pop();

  // for (let i = 0; i < dim.w; i++) {
  //   for (let j = 0; j < dim.h; j++) {
  //     art.set(i.j, color(overlay.get(i, j)));
  //     overlay.set(i, j, color(0, 0, 0, 0));
  //   }
  // }
  // overlay.updatePixels();

  // rect(0, 0, 15, 12);
  // text(fps, 1, 10);
}

function mousePressed() {
  let x = map(mouseX, width / 2 - 240, width / 2 + 240, 0, 480);
  let y = map(mouseY, height / 2 - 240 - 32, height / 2 + 240 + 32, 0, 544);
  mx = map(pmouseX, width / 2 - 240, width / 2 + 240, 0, dim.w);
  my = map(pmouseY, height / 2 - 240 + 32, height / 2 + 240 + 32, 0, dim.h);

  initialClick.x = mx;
  initialClick.y = my;

  if (eraser.clicked(x, y)) selected.erase = !selected.erase;
  if (rectBrush.clicked(x, y)) selected.drawRect = !selected.drawRect;
  if (undo.clicked(x, y)) doUndo();
  if (redo.clicked(x, y)) doRedo();
  if (download.clicked(x, y)) art.save("Pixel_Art.png");

  x = floor(
    map(mouseX, width / 2 - 240, width / 2 - 240 + palette.w * 24, 0, palette.w)
  );
  y = floor(
    map(
      mouseY,
      height / 2 - 240 - 32,
      height / 2 - 240 - 32 + palette.h * 24,
      0,
      palette.h
    )
  );

  if (!inBox(x, y, 0, 0, palette.w, palette.h)) return;

  selected.erase = false;
  selected.color = palette.colors[x][y];
  selected.index = [x, y];
  NicNaksReallyCoolColorPickerThatHeDefinatelyDidntJustCopyFromP5.remove();
  NicNaksReallyCoolColorPickerThatHeDefinatelyDidntJustCopyFromP5 = createColorPicker(
    selected.color
  ).position(width / 2 + 20, height / 2 - 240 - 24);
}

function mouseReleased() {
  if (isDrawing < 1) return;

  for (let i = 0; i < dim.w; i++) {
    for (let j = 0; j < dim.h; j++) {
      let c = overlay.get(i, j);
      if (!selected.erase && c[3] > 0) art.set(i, j, color(c));
      else if (c[3] > 0) art.set(i, j, color(0, 0, 0, 0));
      overlay.set(i, j, color(0, 0, 0, 0));
    }
  }
  overlay.updatePixels();
  art.updatePixels();

  history.splice(historyIndex + 1, Infinity);
  let newArt = createImage(dim.w, dim.h);
  // newArt.loadPixels();
  for (let i = 0; i < dim.w; i++) {
    for (let j = 0; j < dim.h; j++) {
      newArt.set(i, j, art.get(i, j));
    }
  }
  newArt.updatePixels();
  history.push(newArt);
  historyIndex++;
  // console.log(isDrawing);

  isDrawing = 0;
}

function mouseDragged() {
  pmx = mx;
  pmy = my;
  mx = map(pmouseX, width / 2 - 240, width / 2 + 240, 0, dim.w);
  my = map(pmouseY, height / 2 - 240 + 32, height / 2 + 240 + 32, 0, dim.h);

  if (inBox(mx, my, 0, 0, dim.w, dim.h)) isDrawing++;

  if (isDrawing > 1) {
    let x0 = floor(pmx);
    let y0 = floor(pmy);
    let x1 = floor(mx);
    let y1 = floor(my);

    if (!inBox(x0, y0, 0, 0, dim.w, dim.h)) return;

    if (selected.drawRect) drawRect(initialClick.x, initialClick.y, mx, my);
    else drawLine(x0, y0, x1, y1);
  }
}

function doUndo() {
  if (historyIndex <= 0) return;

  historyIndex--;
  art = createImage(dim.w, dim.h);
  for (let i = 0; i < dim.w; i++) {
    for (let j = 0; j < dim.h; j++) {
      art.set(i, j, history[historyIndex].get(i, j));
    }
  }
  art.updatePixels();
}

function doRedo() {
  if (historyIndex >= history.length - 1) return;

  historyIndex++;
  art = createImage(dim.w, dim.h);
  for (let i = 0; i < dim.w; i++) {
    for (let j = 0; j < dim.h; j++) {
      art.set(i, j, history[historyIndex].get(i, j));
    }
  }
  art.updatePixels();
}

function inBox(x, y, minX, minY, maxX, maxY) {
  return x >= minX && y >= minY && x < maxX && y < maxY;
}

function drawLine(x0, y0, x1, y1) {
  const dx = abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let t = 0;

  while (t < 100) {
    t++;

    if (!inBox(x0, y0, 0, 0, dim.w, dim.h)) break;
    // if (selected.erase) art.set(x0, y0, color(0, 0, 0, 0));
    // else art.set(x0, y0, selected.color);
    if (!selected.erase) overlay.set(x0, y0, selected.color);
    else overlay.set(x0, y0, color(255, 255, 255, 255));

    if (x0 == x1 && y0 == y1) break;

    let e2 = error << 1;

    if (e2 >= dy) {
      if (x0 == x1) break;
      error += dy;
      x0 += sx;
    }

    if (e2 <= dx) {
      if (y0 == y1) break;
      error += dx;
      y0 += sy;
    }
  }

  overlay.updatePixels();
}

function drawRect(x0, y0, x1, y1) {
  let x = min(x0, x1);
  let y = min(y0, y1);
  let X = max(x0, x1);
  let Y = max(y0, y1);
  // for (let i = x; i <= X; i++) {
  // for (let j = y; j <= Y; j++) {
  for (let i = 0; i < dim.w; i++) {
    for (let j = 0; j < dim.h; j++) {
      if (inBox(i, j, x - 1, y - 1, X, Y)) {
        if (!selected.erase) overlay.set(i, j, selected.color);
        else overlay.set(i, j, color(255, 255, 255, 255));
      } else overlay.set(i, j, color(0, 0, 0, 0));
    }
  }
  overlay.updatePixels();
}

class Grid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.cells = [];
    for (let i = 0; i < w; i++) {
      this.cells.push([]);
      for (let j = 0; j < h; j++) {
        // this.cells[i].push(new Color((((i + j) % 2) + 15) / 16, 1));
        // this.cells[i].push(new Color(0, 0, 0, 0));
        this.cells[i].push(color(0, 0, 0, 0));
      }
    }
    this.showGrid = false;
  }
}

class ColorPalette {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.colors = [];
    colorMode(HSB);
    for (let i = 0; i < w; i++) {
      this.colors.push([]);
      for (let j = 0; j < h; j++) {
        // this.colors[i].push(new Color(random(), random(), random()));
        if (i < 6)
          this.colors[i].push(color((i * 360) / 6, 100, 50 * (2 - j), 1));
        else
          this.colors[i].push(
            color(0, 0, ((9 - i + (1 - j) * 4) * 100) / 7, 1)
          );
      }
    }
    colorMode(RGB);
    this.selected = false;
  }

  display(x, y) {
    push();
    noStroke();
    fill(this.colors[x][y]);
    square(x * 24, y * 24, 24);
    pop();
  }
}

class Button {
  constructor(name, x, y, w, h) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  clicked(x, y) {
    return inBox(x, y, this.x, this.y, this.x + this.w, this.y + this.h);
  }

  display() {
    push();
    translate(this.x, this.y);
    strokeJoin(ROUND);
    switch (this.name) {
      case "eraser":
        if (selected.erase) {
          stroke(64);
          strokeWeight(2);
          fill(128);
        } else {
          stroke(64);
          strokeWeight(2);
          fill(96);
        }
        rect(0, 0, this.w, this.h);
        stroke(220, 100, 160);
        fill(260, 120, 200);
        quad(5, 12, 4, 16, 10, 17, 11, 13);
        quad(10, 17, 11, 13, 20, 9, 19, 13);
        quad(5, 12, 11, 13, 20, 9, 14, 8);
        break;
      case "rect":
        if (selected.drawRect) {
          stroke(64);
          strokeWeight(2);
          fill(128);
        } else {
          stroke(64);
          strokeWeight(2);
          fill(96);
        }
        rect(0, 0, this.w, this.h);
        stroke(60, 128, 220);
        fill(80, 160, 255);
        rect(6, 7, this.w - 12, this.h - 14);
        break;
      case "download":
        stroke(64);
        strokeWeight(2);
        fill(96);
        rect(0, 0, this.w, this.h);
        stroke(32, 160, 64);
        line(6, this.h - 10, 6, this.h - 6);
        line(this.w - 6, this.h - 10, this.w - 6, this.h - 6);
        line(6, this.h - 6, this.w - 6, this.h - 6);
        line(this.w / 2, 6, this.w / 2, this.h - 10);
        line(this.w / 2 - 3, this.h - 13, this.w / 2, this.h - 10);
        line(this.w / 2 + 3, this.h - 13, this.w / 2, this.h - 10);
        break;
      case "undo":
        stroke(64);
        strokeWeight(2);
        fill(96);
        rect(0, 0, this.w, this.h);
        stroke(220);
        line(6, this.h / 2, this.w - 6, this.h / 2);
        line(6, this.h / 2, 9, this.h / 2 - 3);
        line(6, this.h / 2, 9, this.h / 2 + 3);
        break;
      case "redo":
        stroke(64);
        strokeWeight(2);
        fill(96);
        rect(0, 0, this.w, this.h);
        stroke(220);
        line(6, this.h / 2, this.w - 6, this.h / 2);
        line(this.w - 6, this.h / 2, this.w - 9, this.h / 2 - 3);
        line(this.w - 6, this.h / 2, this.w - 9, this.h / 2 + 3);
        break;
    }
    pop();
  }
}
