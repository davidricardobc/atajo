import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { crearKit, borrarKit, correr, tocar, marcarSesion, envejecer } from './ayuda.mjs';
import { terminaEnPregunta, cambiosDespuesDelRetorno } from '../cierre.mjs';

const hace = (minutos) => new Date(Date.now() - minutos * 60_000);
const stop = (extra = {}) => ({ hook_event_name: 'Stop', stop_hook_active: false, ...extra });

test('Stop deja cerrar cuando ahora.md es lo más reciente', () => {
  const raiz = crearKit();
  try {
    marcarSesion(raiz, 60);
    for (const rel of ['perfil/negocio.md', 'perfil/prioridades.md', 'CLAUDE.md']) tocar(path.join(raiz, rel), hace(30));
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), new Date());
    const r = correr('cierre.mjs', { raiz, entrada: stop({ cwd: raiz }) });
    assert.equal(r.codigo, 0);
    assert.equal(r.error, '');
  } finally {
    borrarKit(raiz);
  }
});

test('Stop exige el punto de retorno con código 2 si hubo cambios del kit en esta sesión', () => {
  const raiz = crearKit();
  try {
    marcarSesion(raiz, 60);
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), hace(30));
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '# Manual\n\nCambió.\n');
    fs.writeFileSync(path.join(raiz, 'conocimiento', 'nota-nueva.md'), '# Nota\n\nEscrita en la sesión.\n');
    const r = correr('cierre.mjs', { raiz, entrada: stop() });
    assert.equal(r.codigo, 2);
    assert.match(r.error, /Actualiza `bitacora\/ahora\.md`/);
    assert.match(r.error, /CLAUDE\.md/);
    assert.match(r.error, /conocimiento\/nota-nueva\.md/);
    assert.match(r.error, /Hora real: \d{4}-\d{2}-\d{2} \d{2}:\d{2}/, 'el mensaje trae la hora real');
    assert.match(r.error, /diario\.mjs/, 'pide anotar el diario con el script');
    assert.match(r.error, /vuelve a mostrar la pregunta pendiente/);
  } finally {
    borrarKit(raiz);
  }
});

test('Stop ignora cambios anteriores al inicio de la sesión (sesión nueva sobre un kit viejo)', () => {
  const raiz = crearKit();
  try {
    // Kit viejo: todo de hace un día, CLAUDE.md editado "ayer" por fuera de Claude; la sesión empezó hace 5 minutos.
    envejecer(raiz, 24 * 60);
    tocar(path.join(raiz, 'CLAUDE.md'), hace(12 * 60));
    marcarSesion(raiz, 5);
    const r = correr('cierre.mjs', { raiz, entrada: stop() });
    assert.equal(r.codigo, 0, r.error);
    // Un cambio dentro de la sesión sí cuenta.
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '# Manual\n\nCambió en la sesión.\n');
    const r2 = correr('cierre.mjs', { raiz, entrada: stop() });
    assert.equal(r2.codigo, 2);
  } finally {
    borrarKit(raiz);
  }
});

test('Stop no bloquea sin marca de sesión (no hay evidencia de cambios propios)', () => {
  const raiz = crearKit();
  try {
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), hace(30));
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '# Manual\n\nCambió.\n');
    const r = correr('cierre.mjs', { raiz, entrada: stop() });
    assert.equal(r.codigo, 0, r.error);
  } finally {
    borrarKit(raiz);
  }
});

test('Stop no bloquea si el último mensaje termina en pregunta', () => {
  const raiz = crearKit();
  try {
    marcarSesion(raiz, 60);
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), hace(30));
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '# Manual\n\nCambió.\n');
    const r = correr('cierre.mjs', { raiz, entrada: stop({ last_assistant_message: 'Pregunta: ¿cuántos pedidos recibes a la semana?\nMi suposición: unos 200.\n\n¿Voy bien?' }) });
    assert.equal(r.codigo, 0, r.error);
    const r2 = correr('cierre.mjs', { raiz, entrada: stop({ last_assistant_message: 'Listo, actualicé el perfil.' }) });
    assert.equal(r2.codigo, 2);
  } finally {
    borrarKit(raiz);
  }
  assert.equal(terminaEnPregunta('¿Voy bien?'), true);
  assert.equal(terminaEnPregunta('¿Voy bien?**'), true);
  assert.equal(terminaEnPregunta('¿Voy bien? '), true);
  assert.equal(terminaEnPregunta('Listo.'), false);
  assert.equal(terminaEnPregunta(undefined), false);
});

