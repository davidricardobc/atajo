#!/usr/bin/env node
// Anota una línea en el diario de hoy con la hora real del computador.
// Evita que el agente invente horas: la hora la pone el script, no el modelo.
//
// Uso:
//   node scripts/diario.mjs "qué pasó"              agrega "- HH:MM · qué pasó" a bitacora/diario/AAAA-MM-DD.md
//   node scripts/diario.mjs --hora                  solo imprime la fecha y hora real (para ahora.md)
//   node scripts/diario.mjs --raiz <carpeta> "..."  si no se corre desde el kit
//
// Sin Node, la vía manual es correr `date` (Mac o Linux) o `Get-Date -Format "yyyy-MM-dd HH:mm"`
// (PowerShell) antes de escribir la hora a mano.

import {
  encontrarRaiz, anotarEnDiario, fechaHoy, horaAhora, leerArgumentos, esEjecucionDirecta, rutaRelativa,
} from './lib/comun.mjs';

export function lineaDeDiario(texto, ahora = new Date()) {
  const limpio = String(texto).trim().replace(/^-\s*/, '').replace(/^\d{1,2}:\d{2}\s*·\s*/, '');
  return `- ${horaAhora(ahora)} · ${limpio}`;
}

function principal() {
  const { banderas, posicionales } = leerArgumentos();
  const ahora = new Date();
  if (banderas.hora || posicionales.length === 0) {
    console.log(`${fechaHoy(ahora)} ${horaAhora(ahora)}`);
    if (posicionales.length === 0 && !banderas.hora) console.log('Uso: node scripts/diario.mjs "texto de la línea"');
    return;
  }
  const raiz = encontrarRaiz([banderas.raiz]);
  if (!raiz) {
    console.error('Atajo: no encontré kit.json hacia arriba.');
    process.exitCode = 1;
    return;
  }
  const ruta = anotarEnDiario(raiz, lineaDeDiario(posicionales.join(' '), ahora), ahora);
  console.log(`${fechaHoy(ahora)} ${horaAhora(ahora)} · anotado en ${rutaRelativa(raiz, ruta)}`);
}

if (esEjecucionDirecta(import.meta.url)) {
  try {
    principal();
  } catch (error) {
    console.error(`Atajo: diario.mjs falló: ${error.message}`);
    process.exitCode = 1;
  }
}
