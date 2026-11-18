#!/usr/bin/env node
// Atajo · chequeo de originalidad.
// Compara cada .md del kit contra un corpus de referencia con tejas (n-gramas) de 8 palabras
// y busca términos prohibidos. Sale con código 1 si algo pasa el umbral.
//
// Uso:
//   node scripts/originalidad.mjs --corpus <carpeta> [--kit <carpeta>] [--todo] [--sin-informe]
//
//   --corpus  carpeta con los textos de referencia (obligatorio).
//   --kit     carpeta del kit a revisar. Por defecto, la carpeta padre de scripts/.
//   --todo    usa todos los .md del corpus, no solo la lista conocida de archivos.
//   --sin-informe  no escribe revisiones/originalidad-AAAA-MM-DD.md.
//
// Códigos de salida: 0 en verde, 1 si falla, 2 si faltan argumentos.
// Sin dependencias. Node 18 o superior.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const TAMANO_TEJA = 8;
export const RACHA_FALLO = 12; // palabras seguidas compartidas que hacen fallar
export const PORCENTAJE_FALLO = 1; // % de tejas compartidas en archivos de más de 300 palabras
export const PALABRAS_MINIMAS_PORCENTAJE = 300;

// Términos prohibidos. Se comparan ya normalizados (minúsculas, sin acentos ni puntuación).
// `permitidoEn` lista archivos (ruta relativa al kit, con /) donde el término sí puede aparecer.
export const TERMINOS_PROHIBIDOS = [
  { termino: 'Three Ms', permitidoEn: [] },
  { termino: '3Ms', permitidoEn: [] },
  { termino: 'Mindset, Method, Machine', permitidoEn: [] },
  { termino: 'Four Cs', permitidoEn: [] },
  { termino: 'AIS-OS', permitidoEn: [] },
  { termino: 'Boring is Beautiful', permitidoEn: [] },
  { termino: 'Default Shift', permitidoEn: [] },
  { termino: 'momento wow', permitidoEn: [] },
  { termino: 'Nate Herk', permitidoEn: ['CREDITOS.md', 'README.md'] },
];

// Frases inevitables: si una racha compartida queda corta al quitarlas, no cuenta.
export const LISTA_BLANCA = [
  'claude code', 'codex', 'visual studio code', 'claude md', 'agents md', 'skill md',
  'slash command', 'mcp server', 'mit license', 'github', 'git',
];

// Archivos del corpus que se usan por defecto (si existen). Si ninguno existe, se usa todo .md.
export const CORPUS_CONOCIDO = [
  'README.md', 'EXPANSIONS.md', 'AGENTS.md', 'CLAUDE.md', 'aios-intake.md',
  'references/3ms-framework.md', 'references/pricing-ai-solutions.md', 'references/first-client-sop.md',
];
export const CORPUS_CARPETAS = [
  '.claude/skills/onboard', '.claude/skills/audit', '.claude/skills/grill-me',
  '.claude/skills/link', '.claude/skills/3d-brain', '.claude/skills/level-up',
];

// Carpetas del kit que no se revisan.
export const EXCLUIR_KIT = new Set(['.git', 'node_modules', 'archivo', 'clientes', 'entrevistas', 'revisiones', '.agents']);

// ---------- Normalización ----------