test('Stop no entra en bucle: con stop_hook_active true deja cerrar', () => {
  const raiz = crearKit();
  try {
    marcarSesion(raiz, 60);
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), hace(30));
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '# Manual\n\nCambió otra vez.\n');
    const r = correr('cierre.mjs', { raiz, entrada: { hook_event_name: 'Stop', stop_hook_active: true } });
    assert.equal(r.codigo, 0);
  } finally {
    borrarKit(raiz);
  }
});

test('Stop no molesta en un kit recién instalado (perfil sin llenar)', () => {
  const raiz = crearKit({ perfilLleno: false });
  try {
    marcarSesion(raiz, 60);
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), hace(30));
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '# Manual\n\nCambió.\n');
    const r = correr('cierre.mjs', { raiz, entrada: stop() });
    assert.equal(r.codigo, 0);
  } finally {
    borrarKit(raiz);
  }
});

test('no cuentan: bitácora, perfil, decisiones, entrevistas, clientes, archivo, índice, secretos ni settings.local.json', () => {
  const raiz = crearKit();
  try {
    envejecer(raiz, 30);
    marcarSesion(raiz, 60);
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), hace(10));
    const escribir = (rel, txt = 'cambio\n') => {
      const ruta = path.join(raiz, rel);
      fs.mkdirSync(path.dirname(ruta), { recursive: true });
      fs.writeFileSync(ruta, txt);
    };
    escribir('bitacora/pendientes.md', '# Pendientes\n\n## Cola\n\n1. Nueva.\n');
    escribir('conocimiento/indice.md', '# Índice\n');
    escribir('conocimiento/indice-perfil.md', '# Índice perfil\n');
    escribir('perfil/negocio.md');
    escribir('perfil/manual.md');
    escribir('decisiones/registro.md');
    escribir('entrevistas/2026-10-06-tema.md');
    escribir('clientes/x/diagnostico.md');
    escribir('archivo/viejo.md');
    escribir('.env', 'CLAVE=no-leer\n');
    escribir('.env.local', 'CLAVE=no-leer\n');
    escribir('llave.pem', 'x\n');
    escribir('.claude/settings.local.json', '{}\n');
    escribir('kit.local.json', '{}\n');
    escribir('.atajo/sesion.json', fs.readFileSync(path.join(raiz, '.atajo', 'sesion.json'), 'utf8'));
    const r = correr('cierre.mjs', { raiz, entrada: stop() });
    assert.equal(r.codigo, 0, r.error);
  } finally {
    borrarKit(raiz);
  }
});

test('los archivos ignorados por git fuera de las carpetas de datos no cuentan; los de datos sí', () => {
  const raiz = crearKit();
  try {
    envejecer(raiz, 30);
    marcarSesion(raiz, 60);
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), hace(10));
    fs.writeFileSync(path.join(raiz, 'salida.log'), 'ruido\n');
    fs.writeFileSync(path.join(raiz, 'conocimiento', 'nota.md'), '# Nota\n');
    const ignorados = new Set(['salida.log', 'conocimiento/nota.md']);
    const { cambios } = cambiosDespuesDelRetorno(raiz, { inicioSesionMs: Date.now() - 3_600_000, ignorados });
    const rutas = cambios.map((c) => c.ruta);
    assert.ok(!rutas.includes('salida.log'), 'ignorado por git y fuera de datos: no cuenta');
    assert.ok(rutas.includes('conocimiento/nota.md'), 'ignorado por git pero es dato de la sesión: cuenta');
  } finally {
    borrarKit(raiz);
  }
});

test('funciona en una ruta con espacios', () => {
  const raiz = crearKit({ conEspacio: true });
  try {
    assert.match(raiz, / /);
    marcarSesion(raiz, 60);
    tocar(path.join(raiz, 'bitacora', 'ahora.md'), hace(30));
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '# Manual\n\nCambió.\n');
    const r = correr('cierre.mjs', { raiz, entrada: stop({ cwd: raiz }) });
    assert.equal(r.codigo, 2, r.error);
    assert.match(r.error, /CLAUDE\.md/);
  } finally {
    borrarKit(raiz);
  }
});

test('PreCompact anota la compactación en el diario del día y no bloquea', () => {
  const raiz = crearKit();
  try {
    const r = correr('cierre.mjs', { raiz, entrada: { hook_event_name: 'PreCompact', trigger: 'auto', session_id: 'abc123def', cwd: raiz } });
    assert.equal(r.codigo, 0);
    const diario = fs.readdirSync(path.join(raiz, 'bitacora', 'diario'));
    assert.equal(diario.length, 1);
    const texto = fs.readFileSync(path.join(raiz, 'bitacora', 'diario', diario[0]), 'utf8');
    assert.match(texto, /^# Diario \d{4}-\d{2}-\d{2}/);
    assert.match(texto, /compactación automática del contexto · sesión abc123/);
  } finally {
    borrarKit(raiz);
  }
});
