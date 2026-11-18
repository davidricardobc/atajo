#!/usr/bin/env node
// La red de Atajo: lee los archivos de la persona y arma el modelo de su red
// (persona, prioridades, proyectos, skills, decisiones, frentes y Cola).
//
// Uso:
//   node scripts/red.mjs              arma red/red.json, construye red/index.html y lo abre
//   node scripts/red.mjs --json       imprime el modelo sin escribir nada
//   node scripts/red.mjs --contrato   imprime el JSON del contrato (plantillas/red/CONTRATO.md)
//   node scripts/red.mjs --sin-abrir  arma y construye, pero no abre el navegador
//   [--raiz <carpeta>]
//
// Todo lo que escribe va en red/, que está fuera de git como el resto de los datos.
// Sin dependencias: solo Node.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encontrarRaiz, leerKit, leerArgumentos, esEjecucionDirecta, MARCA_PLANTILLA } from './lib/comun.mjs';
import { aContrato, construirRed } from './lib/red-pagina.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const leer = (raiz, rel) => {
  try { return fs.readFileSync(path.join(raiz, rel), 'utf8'); } catch { return ''; }
};
const sinLlenar = (texto) => !texto || texto.includes(MARCA_PLANTILLA);
const limpiar = (t) => String(t || '').replace(/\*\*/g, '').replace(/`/g, '').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a).trim();
const sinCodigo = (texto) => texto.replace(/```[\s\S]*?```/g, '');

/** Valor de una línea "- Clave: valor" (la primera clave que exista). */
function campo(texto, ...claves) {
  for (const clave of claves) {
    const m = new RegExp(`^\\s*-\\s*${clave}[^:\\n]*:\\s*(.+)$`, 'im').exec(texto);
    if (m && limpiar(m[1])) return limpiar(m[1]).replace(/\.$/, '');
  }
  return '';
}

/** Secciones "## Título" de un Markdown: [{ titulo, cuerpo }]. */
function secciones(texto) {
  const partes = sinCodigo(texto).split(/^## /m).slice(1);
  return partes.map((p) => {
    const salto = p.indexOf('\n');
    return { titulo: limpiar(salto === -1 ? p : p.slice(0, salto)), cuerpo: salto === -1 ? '' : p.slice(salto + 1) };
  });
}

function vinetas(cuerpo) {
  return cuerpo.split('\n').filter((l) => /^\s*[-*]\s+\S/.test(l)).map((l) => limpiar(l.replace(/^\s*[-*]\s+/, '')));
}

export function leerPersona(raiz) {
  const quien = leer(raiz, 'perfil/quien-soy.md');
  const manual = leer(raiz, 'perfil/manual.md');
  let nombre = sinLlenar(quien) ? '' : campo(quien, 'Nombre completo', 'Nombre');
  if (!nombre && !sinLlenar(manual)) nombre = limpiar((/^# Manual de (.+)$/m.exec(manual) || [])[1]);
  nombre = nombre.replace(/\s*\(.*\)\s*$/, '');
  const frase = sinLlenar(quien) ? '' : campo(quien, 'En una frase');
  return { nombre: nombre || 'Tú', titulo: nombre ? `Red de ${nombre}` : 'Tu red', frase };
}

export function leerPrioridades(raiz) {
  const texto = leer(raiz, 'perfil/prioridades.md');
  if (sinLlenar(texto)) return [];
  return secciones(texto)
    .filter((s) => /^prioridad\s*\d/i.test(s.titulo))
    .map((s, i) => {
      const titulo = limpiar(s.titulo.replace(/^prioridad\s*\d+\s*[:·.-]?\s*/i, '')) || campo(s.cuerpo, 'Qué');
      return {
        id: `P${i + 1}`,
        titulo: titulo || `Prioridad ${i + 1}`,
        que: campo(s.cuerpo, 'Qué'),
        fecha: campo(s.cuerpo, 'Fecha límite', 'Fecha'),
        senal: campo(s.cuerpo, 'Señal de éxito', 'Senal de exito'),
      };
    })
    .filter((p) => p.titulo && !/^\s*$/.test(p.titulo));
}

export function leerProyectos(raiz) {
  const texto = leer(raiz, 'proyectos/indice.md');
  const filas = sinCodigo(texto).split('\n').filter((l) => /^\|/.test(l));
  if (filas.length < 3) return [];
  const columnas = filas[0].split('|').slice(1, -1).map((c) => limpiar(c).toLowerCase());
  const col = (nombres) => columnas.findIndex((c) => nombres.some((n) => c.startsWith(n)));
  const iNombre = col(['proyecto', 'nombre']);
  const iCuando = col(['cuándo', 'cuando']);
  const iDonde = col(['dónde', 'donde', 'ruta']);
  return filas.slice(2)
    .map((f) => f.split('|').slice(1, -1).map(limpiar))
    .filter((c) => c[iNombre] && !/^\(ejemplo\)/i.test(c[iNombre]))
    .map((c) => ({ nombre: c[iNombre], para: iCuando >= 0 ? c[iCuando] : '', donde: iDonde >= 0 ? c[iDonde] : '' }));
}

export function leerDecisiones(raiz, max = 8) {
  const texto = sinCodigo(leer(raiz, 'decisiones/registro.md'));
  const lista = [];
  for (const m of texto.matchAll(/^## (\d{4}-\d{2}-\d{2}) · (.+)$/gm)) {
    const titulo = limpiar(m[2]);
    if (/^instalar atajo$/i.test(titulo)) continue;
    lista.push({ fecha: m[1], titulo });
  }
  return lista.slice(-max).reverse();
}

export function leerBitacora(raiz) {
  const ahora = leer(raiz, 'bitacora/ahora.md');
  const frentes = [];
  for (const s of secciones(ahora)) {
    if (!/^frentes abiertos/i.test(s.titulo)) continue;
    for (const v of vinetas(s.cuerpo)) {
      const m = /^(.+?)\s*:\s*(.*)$/.exec(v);
      frentes.push({ nombre: limpiar(m ? m[1] : v).replace(/\s*\((P\d)\)\s*$/i, ''), prioridad: ((m ? m[1] : '').match(/P\d/i) || [''])[0].toUpperCase(), detalle: m ? m[2] : '' });
    }
  }
  const pendientes = leer(raiz, 'bitacora/pendientes.md');
  const cola = [];
  const parqueadero = [];
  for (const s of secciones(pendientes)) {
    if (/^cola/i.test(s.titulo)) {
      for (const l of s.cuerpo.split('\n')) {
        const m = /^\s*\d+\.\s+(.+)$/.exec(l);
        if (m) cola.push({ texto: limpiar(m[1]).replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, ''), prioridad: (m[1].match(/\bP\d\b/) || [''])[0] });
      }
    }
    if (/^parqueadero/i.test(s.titulo)) {
      for (const v of vinetas(s.cuerpo)) if (!/^\(/.test(v)) parqueadero.push(v.replace(/\s*\(\d{4}-\d{2}-\d{2}\)\.?\s*$/, ''));
    }
  }
  return { frentes, cola, parqueadero };
}

export function leerSkills(raiz) {
  const base = path.join(raiz, '.claude', 'skills');
  let carpetas = [];
  try { carpetas = fs.readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()); } catch { return []; }
  return carpetas.map((d) => {
    const texto = leer(raiz, path.join('.claude', 'skills', d.name, 'SKILL.md'));
    const desc = (/^description:\s*(.+)$/m.exec(texto) || [])[1] || '';
    // "Usa esta skill cuando ...": se queda la primera frase, sin el arranque de instrucción.
    const corta = desc.replace(/^Usa esta skill\s+(cuando\s+|el\s+)?/i, '').split(/(?<=\.)\s/)[0];
    return { nombre: d.name, descripcion: limpiar(corta) };
  }).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function leerAprendizajes(raiz, max = 4) {
  const texto = leer(raiz, 'conocimiento/aprendizajes.md');
  const lista = [];
  for (const s of secciones(texto)) {
    if (!/^lecciones/i.test(s.titulo)) continue;
    for (const l of s.cuerpo.split('\n')) {
      const m = /^\s*-\s*\*\*(\d{4}-\d{2}-\d{2})\s*·\s*([^:*]+):?\*\*:?\s*(.+)$/.exec(l);
      if (m) lista.push({ fecha: m[1], tema: limpiar(m[2]), texto: limpiar(m[3].split(/\s+Cómo aplicarla:/)[0]) });
    }
  }
  return lista.slice(-max).reverse();
}

export function leerClientes(raiz) {
  try {
    return fs.readdirSync(path.join(raiz, 'clientes'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch { return []; }
}

/** El modelo completo de la red, solo con lo que hay en los archivos. */
export function leerRed(raiz, ahora = new Date()) {
  const kit = leerKit(raiz);
  return {
    version: 1,
    generado: ahora.toISOString(),
    kit: { nombre: kit.nombre || 'Atajo', version: kit.version || '' },
    persona: leerPersona(raiz),
    prioridades: leerPrioridades(raiz),
    proyectos: leerProyectos(raiz),
    clientes: leerClientes(raiz),
    aprendizajes: leerAprendizajes(raiz),
    skills: leerSkills(raiz),
    decisiones: leerDecisiones(raiz),
    bitacora: leerBitacora(raiz),
  };
}

function abrirEnNavegador(archivo) {
  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/d', '/s', '/c', `"start "" "${archivo}""`], { detached: true, stdio: 'ignore', windowsHide: true, windowsVerbatimArguments: true }).unref();
  } else {
    spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [archivo], { detached: true, stdio: 'ignore' }).unref();
  }
}

if (esEjecucionDirecta(import.meta.url)) {
  const { banderas } = leerArgumentos();
  const raiz = banderas.raiz ? path.resolve(banderas.raiz) : encontrarRaiz([process.cwd(), path.join(AQUI, '..')]);
  if (!raiz) { console.log('No encontré kit.json hacia arriba. Corre esto dentro de la carpeta de Atajo.'); process.exit(1); }
  const red = leerRed(raiz);
  if (banderas.json) { console.log(JSON.stringify(red, null, 2)); process.exit(0); }
  if (banderas.contrato) { console.log(JSON.stringify(aContrato(red), null, 2)); process.exit(0); }
  const { pagina, mensaje } = construirRed(raiz, red, { kit: path.join(AQUI, '..') });
  console.log(mensaje);
  console.log(`Página: ${pagina}`);
  if (!banderas['sin-abrir']) abrirEnNavegador(pagina);
}
