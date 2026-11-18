// Pruebas de scripts/abrir.mjs (siempre en modo simulado: no abre nada). Correr con: node --test "scripts/pruebas/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { carpetaTemporal, RAIZ_SCRIPTS } from './ayuda.mjs';

const abrir = (argumentos, cwd) => {
  const r = spawnSync(process.execPath, [path.join(RAIZ_SCRIPTS, 'abrir.mjs'), ...argumentos], {
    env: { ...process.env, ATAJO_ABRIR_SIMULAR: '1' },
    encoding: 'utf8',
    cwd,
  });
  return { codigo: r.status, salida: r.stdout, error: r.stderr };
};

test('un archivo que existe se abriría como file://', () => {
  const raiz = carpetaTemporal(true);
  try {
    fs.mkdirSync(path.join(raiz, 'proyectos', 'demo'), { recursive: true });
    fs.writeFileSync(path.join(raiz, 'proyectos', 'demo', 'pagina.html'), '<p>hola</p>', 'utf8');
    const r = abrir(['proyectos/demo/pagina.html'], raiz);
    assert.equal(r.codigo, 0);
    assert.match(r.salida, /^Abriría: file:\/\/.*pagina\.html/);
  } finally { fs.rmSync(path.dirname(raiz), { recursive: true, force: true }); }
});

test('un archivo que no existe sale con código 1', () => {
  const raiz = carpetaTemporal();
  try {
    const r = abrir(['no-existe.html'], raiz);
    assert.equal(r.codigo, 1);
    assert.match(r.error, /No existe/);
    assert.equal(r.salida, '');
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('sin argumento sale con código 1 y explica el uso', () => {
  const r = abrir([], RAIZ_SCRIPTS);
  assert.equal(r.codigo, 1);
  assert.match(r.error, /Uso: node scripts\/abrir\.mjs/);
});

test('una dirección https se acepta tal cual', () => {
  const r = abrir(['https://github.com/davidricardobc/atajo'], RAIZ_SCRIPTS);
  assert.equal(r.codigo, 0);
  assert.equal(r.salida.trim(), 'Abriría: https://github.com/davidricardobc/atajo');
});

test('un programa o un acceso directo no se abre', () => {
  const raiz = carpetaTemporal();
  try {
    for (const nombre of ['correr.bat', 'programa.exe', 'acceso.lnk', 'sin-extension']) {
      fs.writeFileSync(path.join(raiz, nombre), 'x', 'utf8');
      const r = abrir([nombre], raiz);
      assert.equal(r.codigo, 1, nombre);
      assert.match(r.error, /No abro archivos/);
      assert.equal(r.salida, '');
    }
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('una carpeta no se abre', () => {
  const raiz = carpetaTemporal();
  try {
    fs.mkdirSync(path.join(raiz, 'carpeta'));
    const r = abrir(['carpeta'], raiz);
    assert.equal(r.codigo, 1);
    assert.match(r.error, /No existe o no es un archivo/);
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});
