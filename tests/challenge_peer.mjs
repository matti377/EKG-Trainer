// Browser protocol peer for the native app's cross-platform integration test.
// Uses the actual browser transport, content, shuffle and question builder.
import fs from 'node:fs';
import vm from 'node:vm';
import readline from 'node:readline';
const root = new URL('../', import.meta.url);
const window = { location: { protocol: 'http:' } };
const context = vm.createContext({ window, URL, AbortController, setTimeout, clearTimeout, fetch });
for (const file of ['content', 'ui', 'challenge']) {
  vm.runInContext(fs.readFileSync(new URL(`assets/js/${file}.js`, root), 'utf8'), context);
}
context.CONTENT = window.CONTENT;
context.UI = window.UI;
context.state = { mmPerSec: 50 };
const app = fs.readFileSync(new URL('assets/js/app.js', root), 'utf8');
vm.runInContext(app.slice(app.indexOf('  function buildQuestions('), app.indexOf('  /* ---------------------------------------------------------------- Labor */')), context);
const protocol = window.ChallengeProtocol;
let base = process.argv[2], code, player, token;
for await (const line of readline.createInterface({ input: process.stdin })) {
  try {
    const cmd = JSON.parse(line);
    let result;
    if (cmd.op === 'host') {
      base = await protocol.resolve([base]);
      result = await protocol.request(base, 'lobby', { name: 'Web Host', seconds: 20 });
      ({ code, player, token } = result);
    } else if (cmd.op === 'join') {
      code = cmd.code;
      result = await protocol.request(base, 'join', { code, name: 'Web Player' });
      player = result.player;
    } else if (cmd.op === 'start') {
      result = await protocol.request(base, 'start', { code, token, questions: context.buildQuestions(5, 'alle') });
    } else if (cmd.op === 'answer') {
      result = await protocol.request(base, 'answer', { code, player, q: cmd.q, index: cmd.index });
    } else if (cmd.op === 'state') {
      result = await protocol.request(base, `state?code=${code}&player=${player}`);
    } else if (cmd.op === 'leave') {
      result = await protocol.request(base, token ? 'close' : 'leave', token ? { code, token } : { code, player });
    }
    process.stdout.write(JSON.stringify({ result }) + '\n');
  } catch (error) {
    process.stdout.write(JSON.stringify({ error: error.message, status: error.status }) + '\n');
  }
}