export function quitarAcentos(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Quita frontmatter, bloques de código, código en línea, URLs y enlaces de imagen.
export function limpiarMarkdown(texto) {
  let t = texto.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  t = t.replace(/^---\n[\s\S]*?\n---\n/, '');
  t = t.replace(/```[\s\S]*?```/g, ' ');
  t = t.replace(/~~~[\s\S]*?~~~/g, ' ');
  t = t.replace(/`[^`\n]*`/g, ' ');
  t = t.replace(/https?:\/\/\S+/g, ' ');
  return t;
}

// Minúsculas, sin acentos, sin puntuación, espacios colapsados. Devuelve la lista de palabras.
export function palabras(texto) {
  const t = quitarAcentos(texto.toLowerCase()).replace(/[^a-z0-9ñ]+/g, ' ').trim();
  return t ? t.split(' ') : [];
}

export function tejas(listaPalabras, n = TAMANO_TEJA) {
  const out = [];
  for (let i = 0; i + n <= listaPalabras.length; i++) out.push(listaPalabras.slice(i, i + n).join(' '));
  return out;
}

// ---------- Archivos ----------

function listarMd(raiz, excluir = new Set()) {
  const out = [];
  const pila = [raiz];
  while (pila.length) {
    const dir = pila.pop();
    let entradas;
    try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entradas) {
      const ruta = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (dir === raiz && excluir.has(e.name)) continue;
        if (e.name === '.git' || e.name === 'node_modules') continue;
        pila.push(ruta);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        out.push(ruta);
      }
    }
  }
  return out.sort();
}

export function archivosCorpus(corpus, todo = false) {
  if (!todo) {
    const elegidos = [];
    for (const rel of CORPUS_CONOCIDO) {
      const r = path.join(corpus, ...rel.split('/'));
      if (fs.existsSync(r)) elegidos.push(r);
    }
    for (const rel of CORPUS_CARPETAS) {
      const r = path.join(corpus, ...rel.split('/'));
      if (fs.existsSync(r)) elegidos.push(...listarMd(r));
    }
    if (elegidos.length) return elegidos;
  }
  return listarMd(corpus);
}

export function archivosKit(kit) {
  return listarMd(kit, EXCLUIR_KIT);
}

function relativa(base, ruta) {
  return path.relative(base, ruta).split(path.sep).join('/');
}

// ---------- Análisis ----------

export function construirCorpus(rutas) {
  const set = new Set();
  for (const r of rutas) {
    const texto = fs.readFileSync(r, 'utf8');
    for (const teja of tejas(palabras(limpiarMarkdown(texto)))) set.add(teja);
  }
  return set;
}

function esListaBlanca(textoRacha) {
  let resto = ` ${textoRacha} `;
  for (const frase of LISTA_BLANCA) resto = resto.split(` ${frase} `).join(' ');
  return palabras(resto).length < TAMANO_TEJA;
}

export function buscarTerminos(texto, rutaRel) {
  const normal = ` ${palabras(texto).join(' ')} `;
  const hallados = [];
  for (const { termino, permitidoEn } of TERMINOS_PROHIBIDOS) {
    const clave = ` ${palabras(termino).join(' ')} `;
    if (!normal.includes(clave)) continue;
    const permitido = permitidoEn.includes(rutaRel) || /^revisiones\/originalidad-/.test(rutaRel);
    hallados.push({ termino, permitido });
  }
  return hallados;
}

export function analizarArchivo(texto, corpusSet, rutaRel) {
  const lista = palabras(limpiarMarkdown(texto));
  const ts = tejas(lista);
  const comparte = ts.map((t) => corpusSet.has(t));
  const compartidas = comparte.filter(Boolean).length;
  const porcentaje = ts.length ? (compartidas / ts.length) * 100 : 0;

  const rachas = [];
  let i = 0;
  while (i < comparte.length) {
    if (!comparte[i]) { i++; continue; }
    let j = i;
    while (j + 1 < comparte.length && comparte[j + 1]) j++;
    const largo = j - i + TAMANO_TEJA; // palabras seguidas compartidas
    const textoRacha = lista.slice(i, j + TAMANO_TEJA).join(' ');
    if (!esListaBlanca(textoRacha)) rachas.push({ largo, texto: textoRacha });
    i = j + 1;
  }
  rachas.sort((a, b) => b.largo - a.largo);

  const terminos = buscarTerminos(texto, rutaRel);
  const fallos = [];
  const avisos = [];
  for (const r of rachas) {
    if (r.largo >= RACHA_FALLO) fallos.push(`racha de ${r.largo} palabras compartidas`);
    else avisos.push(`racha de ${r.largo} palabras para revisar`);
  }
  if (lista.length > PALABRAS_MINIMAS_PORCENTAJE && porcentaje > PORCENTAJE_FALLO) {
    fallos.push(`${porcentaje.toFixed(2)} % de tejas compartidas (máximo ${PORCENTAJE_FALLO} %)`);
  }
  for (const t of terminos) if (!t.permitido) fallos.push(`término prohibido: "${t.termino}"`);

  return { ruta: rutaRel, palabras: lista.length, tejas: ts.length, compartidas, porcentaje, rachas, terminos, fallos, avisos };
}

export function revisar({ kit, corpus, todo = false }) {
  const rutasCorpus = archivosCorpus(corpus, todo);
  const corpusSet = construirCorpus(rutasCorpus);
  const resultados = archivosKit(kit).map((r) => analizarArchivo(fs.readFileSync(r, 'utf8'), corpusSet, relativa(kit, r)));
  const fallo = resultados.some((r) => r.fallos.length > 0);
  return { rutasCorpus: rutasCorpus.map((r) => relativa(corpus, r)), tejasCorpus: corpusSet.size, resultados, fallo };
}

// ---------- Informe ----------

export function fechaLocal(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function firmaActiva(kit) {
  try {
    const conf = JSON.parse(fs.readFileSync(path.join(kit, 'kit.json'), 'utf8'));
    return conf.firma_en_salidas !== false;
  } catch {
    return true;
  }
}

export function informe(res, { kit, corpus, fecha }) {
  const l = [];
  l.push(`# Chequeo de originalidad ${fecha}`, '');
  l.push(`- Veredicto: **${res.fallo ? 'FALLA' : 'EN VERDE'}**`);
  l.push(`- Kit revisado: \`${kit}\` (${res.resultados.length} archivos .md)`);
  l.push(`- Corpus: \`${corpus}\` (${res.rutasCorpus.length} archivos, ${res.tejasCorpus} tejas de ${TAMANO_TEJA} palabras)`);
  l.push(`- Umbrales: racha de ${RACHA_FALLO} palabras o más; más de ${PORCENTAJE_FALLO} % de tejas en archivos de más de ${PALABRAS_MINIMAS_PORCENTAJE} palabras; cualquier término prohibido fuera de su lugar. Rachas de ${TAMANO_TEJA} a ${RACHA_FALLO - 1} palabras quedan como aviso.`);
  l.push('');
  l.push('## Archivos', '');
  l.push('| Archivo | Palabras | Tejas compartidas | % | Racha mayor | Estado |');
  l.push('|---|---|---|---|---|---|');
  for (const r of res.resultados) {
    const estado = r.fallos.length ? 'rojo' : r.avisos.length ? 'amarillo' : 'verde';
    const racha = r.rachas.length ? r.rachas[0].largo : 0;
    l.push(`| ${r.ruta} | ${r.palabras} | ${r.compartidas} | ${r.porcentaje.toFixed(2)} | ${racha} | ${estado} |`);
  }
  const conHallazgos = res.resultados.filter((r) => r.fallos.length || r.avisos.length || r.terminos.length);
  l.push('', '## Hallazgos', '');
  if (!conHallazgos.length) l.push('Sin hallazgos.');
  for (const r of conHallazgos) {
    l.push(`### ${r.ruta}`, '');
    for (const f of r.fallos) l.push(`- Falla: ${f}`);
    for (const a of r.avisos) l.push(`- Aviso: ${a}`);
    for (const t of r.terminos.filter((x) => x.permitido)) l.push(`- Término permitido en este archivo: "${t.termino}"`);
    for (const ra of r.rachas.slice(0, 5)) l.push(`- Contexto (${ra.largo} palabras): "${ra.texto}"`);
    l.push('');
  }
  l.push('', 'Este chequeo no detecta traducciones. La revisión por un subagente sin contexto previo cubre ese caso.');
  if (firmaActiva(kit)) l.push('', 'Hecho con Atajo · github.com/davidricardobc/atajo');
  return l.join('\n') + '\n';
}

// ---------- CLI ----------

export function leerArgumentos(argv) {
  const a = { todo: false, informe: true };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--corpus') a.corpus = argv[++i];
    else if (x === '--kit') a.kit = argv[++i];
    else if (x === '--todo') a.todo = true;
    else if (x === '--sin-informe') a.informe = false;
    else if (x === '--ayuda' || x === '-h' || x === '--help') a.ayuda = true;
  }
  return a;
}

