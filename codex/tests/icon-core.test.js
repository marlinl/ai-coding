const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const coreScript = html.match(/<script id="icon-core">([\s\S]*?)<\/script>/);
assert.ok(coreScript, 'inline icon-core script was not found');
const sandbox = { window: {}, DataView, Uint8Array };
vm.runInNewContext(coreScript[1], sandbox);

const {
  assertPlatformRatios,
  centeredLayerRect,
  coverageMargins,
  coverScaleForRotation,
  extensionForImage,
  fittedLayerRect,
  pngUsesTransparency,
  releaseIconVariants,
  requiredLayersReady,
  resolveLayer,
  sanitizeBaseName,
  sourceCropPercent
} = sandbox.window.IconCore;

const platforms = {
  ios: { width: 1024, height: 1024 },
  tvos: { width: 800, height: 480 },
  watchos: { width: 1088, height: 1088 }
};

assert.doesNotThrow(() => assertPlatformRatios(platforms));
assert.throws(() => assertPlatformRatios({ ...platforms, tvos: { width: 16, height: 10 } }));

const coverageCases = [
  [1024, 1024, 1024, 1024],
  [1600, 900, 1024, 1024],
  [900, 1600, 800, 480],
  [2048, 1024, 1088, 1088]
];

for (const [imageWidth, imageHeight, canvasWidth, canvasHeight] of coverageCases) {
  for (let rotation = -180; rotation <= 180; rotation += 1) {
    const imageScale = coverScaleForRotation(imageWidth, imageHeight, canvasWidth, canvasHeight, rotation);
    const margins = coverageMargins({
      imageWidth,
      imageHeight,
      canvasWidth,
      canvasHeight,
      rotation,
      imageScale
    });
    assert.ok(margins.horizontal >= -1e-7, `horizontal coverage failed at ${rotation} degrees`);
    assert.ok(margins.vertical >= -1e-7, `vertical coverage failed at ${rotation} degrees`);
  }
}

assert.ok(Math.abs(coverScaleForRotation(1024, 1024, 1024, 1024, 45) - Math.SQRT2) < 1e-12);
assert.ok(Math.abs(sourceCropPercent(1024, 1024, 800, 480) - 0.4) < 1e-12);
const halfLayer = centeredLayerRect(1024, 1024, 50);
assert.equal(halfLayer.x, 256);
assert.equal(halfLayer.y, 256);
assert.equal(halfLayer.width, 512);
assert.equal(halfLayer.height, 512);
const enlargedLayer = centeredLayerRect(800, 480, 150);
assert.equal(enlargedLayer.x, -200);
assert.equal(enlargedLayer.y, -120);
assert.equal(enlargedLayer.width, 1200);
assert.equal(enlargedLayer.height, 720);
assert.throws(() => centeredLayerRect(1024, 1024, 0));
const tvContainedLayer = fittedLayerRect(1024, 1024, 800, 480, 100, 'contain');
assert.equal(tvContainedLayer.x, 160);
assert.equal(tvContainedLayer.y, 0);
assert.equal(tvContainedLayer.width, 480);
assert.equal(tvContainedLayer.height, 480);
const tvCoveredLayer = fittedLayerRect(1024, 1024, 800, 480, 100, 'cover');
assert.equal(tvCoveredLayer.x, 0);
assert.equal(tvCoveredLayer.y, -160);
assert.equal(tvCoveredLayer.width, 800);
assert.equal(tvCoveredLayer.height, 800);
assert.throws(() => fittedLayerRect(1024, 1024, 800, 480, 100, 'stretch'));
assert.equal(sanitizeBaseName('../../My\\Icon.png'), 'My-Icon');
assert.equal(sanitizeBaseName('...'), 'app-icon');

assert.equal(extensionForImage({ name: 'Layer.SVG', type: '' }), 'svg');
assert.equal(extensionForImage({ name: 'Layer.bin', type: 'image/png' }), 'png');
assert.equal(extensionForImage({ name: 'Layer.jpg', type: 'image/jpeg' }), null);

const defaultBackground = { id: 'default-background' };
const defaultForeground = { id: 'default-foreground' };
const darkForeground = { id: 'dark-foreground' };
const sources = {
  default: {
    background: defaultBackground,
    middle: null,
    foreground: defaultForeground
  },
  dark: {
    background: null,
    middle: null,
    foreground: darkForeground
  }
};
assert.equal(requiredLayersReady(sources), true);
assert.equal(requiredLayersReady({ ...sources, default: { ...sources.default, foreground: null } }), false);
assert.equal(resolveLayer(sources, 'dark', 'background'), defaultBackground);
assert.equal(resolveLayer(sources, 'dark', 'foreground'), darkForeground);
assert.equal(resolveLayer(sources, 'dark', 'middle'), null);

const releaseVariants = Array.from(releaseIconVariants(), (variant) => ({ ...variant }));
assert.equal(releaseVariants.length, 10);
assert.deepEqual(releaseVariants.map(({ pointSize, scale }) => `${pointSize}pt@${scale}x`), [
  '16pt@1x',
  '16pt@2x',
  '32pt@1x',
  '32pt@2x',
  '128pt@1x',
  '128pt@2x',
  '256pt@1x',
  '256pt@2x',
  '512pt@1x',
  '512pt@2x'
]);
assert.deepEqual(releaseVariants.map(({ pixelSize }) => pixelSize), [
  16,
  32,
  32,
  64,
  128,
  256,
  256,
  512,
  512,
  1024
]);
assert.equal(new Set(releaseVariants.map(({ pointSize, scale }) => `${pointSize}-${scale}`)).size, 10);

function pngHeader(colorType) {
  const bytes = new Uint8Array(45);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  new DataView(bytes.buffer).setUint32(8, 13);
  bytes.set([73, 72, 68, 82], 12);
  bytes[25] = colorType;
  new DataView(bytes.buffer).setUint32(33, 0);
  bytes.set([73, 68, 65, 84], 37);
  return bytes;
}

assert.equal(pngUsesTransparency(pngHeader(2)), false);
assert.equal(pngUsesTransparency(pngHeader(6)), true);

console.log('inline icon-core invariants passed');
