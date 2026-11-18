import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { crearKit, borrarKit, correr } from './ayuda.mjs';
import { lineaDeDiario } from '../diario.mjs';

test('arma la línea con la hora real y limpia guiones u horas inventadas', () => {
  const ahora = new Date(2026, 9, 6, 13, 30);
  assert.equal(lineaDeDiario('Arranque terminado', ahora), '- 13:30 · Arranque terminado');
  assert.equal(lineaDeDiario('- 14:35 · hora inventada', ahora), '- 13:30 · hora inventada');
});

test('anota en el diario de hoy y --hora solo imprime la fecha y hora', () => {
  const raiz = crearKit();
  try {
    const r = correr('diario.mjs', { raiz, argumentos: ['Perfil llenado: quien-soy'] });
    assert.equal(r.codigo, 0, r.error);
    assert.match(r.salida, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2} · anotado en bitacora\/diario\/\d{4}-\d{2}-\d{2}\.md/);
    const diario = fs.readdirSync(path.join(raiz, 'bitacora', 'diario'));
    assert.equal(diario.length, 1);
    const texto = fs.readFileSync(path.join(raiz, 'bitacora', 'diario', diario[0]), 'utf8');
    assert.match(texto, /^# Diario \d{4}-\d{2}-\d{2}\n\n- \d{2}:\d{2} · Perfil llenado: quien-soy\n$/);
    const hora = correr('diario.mjs', { raiz, argumentos: ['--hora'] });
    assert.match(hora.salida.trim(), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    const sinTexto = correr('diario.mjs', { raiz });
    assert.match(sinTexto.salida, /Uso:/);
  } finally {
    borrarKit(raiz);
  }
});
