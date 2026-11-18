#!/usr/bin/env node
// Hook Stop y PreCompact de Atajo.
//
// Stop: si durante ESTA sesión (desde la marca de .atajo/sesion.json) cambió algún archivo
// del kit o de la bitácora de trabajo después del último punto de retorno (bitacora/ahora.md),
// sale con código 2 y explica en stderr qué actualizar. Claude lo hace y vuelve a parar;
// stop_hook_active evita el bucle. No bloquea si el último mensaje termina en pregunta
// (el agente está esperando a la persona) ni si no hay marca de sesión.
//
// PreCompact: anota en el diario del día "compactación a las HH:MM" y deja seguir.
//
// Uso manual: node scripts/cierre.mjs [--raiz <carpeta>] [--evento Stop|PreCompact]

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  leerStdinJson, encontrarRaiz, leerKit, listarArchivos, rutaRelativa,
  perfilSinLlenar, fechaHoy, horaAhora, anotarEnDiario, leerArgumentos, esEjecucionDirecta,
  leerMarcaSesion, CARPETAS_DATOS,
} from './lib/comun.mjs';
import { nombreEsSecreto } from './lib/secretos.mjs';

// Lo que no exige punto de retorno: la bitácora misma, lo que la persona edita a su ritmo
// (perfil, decisiones, entrevistas, clientes), lo archivado, lo generado y la copia para Codex.
export const FUERA_DEL_CHEQUEO = [
  'bitacora', 'archivo', 'perfil', 'entrevistas', 'clientes', 'decisiones',
  'AGENTS.md', 'conocimiento/indice.md', 'kit.local.json', 'CLAUDE.local.md',
];

// Carpetas de datos que sí se revisan aunque git las ignore (son trabajo de la sesión).
const DATOS_REVISADOS = CARPETAS_DATOS.filter((c) => !FUERA_DEL_CHEQUEO.includes(c.split('/')[0]));

/** Archivos que git ignora (fuera de las carpetas de datos). Vacío si no hay git. */
export function ignoradosPorGit(raiz) {
  const ignorados = new Set();
  try {
    const r = spawnSync('git', ['-C', raiz, 'ls-files', '--others', '--ignored', '--exclude-standard', '-z'], { encoding: 'utf8', timeout: 4000 });
    if (r.status !== 0 || !r.stdout) return ignorados;
    for (const ruta of r.stdout.split('\0')) if (ruta) ignorados.add(ruta.replace(/\\/g, '/'));
  } catch {
    // Sin git o sin permiso: no se excluye nada por esta vía.
  }
  return ignorados;
}

function dentroDeDatos(relativa) {
  return DATOS_REVISADOS.some((c) => relativa === c || relativa.startsWith(`${c}/`));
}

/**
 * Archivos modificados después de ahora.md y dentro de la sesión actual, más recientes primero.
 * Sin marca de sesión no hay evidencia de que el cambio sea de esta sesión: no se cuenta nada.
 * No cuentan: secretos, archivos ignorados por git fuera de las carpetas de datos y .claude/settings.local.json.
 */
export function cambiosDespuesDelRetorno(raiz, { toleranciaMs = 5000, inicioSesionMs = null, ignorados = null } = {}) {
  const rutaAhora = path.join(raiz, 'bitacora', 'ahora.md');
  if (!fs.existsSync(rutaAhora)) return { existeAhora: false, cambios: [] };
  if (inicioSesionMs === null) return { existeAhora: true, cambios: [] };
  const limite = Math.max(fs.statSync(rutaAhora).mtimeMs + toleranciaMs, inicioSesionMs);
  const fueraPorGit = ignorados || ignoradosPorGit(raiz);
  const cambios = [];
  for (const archivo of listarArchivos(raiz, { excluir: FUERA_DEL_CHEQUEO })) {
    const relativa = rutaRelativa(raiz, archivo);
    if (/^conocimiento\/indice[^/]*\.md$/.test(relativa)) continue;
    if (nombreEsSecreto(relativa)) continue;
    if (fueraPorGit.has(relativa) && !dentroDeDatos(relativa)) continue;
    const mtime = fs.statSync(archivo).mtimeMs;
    if (mtime > limite) cambios.push({ ruta: relativa, mtime });
  }
  cambios.sort((a, b) => b.mtime - a.mtime);
  return { existeAhora: true, cambios };
}

