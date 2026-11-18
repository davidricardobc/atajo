// Pruebas de scripts/originalidad.mjs. Correr con: node --test scripts/pruebas/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { palabras, limpiarMarkdown, tejas, analizarArchivo, buscarTerminos, fechaLocal } from '../originalidad.mjs';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'originalidad.mjs');

// Texto en inglés del "corpus" de prueba (inventado para la prueba).
const CORPUS_TXT = 'The quick brown fox jumps over the lazy dog while the farmer watches from the old red barn near the river every single morning before breakfast is served.';

function carpetaTemporal() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'atajo-originalidad-'));
}

function escribir(base, rel, contenido) {
  const ruta = path.join(base, ...rel.split('/'));
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, contenido, 'utf8');
}

function preparar(kitArchivos) {
  const raiz = carpetaTemporal();
  const corpus = path.join(raiz, 'corpus');
  const kit = path.join(raiz, 'kit');
  escribir(corpus, 'README.md', `# Corpus\n\n${CORPUS_TXT}\n`);
  for (const [rel, txt] of Object.entries(kitArchivos)) escribir(kit, rel, txt);
  return { raiz, corpus, kit };
}

function correr(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
}

test('normaliza minúsculas, acentos, puntuación y saltos CRLF', () => {
  assert.deepEqual(palabras('¡Hola, CAMIÓN!\r\nAcción: año.'), ['hola', 'camion', 'accion', 'ano']);
});

test('quita frontmatter, bloques de código y código en línea', () => {
  const md = '---\nname: x\n---\nTexto `codigo` aqui\n```\ngit push\n```\nfin';
  assert.deepEqual(palabras(limpiarMarkdown(md)), ['texto', 'aqui', 'fin']);
});

test('genera tejas de 8 palabras', () => {
  const t = tejas('a b c d e f g h i'.split(' '));
  assert.equal(t.length, 2);
  assert.equal(t[0], 'a b c d e f g h');
});

test('detecta una racha larga copiada', () => {
  const corpusSet = new Set(tejas(palabras(CORPUS_TXT)));
  const r = analizarArchivo('Intro propia. ' + CORPUS_TXT.slice(0, 90) + ' y sigue en español.', corpusSet, 'x.md');
  assert.ok(r.rachas[0].largo >= 12, `racha ${r.rachas[0]?.largo}`);
  assert.ok(r.fallos.length > 0);
});

test('términos prohibidos: falla fuera de su lugar y se permite en CREDITOS.md', () => {
  assert.equal(buscarTerminos('Usamos los 3Ms aquí', 'guias/x.md')[0].permitido, false);
  assert.equal(buscarTerminos('Gracias a Nate Herk', 'CREDITOS.md')[0].permitido, true);
  assert.equal(buscarTerminos('Gracias a Nate Herk', 'perfil/x.md')[0].permitido, false);
  assert.equal(buscarTerminos('Un ais-os cualquiera', 'x.md')[0].termino, 'AIS-OS');
  assert.equal(buscarTerminos('Tardó 3 ms en responder', 'x.md').length, 0);
});

test('kit original: sale con 0 y escribe el informe', () => {
  const { raiz, corpus, kit } = preparar({
    'README.md': '# Atajo\n\nUn kit en español que te ayuda a enfocarte en lo que importa esta semana.\n',
    'archivo/viejo.md': CORPUS_TXT, // archivo/ no se revisa
  });
  const r = correr(['--corpus', corpus, '--kit', kit]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const informe = path.join(kit, 'revisiones', `originalidad-${fechaLocal()}.md`);
  assert.ok(fs.existsSync(informe));
  assert.match(fs.readFileSync(informe, 'utf8'), /EN VERDE/);
  fs.rmSync(raiz, { recursive: true, force: true });
});

test('kit con texto copiado: sale con 1 e informa la racha', () => {
  const { raiz, corpus, kit } = preparar({ 'guias/copia.md': `# Copia\n\n${CORPUS_TXT}\n` });
  const r = correr(['--corpus', corpus, '--kit', kit]);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  const texto = fs.readFileSync(path.join(kit, 'revisiones', `originalidad-${fechaLocal()}.md`), 'utf8');
  assert.match(texto, /FALLA/);
  assert.match(texto, /guias\/copia\.md/);
  fs.rmSync(raiz, { recursive: true, force: true });
});

test('kit con término prohibido: sale con 1', () => {
  const { raiz, corpus, kit } = preparar({ 'perfil/marco.md': '# Marco\n\nNo es el Four Cs de nadie.\n' });
  const r = correr(['--corpus', corpus, '--kit', kit, '--sin-informe']);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Four Cs/);
  assert.ok(!fs.existsSync(path.join(kit, 'revisiones')));
  fs.rmSync(raiz, { recursive: true, force: true });
});

test('sin --corpus sale con 2', () => {
  const r = correr([]);
  assert.equal(r.status, 2);
});
