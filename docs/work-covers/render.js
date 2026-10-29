// node render.js <name.html> <out.webp> [more pairs...]
const path = require('path');
const { chromium } = require('C:/Users/SIMJAE/AppData/Local/Temp/pwtool/node_modules/playwright');
const c = require('./compose.js');

(async () => {
  const pairs = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
  for (let i = 0; i < pairs.length; i += 2) {
    const file = path.resolve(__dirname, pairs[i]);
    await page.goto('file:///' + file.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const buf = await page.screenshot();
    console.log(await c.desktop(buf, pairs[i + 1], { position: 'centre' }));
  }
  await browser.close();
})();
