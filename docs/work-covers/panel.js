// node panel.js <spec.json>  -> writes <name>.html for each spec entry, then render.js them.
// spec: [{ name, tone: paper|lime|blue|ink|forest|stone, caption, title (html), layout: cols|rows|flow, items: [...] , coord }]
const fs = require('fs');
const path = require('path');

const tones = {
  paper: { bg: '#e9ece5', fg: '#202523', card: '#f7f7f2', sub: '#4f5a4c', mute: '#6b7668', cmd: '#202523', cmdFg: '#eef0e9', hi: '#234dda' },
  lime: { bg: '#d9eba7', fg: '#374730', card: '#f4f8e6', sub: '#4f5a4c', mute: '#5c6948', cmd: '#374730', cmdFg: '#eef4d8', hi: '#335aeb' },
  stone: { bg: '#dfe3da', fg: '#202523', card: '#f7f7f2', sub: '#4f5a4c', mute: '#6b7668', cmd: '#202523', cmdFg: '#eef0e9', hi: '#335aeb' },
  ink: { bg: '#202523', fg: '#f7f7f2', card: '#2b312e', sub: '#c3c9c0', mute: '#9aa39a', cmd: '#151917', cmdFg: '#eef0e9', hi: '#335aeb' },
  forest: { bg: '#1f292c', fg: '#eef0e9', card: '#283337', sub: '#c2cbc9', mute: '#93a09f', cmd: '#151c1e', cmdFg: '#eef0e9', hi: '#335aeb' },
  blue: { bg: '#234dda', fg: '#f2f5ff', card: '#2f59e6', sub: '#d3ddff', mute: '#b8c8ff', cmd: '#1a3cb0', cmdFg: '#eef2ff', hi: '#202523' },
};

function html(spec) {
  const t = tones[spec.tone || 'paper'];
  let body = '';
  if (spec.layout === 'rows') {
    body = `<div class="rows">${spec.items
      .map((it) => `<div class="row"><span class="a">${it.a}</span><span class="arrow">${it.arrow || '→'}</span><span class="b">${it.b}</span>${it.c ? `<span class="c">${it.c}</span>` : ''}</div>`)
      .join('')}</div>`;
  } else if (spec.layout === 'flow') {
    body = `<div class="flow">${spec.items
      .map((it, i) => `<div class="step${it.hi ? ' hi' : ''}"><small>${String(i + 1).padStart(2, '0')}</small><h2>${it.h}</h2><p>${it.p || ''}</p></div>${i < spec.items.length - 1 ? '<span class="link">→</span>' : ''}`)
      .join('')}</div>`;
  } else {
    body = `<div class="cols" style="grid-template-columns: repeat(${spec.items.length}, 1fr)">${spec.items
      .map((it) => `<div class="col${it.hi ? ' hi' : ''}"><small>${it.small}</small><h2>${it.h}</h2><p>${it.p}</p>${it.cmd ? `<div class="cmd">${it.cmd}</div>` : ''}</div>`)
      .join('')}</div>`;
  }
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="base.css"><style>
.art { background: ${t.bg}; color: ${t.fg}; }
h1 { position: absolute; left: 72px; top: 130px; font-size: 76px; font-weight: 480; letter-spacing: -0.055em; line-height: 1.08; }
h1 .blue { color: ${spec.tone === 'blue' ? '#202523' : '#335aeb'}; }
.cols { position: absolute; left: 72px; right: 72px; top: 400px; display: grid; gap: 32px; }
.col { background: ${t.card}; border-radius: 26px; padding: 40px 38px 44px; min-height: 470px; box-shadow: 0 40px 80px -50px rgba(23,39,61,.35); display: flex; flex-direction: column; }
.col small, .step small { font-family: "Geist Mono", monospace; font-size: 17px; letter-spacing: 2px; color: ${t.mute}; }
.col h2 { font-size: 38px; font-weight: 550; letter-spacing: -1px; margin-top: 22px; }
.col p { font-size: 21px; line-height: 1.65; color: ${t.sub}; margin-top: 16px; }
.cmd { margin-top: auto; font-family: "Geist Mono", monospace; font-size: 21px; background: ${t.cmd}; color: ${t.cmdFg}; border-radius: 14px; padding: 18px 22px; }
.col.hi { background: ${t.hi}; color: #f2f5ff; } .col.hi small, .col.hi p { color: #d3ddff; } .col.hi .cmd { background: rgba(0,0,0,.22); }
.rows { position: absolute; left: 72px; right: 72px; top: 420px; display: grid; gap: 20px; }
.row { display: grid; grid-template-columns: 380px 70px 1fr auto; align-items: center; background: ${t.card}; border-radius: 22px; padding: 30px 36px; font-size: 26px; box-shadow: 0 30px 60px -45px rgba(23,39,61,.45); }
.row .a { font-weight: 600; } .row .arrow { color: #335aeb; font-size: 30px; } .row .b { color: ${t.sub}; }
.row .c { font-family: "Geist Mono", monospace; font-size: 17px; letter-spacing: 1px; color: ${t.mute}; border: 2px solid currentColor; border-radius: 30px; padding: 8px 16px; }
.flow { position: absolute; left: 72px; right: 72px; top: 430px; display: flex; align-items: stretch; gap: 18px; }
.step { flex: 1; background: ${t.card}; border-radius: 24px; padding: 32px 28px; min-height: 290px; box-shadow: 0 30px 60px -45px rgba(23,39,61,.45); }
.step h2 { font-size: 30px; font-weight: 550; letter-spacing: -0.8px; margin-top: 18px; line-height: 1.25; }
.step p { font-size: 19px; line-height: 1.6; color: ${t.sub}; margin-top: 14px; }
.step.hi { background: ${t.hi}; color: #f2f5ff; } .step.hi small, .step.hi p { color: #d3ddff; }
.link { align-self: center; font-size: 30px; color: #335aeb; }
</style></head><body><div class="art"><span class="caption">${spec.caption}</span><h1>${spec.title}</h1>${body}${spec.coord ? `<span class="coord">${spec.coord}</span>` : ''}</div></body></html>`;
}

const specs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
for (const spec of specs) {
  fs.writeFileSync(path.join(__dirname, spec.name + '.html'), html(spec));
  console.log(spec.name + '.html');
}