/** Verdadero si el mensaje termina preguntando algo: el agente espera respuesta, no cierra. */
export function terminaEnPregunta(mensaje) {
  if (typeof mensaje !== 'string') return false;
  const limpio = mensaje.replace(/[\s*_`>)\]"'»]+$/g, '').trimEnd();
  return /\?$/.test(limpio);
}

export function mensajeDeCierre(cambios, ahora = new Date()) {
  const lista = cambios.slice(0, 6).map((c) => `  - ${c.ruta}`).join('\n');
  const extra = cambios.length > 6 ? `\n  (y ${cambios.length - 6} más)` : '';
  return [
    `Atajo: hubo cambios en esta sesión después del último punto de retorno. Hora real: ${fechaHoy(ahora)} ${horaAhora(ahora)} (usa esta, no una calculada).`,
    'Actualiza `bitacora/ahora.md` (frente, último paso, siguiente paso, hora) y anota la línea del diario con `node scripts/diario.mjs "qué pasó"` antes de cerrar.',
    'Si estabas esperando una respuesta de la persona, después de actualizar vuelve a mostrar la pregunta pendiente completa.',
    'Archivos cambiados:',
    lista + extra,
  ].join('\n');
}

export function anotarCompactacion(raiz, entrada, ahora = new Date()) {
  const modo = entrada.trigger === 'manual' ? 'manual' : 'automática';
  const sesion = entrada.session_id ? ` · sesión ${String(entrada.session_id).slice(0, 6)}` : '';
  const linea = `- ${horaAhora(ahora)} · compactación ${modo} del contexto${sesion}. Al volver, lee bitacora/ahora.md.`;
  return anotarEnDiario(raiz, linea, ahora);
}

async function principal() {
  const { banderas } = leerArgumentos();
  const entrada = await leerStdinJson();
  const evento = banderas.evento || entrada.hook_event_name || 'Stop';
  const raiz = encontrarRaiz([banderas.raiz, entrada.cwd]);
  if (!raiz) return; // Sin kit no hay nada que exigir.

  if (evento === 'PreCompact') {
    anotarCompactacion(raiz, entrada);
    return;
  }

  if (entrada.stop_hook_active === true) return; // Ya pedimos el punto de retorno en esta vuelta.
  if (perfilSinLlenar(raiz)) return; // Kit recién instalado: /arranque se encarga.
  if (terminaEnPregunta(entrada.last_assistant_message)) return; // Espera respuesta de la persona.

  const kit = leerKit(raiz);
  const toleranciaMs = (Number(kit.cierre.tolerancia_segundos) || 5) * 1000;
  const marca = leerMarcaSesion(raiz);
  const { existeAhora, cambios } = cambiosDespuesDelRetorno(raiz, {
    toleranciaMs,
    inicioSesionMs: marca ? marca.inicio_ms : null,
  });
  if (!existeAhora) {
    process.stderr.write('Atajo: no existe `bitacora/ahora.md`. Créalo con los cuatro bloques antes de cerrar.\n');
    process.exitCode = 2;
    return;
  }
  if (cambios.length === 0) return;
  process.stderr.write(`${mensajeDeCierre(cambios)}\n`);
  process.exitCode = 2;
}

if (esEjecucionDirecta(import.meta.url)) {
  principal().catch((error) => {
    // Un error del hook no debe bloquear el cierre.
    process.stderr.write(`Atajo: cierre.mjs falló sin bloquear: ${error.message}\n`);
    process.exitCode = 0;
  });
}
