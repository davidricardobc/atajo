#!/usr/bin/env node
// Hook SessionStart de Atajo (también sirve para /retomar a mano).
//
// 1. Crea los datos de la persona que falten desde plantillas/datos/ (nunca pisa lo que existe).
// 2. Escribe la marca de inicio de sesión en .atajo/sesion.json (la usa el hook Stop).
// 3. Imprime la fecha, bitacora/ahora.md y las primeras líneas de la Cola.
// Lo que sale por stdout entra como contexto de la sesión. Nunca falla: si algo falta, lo dice.
//
// Uso manual: node scripts/sesion-inicio.mjs [--raiz <carpeta>] [--solo-datos]

import fs from 'node:fs';
import path from 'node:path';
import {
  leerStdinJson, encontrarRaiz, leerKit, leerTexto, fechaHoy, horaAhora,
  perfilSinLlenar, extraerSeccion, leerArgumentos, esEjecucionDirecta,
  crearDatosFaltantes, escribirMarcaSesion,
} from './lib/comun.mjs';

export function armarInicio(raiz, { origen = 'manual', ahora = new Date(), creados = [] } = {}) {
  const kit = leerKit(raiz);
  const maxLineas = Number(kit.inicio.max_lineas) || 80;
  const ahoraMax = Number(kit.inicio.ahora_max_lineas) || 60;
  const colaMax = Number(kit.inicio.cola_lineas) || 15;
  const salida = [];

  const version = kit.version ? ` v${kit.version}` : '';
  salida.push(`# ${kit.nombre}${version} · ${fechaHoy(ahora)} ${horaAhora(ahora)} · inicio de sesión (${origen})`);

  if (creados.length) {
    const archivos = creados.filter((c) => !c.endsWith('/'));
    if (archivos.length) salida.push(`Datos creados desde plantillas/datos (${archivos.length} archivos): ${archivos.slice(0, 6).join(', ')}${archivos.length > 6 ? ', ...' : ''}.`);
  }

  if (perfilSinLlenar(raiz)) {
    salida.push('El perfil está sin llenar. Ofrece `/arranque` (4 preguntas, unos 3 minutos, termina en el plan de la semana) antes de cualquier otra cosa y espera la respuesta.');
  }

  // Punto de retorno
  const rutaAhora = path.join(raiz, 'bitacora', 'ahora.md');
  let bloqueAhora = [];
  if (fs.existsSync(rutaAhora)) {
    const lineas = leerTexto(rutaAhora).split(/\r?\n/);
    while (lineas.length && lineas[lineas.length - 1].trim() === '') lineas.pop();
    if (lineas.length > ahoraMax) {
      bloqueAhora = lineas.slice(0, ahoraMax);
      bloqueAhora.push(`(bitacora/ahora.md tiene ${lineas.length} líneas; el límite es ${ahoraMax}. Recórtalo en el próximo hito.)`);
    } else {
      bloqueAhora = lineas;
    }
  } else {
    bloqueAhora = ['No existe `bitacora/ahora.md`. Créalo con los cuatro bloques (Frentes abiertos, Espera decisión, Última actualización, Si se corta aquí) antes de seguir.'];
  }

  // Cola
  const rutaPendientes = path.join(raiz, 'bitacora', 'pendientes.md');
  let bloqueCola = [];
  if (fs.existsSync(rutaPendientes)) {
    const seccion = extraerSeccion(leerTexto(rutaPendientes), 'Cola');
    if (seccion === null) {
      bloqueCola = ['`bitacora/pendientes.md` no tiene la sección "## Cola".'];
    } else {
      const utiles = seccion.filter((l) => l.trim() !== '');
      bloqueCola = utiles.slice(0, colaMax);
      if (utiles.length > colaMax) bloqueCola.push(`(y ${utiles.length - colaMax} líneas más en la Cola)`);
      if (utiles.length === 0) bloqueCola = ['La Cola está vacía. Propón qué tomar de "Del usuario" o pregunta en qué enfocarse.'];
    }
  } else {
    bloqueCola = ['No existe `bitacora/pendientes.md`.'];
  }

  const cierre = 'Regla: al cerrar cada hito actualiza `bitacora/ahora.md` y el diario del día. Para publicar, pagar, borrar o escribir a terceros, pide un sí explícito.';

  // Armar respetando el límite total: si sobra, se recorta el bloque de ahora.md.
  const fijas = salida.length + 1 + bloqueCola.length + 1 + 1; // encabezados de sección y cierre
  const cupoAhora = Math.max(5, maxLineas - fijas);
  if (bloqueAhora.length > cupoAhora) {
    bloqueAhora = bloqueAhora.slice(0, cupoAhora - 1);
    bloqueAhora.push('(recortado por el límite de líneas del inicio)');
  }

  salida.push(...bloqueAhora);
  salida.push(`## Cola (primeras ${colaMax} líneas de bitacora/pendientes.md)`);
  salida.push(...bloqueCola);
  salida.push(cierre);
  return salida.join('\n');
}

async function principal() {
  const { banderas } = leerArgumentos();
  const entrada = await leerStdinJson();
  const raiz = encontrarRaiz([banderas.raiz, entrada.cwd]);
  if (!raiz) {
    console.log('Atajo: no encontré kit.json hacia arriba. Abre Claude Code en la carpeta del kit o corre /arranque.');
    return;
  }
  const creados = crearDatosFaltantes(raiz);
  if (banderas['solo-datos']) {
    console.log(creados.length ? `Datos creados: ${creados.join(', ')}.` : 'Los datos ya estaban completos.');
    return;
  }
  const origen = entrada.source || (entrada.hook_event_name ? 'hook' : 'manual');
  // Una compactación no es una sesión nueva: la marca de inicio se conserva.
  if (origen !== 'compact') escribirMarcaSesion(raiz, { sessionId: entrada.session_id, origen });
  console.log(armarInicio(raiz, { origen, creados }));
}

if (esEjecucionDirecta(import.meta.url)) {
  principal().catch((error) => {
    console.log(`Atajo: el inicio de sesión falló sin bloquear nada: ${error.message}`);
  });
}
