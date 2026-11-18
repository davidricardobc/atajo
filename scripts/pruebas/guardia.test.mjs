import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearKit, borrarKit, correr } from './ayuda.mjs';
import { decidir, nombreEsSecreto, secretoEnComando, grepSobreTodo } from '../guardia.mjs';

const bash = (command) => ({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } });
const ps = (command) => ({ hook_event_name: 'PreToolUse', tool_name: 'PowerShell', tool_input: { command } });

test('pide confirmación para publicar o descartar trabajo (Bash)', () => {
  for (const comando of [
    'git push origin main',
    'git push --force',
    'git -C C:\\proyecto push',
    'git -C . push origin main',
    'git -c user.name=x push',
    'cd app && git push',
    'git reset --hard HEAD~1',
    'git clean -fd',
    'git clean -d -f',
    'git clean -xdf',
    'git checkout -- .',
    'git checkout .',
    'git restore .',
    'git restore --worktree src',
    'git stash drop',
    'git stash clear',
    'git branch -D rama',
    'vercel --prod',
    'netlify deploy --prod',
    'az webapp deploy --name x',
    'gh release create v0.1',
    'rm -rf dist',
    'rm -r carpeta',
    'rm --recursive carpeta',
    'rm -f -r carpeta',
    'npm publish',
  ]) {
    const d = decidir(bash(comando));
    assert.ok(d, `debía decidir algo para: ${comando}`);
    assert.equal(d.permissionDecision, 'ask', comando);
    assert.match(d.permissionDecisionReason, /Atajo pide confirmación/);
  }
});

test('trata PowerShell igual que Bash: publicar y borrar piden sí', () => {
  for (const comando of [
    'git push origin main',
    'git -C . push',
    'Remove-Item -Recurse -Force .\\build',
    'Remove-Item -r build',
    'ri -Recurse build',
    'rd /s /q build',
    'rmdir /s build',
    'del /s *.tmp',
    'del /q archivo.txt',
    'vercel deploy',
  ]) {
    const d = decidir(ps(comando));
    assert.ok(d, `debía decidir algo para: ${comando}`);
    assert.equal(d.permissionDecision, 'ask', comando);
  }
});

test('deja pasar comandos de trabajo normal', () => {
  for (const comando of [
    'git status', 'git commit -m "x"', 'git stash', 'git stash pop', 'git stash list', 'git checkout rama',
    'git restore --staged archivo.md', 'git reset HEAD~1', 'git clean -n', 'git branch -d rama',
    'node scripts/indice.mjs', 'ls -la', 'npm test', 'rm archivo.txt', 'cat perfil/voz.md', 'git pull',
    'grep -r TODO scripts/', 'grep -rn "x" src --exclude-dir=node_modules', 'rmdir vacia',
  ]) {
    assert.equal(decidir(bash(comando)), null, comando);
  }
  for (const comando of ['Get-Content perfil/voz.md', 'Remove-Item archivo.txt', 'Get-ChildItem', 'git status']) {
    assert.equal(decidir(ps(comando)), null, comando);
  }
});

test('find: listar pasa; -exec sobre un secreto se bloquea y borrar en bloque pide sí', () => {
  assert.equal(decidir(bash('find . -name "*.md"')), null);
  assert.equal(decidir(bash('find . -name .env')), null, 'solo nombres');
  assert.equal(decidir(bash('find . -name .env -exec cat {} \\;'))?.permissionDecision, 'deny');
  assert.equal(decidir(bash('find . -name "*.tmp" -delete'))?.permissionDecision, 'ask');
  assert.equal(decidir(bash('find . -name "*.log" -exec rm {} +'))?.permissionDecision, 'ask');
});

