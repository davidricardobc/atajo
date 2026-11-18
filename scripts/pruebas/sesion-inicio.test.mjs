import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { crearKit, borrarKit, correr } from './ayuda.mjs';

function conPlantillasDeDatos(raiz) {
  const escribir = (rel, txt) => {
    const ruta = path.join(raiz, rel);
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    fs.writeFileSync(ruta, txt, 'utf8');
  };
  escribir('plantillas/datos/perfil/manual.md', '<!-- plantilla: sin llenar -->\n# Manual\n');
  escribir('plantillas/datos/perfil/quien-soy.md', '<!-- plantilla: sin llenar -->\n# Quién soy (plantilla)\n');
  escribir('plantillas/datos/decisiones/registro.md', '# Registro\n');
  escribir('plantillas/datos/conexiones.md', '# Conexiones\n');
  escribir('plantillas/datos/kit.local.json', '{ "autonomia": "equilibrado" }\n');
  escribir('plantillas/datos/bitacora/aprobaciones.md', '# Aprobaciones\n');
}

test('imprime ahora.md y la Cola con el formato de SessionStart, con fecha y hora reales', () => {
  const raiz = crearKit();
  try {
    const r = correr('sesion-inicio.mjs', { raiz, entrada: { hook_event_name: 'SessionStart', source: 'startup', session_id: 'ses-1', cwd: raiz } });
    assert.equal(r.codigo, 0);
    assert.match(r.salida, /^# Atajo · \d{4}-\d{2}-\d{2} \d{2}:\d{2} · inicio de sesión \(startup\)/);
    assert.match(r.salida, /## Frentes abiertos/);
    assert.match(r.salida, /1\. Revisar precios de la propuesta\./);
    assert.match(r.salida, /pide un sí explícito/);
    assert.doesNotMatch(r.salida, /Ofrece `\/arranque`/);
    assert.ok(r.salida.split('\n').length <= 80, 'no pasa de 80 líneas');
  } finally {
    borrarKit(raiz);
  }
});

test('escribe la marca de sesión en .atajo/sesion.json y una compactación no la reinicia', () => {
  const raiz = crearKit();
  try {
    correr('sesion-inicio.mjs', { raiz, entrada: { hook_event_name: 'SessionStart', source: 'startup', session_id: 'ses-1' } });
    const ruta = path.join(raiz, '.atajo', 'sesion.json');
    assert.ok(fs.existsSync(ruta));
    const marca = JSON.parse(fs.readFileSync(ruta, 'utf8'));
    assert.equal(marca.sesion, 'ses-1');
    assert.equal(marca.origen, 'startup');
    assert.ok(Math.abs(marca.inicio_ms - Date.now()) < 60_000);
    correr('sesion-inicio.mjs', { raiz, entrada: { hook_event_name: 'SessionStart', source: 'compact', session_id: 'ses-1' } });
    const despues = JSON.parse(fs.readFileSync(ruta, 'utf8'));
    assert.equal(despues.inicio_ms, marca.inicio_ms, 'compact conserva el inicio de la sesión');
    correr('sesion-inicio.mjs', { raiz, entrada: { hook_event_name: 'SessionStart', source: 'resume', session_id: 'ses-2' } });
    assert.equal(JSON.parse(fs.readFileSync(ruta, 'utf8')).sesion, 'ses-2', 'resume es una sesión nueva');
  } finally {
    borrarKit(raiz);
  }
});

test('crea los datos que faltan desde plantillas/datos sin pisar los que existen', () => {
  const raiz = crearKit();
  try {
    conPlantillasDeDatos(raiz);
    const propio = path.join(raiz, 'perfil', 'quien-soy.md');
    const antes = fs.readFileSync(propio, 'utf8');
    const r = correr('sesion-inicio.mjs', { raiz, entrada: { hook_event_name: 'SessionStart', source: 'startup' } });
    assert.equal(r.codigo, 0);
    assert.match(r.salida, /Datos creados desde plantillas\/datos/);
    assert.equal(fs.readFileSync(propio, 'utf8'), antes, 'no pisa un archivo existente');
    assert.ok(fs.existsSync(path.join(raiz, 'perfil', 'manual.md')));
    assert.ok(fs.existsSync(path.join(raiz, 'decisiones', 'registro.md')));
    assert.ok(fs.existsSync(path.join(raiz, 'conexiones.md')));
    assert.ok(fs.existsSync(path.join(raiz, 'kit.local.json')));
    for (const carpeta of ['entrevistas', 'revisiones', 'clientes', 'proyectos', 'archivo', path.join('bitacora', 'diario')]) {
      assert.ok(fs.statSync(path.join(raiz, carpeta)).isDirectory(), carpeta);
    }
    // Segunda vez: nada nuevo.
    const r2 = correr('sesion-inicio.mjs', { raiz, argumentos: ['--solo-datos'] });
    assert.match(r2.salida, /ya estaban completos/);
    // Si la persona borra un archivo, vuelve desde la plantilla sin tocar lo demás.
    fs.unlinkSync(path.join(raiz, 'conexiones.md'));
    fs.writeFileSync(path.join(raiz, 'perfil', 'manual.md'), '# Mi manual editado\n');
    const r3 = correr('sesion-inicio.mjs', { raiz, argumentos: ['--solo-datos'] });
    assert.match(r3.salida, /conexiones\.md/);
    assert.equal(fs.readFileSync(path.join(raiz, 'perfil', 'manual.md'), 'utf8'), '# Mi manual editado\n');
  } finally {
    borrarKit(raiz);
  }
});

test('con el perfil sin llenar ofrece /arranque', () => {
  const raiz = crearKit({ perfilLleno: false });
  try {
    const r = correr('sesion-inicio.mjs', { raiz, entrada: { source: 'startup' } });
    assert.match(r.salida, /Ofrece `\/arranque`/);
  } finally {
    borrarKit(raiz);
  }
});

test('sin ahora.md lo pide en vez de fallar, y recorta si ahora.md es muy largo', () => {
  const raiz = crearKit({ conAhora: false });
  try {
    let r = correr('sesion-inicio.mjs', { raiz });
    assert.equal(r.codigo, 0);
    assert.match(r.salida, /No existe `bitacora\/ahora\.md`/);
    fs.writeFileSync(path.join(raiz, 'bitacora', 'ahora.md'), Array.from({ length: 90 }, (_, i) => `línea ${i + 1}`).join('\n'));
    r = correr('sesion-inicio.mjs', { raiz });
    assert.ok(r.salida.split('\n').length <= 80);
    assert.match(r.salida, /recortado|límite es 60/);
  } finally {
    borrarKit(raiz);
  }
});

test('sin kit.json no falla y lo dice; con ruta con espacios funciona', () => {
  const raiz = crearKit();
  fs.unlinkSync(path.join(raiz, 'kit.json'));
  try {
    const r = correr('sesion-inicio.mjs', { raiz });
    assert.equal(r.codigo, 0);
    assert.match(r.salida, /no encontré kit\.json/);
  } finally {
    borrarKit(raiz);
  }
  const conEspacio = crearKit({ conEspacio: true });
  try {
    conPlantillasDeDatos(conEspacio);
    const r = correr('sesion-inicio.mjs', { raiz: conEspacio, entrada: { source: 'startup', cwd: conEspacio } });
    assert.equal(r.codigo, 0);
    assert.match(r.salida, /## Frentes abiertos/);
    assert.ok(fs.existsSync(path.join(conEspacio, 'perfil', 'manual.md')));
  } finally {
    borrarKit(conEspacio);
  }
});
