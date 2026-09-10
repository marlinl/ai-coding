const CHANNEL_SAMPLE_COUNT = 16;
const CHANNEL_VALUES = Array.from(
  { length: CHANNEL_SAMPLE_COUNT },
  (_, index) => Math.round(index * 255 / (CHANNEL_SAMPLE_COUNT - 1))
);
const colorGrid = document.getElementById('colorGrid');
const pantoneStrip = document.getElementById('pantoneStrip');
const totalCount = document.getElementById('totalCount');
const stepInfo = document.getElementById('stepInfo');
const visibleRange = document.getElementById('visibleRange');
const rangeLabel = document.getElementById('rangeLabel');

const pantoneColors = [
  { name: 'Peach Fuzz 13-1023', rgb: [255, 190, 152] },
  { name: 'Viva Magenta 18-1750', rgb: [190, 52, 85] },
  { name: 'Very Peri 17-3938', rgb: [102, 103, 171] },
  { name: 'Illuminating 13-0647', rgb: [245, 223, 77] },
  { name: 'Ultimate Gray 17-5104', rgb: [147, 149, 151] },
  { name: 'Classic Blue 19-4052', rgb: [15, 76, 129] },
  { name: 'Living Coral 16-1546', rgb: [255, 111, 97] },
  { name: 'Ultra Violet 18-3838', rgb: [95, 75, 139] },
  { name: 'Greenery 15-0343', rgb: [136, 176, 75] },
  { name: 'Rose Quartz 13-1520', rgb: [247, 202, 201] },
  { name: 'Serenity 15-3919', rgb: [146, 168, 209] },
  { name: 'Marsala 18-1438', rgb: [149, 82, 81] },
  { name: 'Radiant Orchid 18-3224', rgb: [181, 101, 167] },
  { name: 'Emerald 17-5641', rgb: [0, 155, 119] },
  { name: 'Tangerine Tango 17-1463', rgb: [221, 65, 36] },
  { name: 'Honeysuckle 18-2120', rgb: [214, 80, 118] },
  { name: 'Turquoise 15-5519', rgb: [69, 181, 170] },
  { name: 'Mimosa 14-0848', rgb: [239, 192, 80] },
  { name: 'Blue Iris 18-3943', rgb: [91, 94, 166] },
  { name: 'Chili Pepper 19-1557', rgb: [155, 27, 48] },
  { name: 'Sand Dollar 13-1106', rgb: [223, 207, 190] },
  { name: 'Blue Turquoise 15-5217', rgb: [85, 180, 176] },
  { name: 'Tigerlily 17-1456', rgb: [225, 93, 68] },
  { name: 'Aqua Sky 14-4811', rgb: [127, 205, 205] },
  { name: 'True Red 19-1664', rgb: [188, 36, 60] },
  { name: 'Fuchsia Rose 17-2031', rgb: [195, 68, 122] },
  { name: 'Cerulean 15-4020', rgb: [155, 183, 212] },
  { name: 'PANTONE 306 C', rgb: [0, 181, 226] },
  { name: 'PANTONE 3252 C', rgb: [44, 213, 196] },
  { name: 'PANTONE 320 C', rgb: [0, 156, 166] },
  { name: 'PANTONE 3115 C', rgb: [0, 193, 213] }
];

const pantoneByHex = new Map(
  pantoneColors.map((item) => [rgbToHex(...item.rgb), item.name])
);

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function toHex(value) {
  return value.toString(16).padStart(2, '0').toUpperCase();
}

function rgbToHex(r, g, b) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function luminance(r, g, b) {
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

function hue(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  if (max === r) return ((g - b) / delta + (g < b ? 6 : 0)) * 60;
  if (max === g) return ((b - r) / delta + 2) * 60;
  return ((r - g) / delta + 4) * 60;
}

function colorCard(r, g, b, name = null) {
  const hex = rgbToHex(r, g, b);
  const pantoneName = name || pantoneByHex.get(hex);
  const isPantone = Boolean(pantoneName);
  return `
    <article class="color-card${isPantone ? ' pantone' : ''}" style="--color: rgb(${r}, ${g}, ${b});">
      <div class="swatch"></div>
      <div class="color-info">
        <div class="color-name">
          <strong>${pantoneName || hex}</strong>
          ${isPantone ? '<span class="tag">Pantone</span>' : ''}
        </div>
        <div class="rgb">RGB ${r}, ${g}, ${b}</div>
        <div class="hex">HEX ${hex}</div>
      </div>
    </article>
  `;
}

function renderPantoneStrip() {
  pantoneStrip.innerHTML = pantoneColors
    .map((item) => colorCard(...item.rgb, item.name))
    .join('');
}

function renderSamples() {
  const samples = [];
  for (const r of CHANNEL_VALUES) {
    for (const g of CHANNEL_VALUES) {
      for (const b of CHANNEL_VALUES) {
        samples.push({ r, g, b, luminance: luminance(r, g, b), hue: hue(r, g, b) });
      }
    }
  }

  samples.sort((a, b) => (
    a.luminance - b.luminance ||
    a.hue - b.hue ||
    a.r - b.r ||
    a.g - b.g ||
    a.b - b.b
  ));

  const cards = samples.map((item) => colorCard(item.r, item.g, item.b));

  colorGrid.innerHTML = cards.join('');
  totalCount.textContent = formatNumber(cards.length);
  stepInfo.textContent = CHANNEL_SAMPLE_COUNT;
  visibleRange.textContent = `${rgbToHex(0, 0, 0)} - ${rgbToHex(255, 255, 255)}`;
  rangeLabel.textContent = `${formatNumber(cards.length)} 个色块`;
}

renderPantoneStrip();
renderSamples();