test('bloquea secretos en Bash, PowerShell y herramientas de archivo', () => {
  for (const comando of [
    'cat .env',
    'cat ./.env',
    'cat .env.local',
    'cat .envrc',
    'cat ~/.ssh/id_rsa',
    'cat servidor.key',
    'cat cert.p12',
    'cat cert.pfx',
    'cat secrets.json',
    'cat config/secrets.yaml',
    'echo hola; cat .env',
    'ls && cat .env',
    'cat .env | grep KEY',
    'cat .e*',
    'cat .env*',
    'cat .en?',
    'cp .env /tmp/x',
    'cat < .env',
    'cat<.env',
    'node -e "console.log(require(\'fs\').readFileSync(\'.env\',\'utf8\'))"',
    'python -c "print(open(\'.env\').read())"',
    'git show HEAD:.env',
    'git log -p -- .env',
    'git add .env',
  ]) {
    const d = decidir(bash(comando));
    assert.ok(d, `debía bloquear: ${comando}`);
    assert.equal(d.permissionDecision, 'deny', comando);
  }
  for (const comando of [
    'Get-Content C:\\proyecto\\.env.local',
    'gc .env',
    'type .\\certs\\servidor.pem',
    'Get-Content .env*',
    'Copy-Item .env C:\\tmp\\',
    'Get-Content credentials.json',
  ]) {
    assert.equal(decidir(ps(comando))?.permissionDecision, 'deny', comando);
  }
  assert.equal(decidir({ tool_name: 'Read', tool_input: { file_path: '/home/ana/app/.env' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'Read', tool_input: { file_path: 'C:\\Users\\x\\atajo\\.env' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'Edit', tool_input: { file_path: 'C:\\app\\credentials.json' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'Write', tool_input: { file_path: 'secrets.json' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'MultiEdit', tool_input: { file_path: 'config/.env.production' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'NotebookEdit', tool_input: { notebook_path: 'C:\\x\\credentials.ipynb' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'Grep', tool_input: { pattern: 'KEY', path: 'config/.env.production' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'Grep', tool_input: { pattern: 'KEY', glob: '.env*' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'Grep', tool_input: { pattern: 'KEY', glob: '**/*.pem' } }).permissionDecision, 'deny');
  assert.equal(decidir({ tool_name: 'Grep', tool_input: { pattern: 'KEY', glob: '*.md' } }), null);
});

test('los comandos que solo listan nombres sí pueden mencionar secretos (/seguridad y /auditoria)', () => {
  for (const comando of [
    'git check-ignore -v .env',
    'git check-ignore -v .env perfil clientes',
    'git ls-files | grep -iE "\\.env|\\.pem"',
    'git ls-files .env',
    "git log --all --format='%h %ad' --date=short --name-only -- '*.env' '.env*' '*.pem'",
    'ls -la .env',
    'ls .env*',
    'test -f .env && echo existe',
    '[ -f .env ] && echo existe',
    'find . -name ".env" -o -name "*.pem"',
    'stat .env',
    'git status .env',
    'git rm --cached .env',
    'git diff --name-only HEAD~1 -- .env',
  ]) {
    assert.equal(decidir(bash(comando)), null, comando);
  }
  for (const comando of ['Test-Path .env', 'Get-ChildItem -Force .env*', 'gci -Recurse -Filter *.pem', 'Get-Item .env']) {
    assert.equal(decidir(ps(comando)), null, comando);
  }
});

test('grep recursivo sin ruta o sobre la raíz pide confirmación; con carpeta pasa', () => {
  assert.equal(grepSobreTodo('grep -r CLAVE'), true);
  assert.equal(grepSobreTodo('grep -r CLAVE .'), true);
  assert.equal(grepSobreTodo('grep -rn "sk-" /'), true);
  assert.equal(grepSobreTodo('grep -R CLAVE ~'), true);
  assert.equal(grepSobreTodo('grep -r CLAVE scripts/'), false);
  assert.equal(grepSobreTodo('grep -r CLAVE . --exclude=.env*'), false);
  assert.equal(grepSobreTodo('grep CLAVE archivo.md'), false);
  assert.equal(grepSobreTodo('rg CLAVE'), false, 'rg respeta .gitignore y no se frena');
  const d = decidir(bash('grep -r CLAVE .'));
  assert.equal(d.permissionDecision, 'ask');
  assert.match(d.permissionDecisionReason, /grep recursivo/);
  assert.equal(decidir(ps('grep -r CLAVE .')).permissionDecision, 'ask');
});

test('los ejemplos de .env y las llaves públicas no se bloquean', () => {
  assert.equal(nombreEsSecreto('.env.example'), null);
  assert.equal(nombreEsSecreto('.env.plantilla'), null);
  assert.equal(nombreEsSecreto('id_rsa.pub'), null);
  assert.equal(nombreEsSecreto('.env'), '.env');
  assert.equal(nombreEsSecreto('.envrc'), '.envrc');
  assert.equal(nombreEsSecreto('llave.pem'), '*.pem');
  assert.equal(nombreEsSecreto('servidor.key'), '*.key');
  assert.equal(nombreEsSecreto('id_rsa'), 'id_rsa*');
  assert.equal(nombreEsSecreto('id_ed25519'), 'id_rsa*');
  assert.equal(nombreEsSecreto('credentials-prod.yaml'), 'credentials*');
  assert.equal(nombreEsSecreto('secrets.yml'), 'secrets.json');
  assert.equal(nombreEsSecreto('environment.md'), null);
  assert.equal(secretoEnComando('cat .env.example'), null);
  assert.equal(secretoEnComando('cat README.md'), null);
  assert.equal(decidir({ tool_name: 'Read', tool_input: { file_path: '.env.example' } }), null);
});

test('como hook imprime el JSON de PreToolUse, calla si no aplica y cierra si la entrada es rara', () => {
  const raiz = crearKit();
  try {
    const r = correr('guardia.mjs', { raiz, entrada: bash('git push') });
    assert.equal(r.codigo, 0);
    const json = JSON.parse(r.salida);
    assert.equal(json.hookSpecificOutput.hookEventName, 'PreToolUse');
    assert.equal(json.hookSpecificOutput.permissionDecision, 'ask');
    const nada = correr('guardia.mjs', { raiz, entrada: bash('git status') });
    assert.equal(nada.salida, '');
    const roto = correr('guardia.mjs', { raiz, entrada: '{"tool_name":"Bash","tool_input":{"command":"C:\\x\\.env"' });
    assert.equal(JSON.parse(roto.salida).hookSpecificOutput.permissionDecision, 'deny', 'si la entrada es ilegible pero menciona un secreto, bloquea');
    const ilegible = correr('guardia.mjs', { raiz, entrada: 'esto no es json' });
    assert.equal(JSON.parse(ilegible.salida).hookSpecificOutput.permissionDecision, 'ask', 'si la entrada es ilegible, pide confirmación');
    const vacia = correr('guardia.mjs', { raiz, entrada: '' });
    assert.equal(JSON.parse(vacia.salida).hookSpecificOutput.permissionDecision, 'ask', 'entrada vacía: fail-closed');
    const sinTool = correr('guardia.mjs', { raiz, entrada: { hook_event_name: 'PreToolUse' } });
    assert.equal(sinTool.salida, '', 'JSON válido sin herramienta: nada que decir');
    const psHook = correr('guardia.mjs', { raiz, entrada: ps('git push origin main') });
    assert.equal(JSON.parse(psHook.salida).hookSpecificOutput.permissionDecision, 'ask');
  } finally {
    borrarKit(raiz);
  }
});

test('shells anidados no esconden secretos ni publicaciones', () => {
  for (const comando of [
    'bash -c "cat .env"',
    "sh -c 'cat .env | head'",
    'bash -lc "type .env.local"',
    'powershell -Command "Get-Content .env"',
    'pwsh -c "gc .\\.env"',
    'cmd /c type .env',
    'eval "cat .env"',
  ]) {
    assert.equal(decidir(bash(comando))?.permissionDecision, 'deny', comando);
  }
  assert.equal(decidir(bash('bash -c "git push origin main"'))?.permissionDecision, 'ask');
  assert.equal(decidir(ps('powershell -EncodedCommand ZQBjAGgAbwA='))?.permissionDecision, 'ask');
  assert.equal(decidir(bash('bash -c "git check-ignore -v .env"')), null);
  assert.equal(decidir(bash('bash scripts/instalar.sh')), null);
});

test('un corchete sin cerrar no rompe la guardia', () => {
  for (const comando of [
    "cat > nota.md <<'FIN'\netiquetas: [entrevista, alumnos]\nFIN",
    'echo [hola',
    'ls notas/[2026',
  ]) {
    assert.equal(decidir(bash(comando)), null, comando);
  }
  assert.equal(decidir(bash('cat .en[v]'))?.permissionDecision, 'deny');
});
