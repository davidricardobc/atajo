#!/usr/bin/env node
// Mantiene a Codex al día con Claude Code:
// - copia .claude/skills/<skill> a .agents/skills/<skill> (las skills que solo están en .agents/skills se avisan y nunca se borran),
// - genera AGENTS.md desde CLAUDE.md. Son iguales salvo una línea: Codex no tiene imports `@ruta`,
//   así que donde CLAUDE.md importa `@perfil/manual.md`, AGENTS.md le pide a Codex leer ese archivo al empezar.
//
// Uso: node scripts/sincronizar-skills.mjs [--raiz <carpeta>] [--skill <nombre>] [--verificar]
// --verificar no escribe: sale con código 1 si algo está desincronizado (lo usa /auditoria).

import fs from 'node:fs';
import path from 'node:path';
import { encontrarRaiz, leerTexto, leerArgumentos, esEjecucionDirecta } from './lib/comun.mjs';

function listarRelativos(carpeta) {
  const salida = new Map();
  if (!fs.existsSync(carpeta)) return salida;
  const recorrer = (actual) => {
    for (const entrada of fs.readdirSync(actual, { withFileTypes: true })) {
      const completa = path.join(actual, entrada.name);
      if (entrada.isDirectory()) recorrer(completa);
      else salida.set(path.relative(carpeta, completa).split(path.sep).join('/'), completa);
    }
  };
  recorrer(carpeta);
  return salida;
}

function igualesEnContenido(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  return fs.readFileSync(a).equals(fs.readFileSync(b));
}

/** Convierte el texto de CLAUDE.md en el de AGENTS.md: los imports `@ruta` se vuelven una orden de lectura. */
export function paraCodex(textoClaude) {
  return textoClaude.replace(/(^|\s)@((?:[\w.\-]+\/)*[\w.\-]+\.md)\b/g, (todo, antes, ruta) => (
    `${antes}\`${ruta}\` (Codex: léelo completo al empezar la sesión; no tiene imports)`
  ));
}

export function sincronizar(raiz, { skill = null, verificar = false } = {}) {
  const origen = path.join(raiz, '.claude', 'skills');
  const destino = path.join(raiz, '.agents', 'skills');
  const informe = { copiadas: [], soloCodex: [], agentsMd: 'sin cambios', diferencias: [] };

  const skillsOrigen = fs.existsSync(origen)
    ? fs.readdirSync(origen, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];
  const aSincronizar = skill ? skillsOrigen.filter((s) => s === skill) : skillsOrigen;
  if (skill && aSincronizar.length === 0) {
    throw new Error(`No existe .claude/skills/${skill}`);
  }

  for (const nombre of aSincronizar) {
    const de = path.join(origen, nombre);
    const a = path.join(destino, nombre);
    const archivosDe = listarRelativos(de);
    const archivosA = listarRelativos(a);
    const distinta = archivosDe.size !== archivosA.size
      || [...archivosDe.keys()].some((rel) => !archivosA.has(rel) || !igualesEnContenido(archivosDe.get(rel), archivosA.get(rel)));
    if (!distinta) continue;
    informe.diferencias.push(`skill ${nombre}`);
    if (verificar) continue;
    fs.rmSync(a, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(a), { recursive: true });
    fs.cpSync(de, a, { recursive: true });
    informe.copiadas.push(nombre);
  }

  if (!skill && fs.existsSync(destino)) {
    for (const entrada of fs.readdirSync(destino, { withFileTypes: true })) {
      // Una skill que solo está en .agents/skills puede ser del usuario, hecha solo para Codex: se avisa, nunca se borra.
      if (entrada.isDirectory() && !skillsOrigen.includes(entrada.name)) {
        informe.soloCodex.push(entrada.name);
      }
    }
  }

  const rutaClaude = path.join(raiz, 'CLAUDE.md');
  const rutaAgents = path.join(raiz, 'AGENTS.md');
  if (fs.existsSync(rutaClaude)) {
    const contenido = paraCodex(leerTexto(rutaClaude));
    const actual = fs.existsSync(rutaAgents) ? leerTexto(rutaAgents) : null;
    if (actual !== contenido) {
      informe.diferencias.push('AGENTS.md');
      if (!verificar) {
        fs.writeFileSync(rutaAgents, contenido, 'utf8');
        informe.agentsMd = 'regenerado desde CLAUDE.md';
      }
    }
  } else {
    informe.agentsMd = 'no hay CLAUDE.md todavía';
  }
  return informe;
}

function principal() {
  const { banderas } = leerArgumentos();
  const raiz = encontrarRaiz([banderas.raiz]);
  if (!raiz) {
    console.error('Atajo: no encontré kit.json hacia arriba.');
    process.exitCode = 1;
    return;
  }
  const verificar = banderas.verificar === true;
  const informe = sincronizar(raiz, { skill: typeof banderas.skill === 'string' ? banderas.skill : null, verificar });
  if (verificar) {
    if (informe.diferencias.length) {
      console.log(`Desincronizado: ${informe.diferencias.join(', ')}. Corre node scripts/sincronizar-skills.mjs`);
      process.exitCode = 1;
    } else {
      console.log('Claude y Codex están sincronizados.');
    }
    return;
  }
  console.log(`Skills copiadas a .agents/skills: ${informe.copiadas.length ? informe.copiadas.join(', ') : 'ninguna (ya estaban iguales)'}.`);
  if (informe.soloCodex.length) console.log(`Solo en .agents/skills (no se tocan): ${informe.soloCodex.join(', ')}.`);
  console.log(`AGENTS.md: ${informe.agentsMd}.`);
}

if (esEjecucionDirecta(import.meta.url)) {
  try {
    principal();
  } catch (error) {
    console.error(`Atajo: sincronizar-skills.mjs falló: ${error.message}`);
    process.exitCode = 1;
  }
}