export function main(argv = process.argv.slice(2)) {
  const a = leerArgumentos(argv);
  const uso = 'Uso: node scripts/originalidad.mjs --corpus <carpeta> [--kit <carpeta>] [--todo] [--sin-informe]';
  if (a.ayuda) { console.log(uso); return 0; }
  if (!a.corpus) { console.error(`Falta --corpus.\n${uso}`); return 2; }
  const corpus = path.resolve(a.corpus);
  const kit = path.resolve(a.kit || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
  if (!fs.existsSync(corpus)) { console.error(`No existe la carpeta del corpus: ${corpus}`); return 2; }
  if (!fs.existsSync(kit)) { console.error(`No existe la carpeta del kit: ${kit}`); return 2; }

  const res = revisar({ kit, corpus, todo: a.todo });
  const fecha = fechaLocal();
  if (a.informe) {
    const dir = path.join(kit, 'revisiones');
    fs.mkdirSync(dir, { recursive: true });
    const destino = path.join(dir, `originalidad-${fecha}.md`);
    fs.writeFileSync(destino, informe(res, { kit, corpus, fecha }), 'utf8');
    console.log(`Informe: ${destino}`);
  }
  for (const r of res.resultados) {
    for (const f of r.fallos) console.log(`ROJO     ${r.ruta}: ${f}`);
    for (const av of r.avisos) console.log(`AMARILLO ${r.ruta}: ${av}`);
  }
  console.log(res.fallo
    ? `Falla: revisa los archivos en rojo (${res.resultados.length} revisados).`
    : `En verde: ${res.resultados.length} archivos revisados contra ${res.rutasCorpus.length} del corpus.`);
  return res.fallo ? 1 : 0;
}

const esDirecto = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (esDirecto) process.exitCode = main();
