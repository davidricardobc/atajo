import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { crearKit, borrarKit } from './ayuda.mjs';
import { encontrarRaiz, extraerSeccion, leerArgumentos, leerKit, listarArchivos, rutaRelativa, anotarEnDiario, fechaHoy } from '../lib/comun.mjs';

test('encuentra la raíz hacia arriba desde una subcarpeta', () => {
  const raiz = crearKit();
  const guardado = process.env.CLAUDE_PROJECT_DIR;
  delete process.env.CLAUDE_PROJECT_DIR;
  try {
    assert.equal(encontrarRaiz([path.join(raiz, 'perfil')]), raiz);
    // Con una pista inútil cae al cwd del proceso: nunca devuelve el kit temporal.
    assert.notEqual(encontrarRaiz([path.join(raiz, '..', 'no-existe-atajo-xyz')]), raiz);
  } finally {
    if (guardado) process.env.CLAUDE_PROJECT_DIR = guardado;
    borrarKit(raiz);
  }
});

test('extrae una sección por título y lee argumentos', () => {
  const cuerpo = extraerSeccion('# P\n\n## Cola\n\n1. a\n2. b\n\n## Del usuario\n\n- c\n', 'Cola');
  assert.deepEqual(cuerpo.filter(Boolean), ['1. a', '2. b']);
  assert.equal(extraerSeccion('# P\n', 'Cola'), null);
  const { banderas, posicionales } = leerArgumentos(['--raiz', 'C:\\x', 'algo', '--verificar']);
  assert.equal(banderas.raiz, 'C:\\x');
  assert.equal(banderas.verificar, true);
  assert.deepEqual(posicionales, ['algo']);
});

test('kit.json con valores por defecto, kit.local.json encima, y lista de archivos con exclusiones', () => {
  const raiz = crearKit();
  try {
    let kit = leerKit(raiz);
    assert.equal(kit.indice.max_lineas, 200);
    assert.deepEqual(kit.indice.excluir, ['archivo', 'plantillas', 'clientes']);
    assert.equal(kit.autonomia, 'equilibrado');
    assert.equal(kit.codex.nivel_por_defecto, 'medium');
    fs.writeFileSync(path.join(raiz, 'kit.local.json'), JSON.stringify({ autonomia: 'prudente', firma_en_salidas: false, leveling_dia: 'lunes', codex: { modelo: 'gpt-x' } }));
    kit = leerKit(raiz);
    assert.equal(kit.autonomia, 'prudente', 'lo local manda');
    assert.equal(kit.firma_en_salidas, false);
    assert.equal(kit.leveling_dia, 'lunes');
    assert.equal(kit.codex.modelo, 'gpt-x');
    assert.equal(kit.codex.nivel_por_defecto, 'medium', 'lo anidado se mezcla, no se reemplaza');
    assert.equal(kit.nombre, 'Atajo');
    fs.writeFileSync(path.join(raiz, 'kit.local.json'), '{ roto');
    assert.equal(leerKit(raiz).autonomia, 'equilibrado', 'kit.local.json roto no tumba nada');
    const md = listarArchivos(raiz, { extensiones: ['.md'], excluir: ['archivo'] }).map((a) => rutaRelativa(raiz, a));
    assert.ok(md.includes('perfil/negocio.md'));
    assert.ok(!md.some((r) => r.startsWith('archivo/') || r.startsWith('.claude/')));
  } finally {
    borrarKit(raiz);
  }
});

test('anota en el diario creando el encabezado una sola vez', () => {
  const raiz = crearKit();
  try {
    const ruta = anotarEnDiario(raiz, '- 10:00 · primera');
    anotarEnDiario(raiz, '- 10:05 · segunda');
    const texto = fs.readFileSync(ruta, 'utf8');
    assert.equal(texto, `# Diario ${fechaHoy()}\n\n- 10:00 · primera\n- 10:05 · segunda\n`);
  } finally {
    borrarKit(raiz);
  }
});
