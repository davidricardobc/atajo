// Página de la red de Atajo.
//
// aContrato(modelo) convierte el modelo de scripts/red.mjs al formato de
// plantillas/red/CONTRATO.md (persona, nodos, enlaces). construirRed() lo escribe en
// red/red.json y llama a plantillas/red/construir.mjs, que arma red/index.html con la
// pieza visual del kit (un solo HTML, sin internet). Si la pieza no está, deja una
// página mínima para que la persona igual vea algo.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const corto = (t, palabras = 5) => {
  const p = String(t || '').trim().split(/\s+/);
  return p.length > palabras ? `${p.slice(0, palabras).join(' ')}…` : p.join(' ');
};
const mayuscula = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);
const normal = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Palabras que no deben cerrar un texto recortado ("Hago tortas por encargo en").
const ENLACES = new Set(['a', 'al', 'con', 'de', 'del', 'el', 'en', 'la', 'las', 'lo', 'los', 'mi', 'mis', 'o', 'para', 'por', 'que', 'su', 'sus', 'u', 'un', 'una', 'y']);
// Recorta en palabra completa, sin puntos suspensivos y sin terminar en una palabra de enlace.
export const recortar = (t, palabras = 6) => {
  let p = String(t || '').trim().split(/\s+/).filter(Boolean);
  if (p.length > palabras) {
    p = p.slice(0, palabras);
    // Si se corta, mejor antes de la última "y": "Elegir 5 empresas y mandar" -> "Elegir 5 empresas".
    const y = p.map(normal).lastIndexOf('y');
    if (y >= 2) p = p.slice(0, y);
    // Un número suelto al final solo sobra si va pegado a un artículo ("para las 3"); "capítulo 2" se queda.
    const colgando = () => ENLACES.has(normal(p[p.length - 1]))
      || (/^\d+$/.test(p[p.length - 1]) && p.length > 2 && ENLACES.has(normal(p[p.length - 2])));
    while (p.length > 1 && colgando()) p.pop();
  }
  while (p.length > 1 && ENLACES.has(normal(p[p.length - 1]))) p.pop();
  return p.join(' ');
};
// "soy AI builder; construyo..." -> "AI builder": la primera idea de la frase, entera.
export const rolCorto = (frase) => {
  const primera = String(frase || '').split(/[;,.:()]|\s+(?:y|e|pero)\s+/i)[0].replace(/^(soy|trabajo como|me dedico a)\s+/i, '').trim();
  return primera ? recortar(primera, 6) : 'Hecho con Atajo';
};
// Una línea por skill del kit. Las skills propias (mi-*) usan su primera frase, recortada.
const FRASES_SKILLS = {
  arranque: 'Tu plan de la semana en 4 preguntas.',
  retomar: 'En qué ibas y el siguiente paso.',
  red: 'Tu sistema como una red.',
  leveling: 'Una mejora por semana.',
  entrevista: 'Saca lo que tienes en la cabeza.',
  auditoria: 'Revisa el sistema con evidencia.',
  conectar: 'Enlaza proyectos y herramientas.',
  diagnostico: 'Escucha al cliente antes de proponer.',
  propuesta: 'Tres opciones con precio, en borrador.',
  aprender: 'Lecciones con fuente.',
  seguridad: 'Revisa datos personales y claves.',
  publicar: 'Nada sale sin tu sí.',
  codex: 'Delega encargos a Codex.',
  equipo: 'Reparte un encargo entre agentes.',
};
export const fraseSkill = (s) => FRASES_SKILLS[s.nombre]
  || (s.descripcion ? `${mayuscula(recortar(String(s.descripcion).replace(/\.$/, ''), 8))}.` : undefined);
// "Entregar el capítulo 2 · P1 tesis · jueves" -> "Entregar el capítulo 2".
const tareaLimpia = (t) => String(t || '').split(' · ')[0].replace(/^candidata para \W*leveling\W*:\s*/i, '').replace(/\([^)]*\)/g, ' ').replace(/`/g, '').replace(/\s+/g, ' ').trim();
const id = (prefijo, i) => `${prefijo}${i + 1}`;

/** Modelo de red.mjs → JSON del contrato de la red. */
export function aContrato(m) {
  const nodos = [];
  const enlaces = [];
  const personaId = 'yo';
  nodos.push({ id: personaId, tipo: 'persona', nombre: m.persona.nombre, frase: m.persona.frase ? mayuscula(m.persona.frase) + '.' : undefined });

  const prioridades = m.prioridades.map((p, i) => {
    const n = { id: `p${i + 1}`, tipo: 'prioridad', nombre: mayuscula(recortar(p.titulo, 6)), frase: [p.senal && `Señal: ${p.senal}.`, p.fecha && `Fecha: ${p.fecha}.`].filter(Boolean).join(' '), peso: 6, clave: p.id };
    nodos.push(n);
    return { ...n, texto: normal(`${p.titulo} ${p.que}`) };
  });
  const prioridadDe = (texto) => {
    const marca = (String(texto).match(/\bP(\d)\b/) || [])[1];
    if (marca) return prioridades[Number(marca) - 1];
    const t = normal(texto);
    return prioridades.find((p) => t.split(/\W+/).some((w) => w.length > 4 && p.texto.includes(w)));
  };

  // Proyectos enlazados y frentes abiertos: los dos se ven como proyectos.
  const vistos = new Set();
  m.proyectos.forEach((p, i) => {
    const n = { id: id('r', i), tipo: 'proyecto', nombre: corto(p.nombre, 4), frase: p.para ? mayuscula(p.para) + '.' : undefined, peso: 7 };
    if (/^https?:\/\//i.test(p.donde)) n.url = p.donde;
    else if (p.donde && /^[a-z]:\\|^\//i.test(p.donde)) n.ruta = p.donde;
    nodos.push(n);
    vistos.add(normal(p.nombre));
    const pr = prioridadDe(`${p.nombre} ${p.para}`);
    if (pr) enlaces.push({ de: n.id, a: pr.id, tipo: 'sirve a' });
  });
  m.bitacora.frentes.forEach((f, i) => {
    if (vistos.has(normal(f.nombre))) return;
    vistos.add(normal(f.nombre));
    const n = { id: id('f', i), tipo: 'proyecto', nombre: corto(f.nombre, 4), frase: f.detalle ? mayuscula(f.detalle) : undefined, peso: 8 };
    nodos.push(n);
    const pr = prioridadDe(f.prioridad || f.nombre);
    if (pr) enlaces.push({ de: n.id, a: pr.id, tipo: 'sirve a' });
  });

  // Lo que viene en la Cola (máximo 5): hace que la red de alguien nuevo se vea viva.
  (m.bitacora.cola || [])
    .map((c) => ({ ...c, nombre: recortar(tareaLimpia(c.texto), 6) }))
    .filter((c) => c.nombre && !vistos.has(normal(c.nombre)))
    .slice(0, 5)
    .forEach((c, i) => {
      vistos.add(normal(c.nombre));
      const n = { id: id('t', i), tipo: 'proyecto', nombre: mayuscula(c.nombre), frase: `Puesto ${i + 1} de tu Cola.`, peso: 4 };
      nodos.push(n);
      const pr = prioridadDe(c.prioridad || c.texto);
      if (pr) enlaces.push({ de: n.id, a: pr.id, tipo: 'sirve a' });
    });

  m.decisiones.slice(0, 4).forEach((d, i) => nodos.push({ id: id('d', i), tipo: 'decision', nombre: corto(d.titulo, 5), frase: `Decidido el ${d.fecha}.`, peso: 3 }));
  (m.aprendizajes || []).slice(0, 4).forEach((a, i) => nodos.push({ id: id('a', i), tipo: 'aprendizaje', nombre: corto(a.tema || a.texto, 4), frase: a.texto, peso: 3 }));
  m.skills.slice(0, 24).forEach((s, i) => nodos.push({ id: id('s', i), tipo: 'skill', nombre: `/${s.nombre}`, frase: fraseSkill(s), peso: 2 }));

  for (const n of nodos) { delete n.clave; for (const k of Object.keys(n)) if (n[k] === undefined || n[k] === '') delete n[k]; }
  return { titulo: m.persona.titulo || 'Mi red', persona: { nombre: m.persona.nombre, rol: rolCorto(m.persona.frase) }, nodos, enlaces };
}

function paginaMinima(contrato) {
  const lista = contrato.nodos.map((n) => `<li><b>${esc(n.nombre)}</b> <small>${esc(n.tipo)}</small><br>${esc(n.frase || '')}</li>`).join('\n');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(contrato.titulo)}</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:720px;margin:32px auto;padding:0 16px;background:#0e1116;color:#e8ecf2}small{color:#8b95a5}li{margin:8px 0}</style></head>
<body><h1>${esc(contrato.titulo)}</h1><p>Falta la pieza visual del kit (plantillas/red). Esta es la lista de tu red.</p><ul>${lista}</ul></body></html>\n`;
}

/**
 * Escribe red/red.json y red/index.html dentro de `raiz`. Devuelve { pagina, mensaje }.
 * `kit` es la carpeta del kit donde vive plantillas/red (por defecto, la misma raíz).
 */
export function construirRed(raiz, modelo, { kit = raiz } = {}) {
  const carpeta = path.join(raiz, 'red');
  fs.mkdirSync(carpeta, { recursive: true });
  const contrato = aContrato(modelo);
  const json = path.join(carpeta, 'red.json');
  fs.writeFileSync(json, JSON.stringify(contrato, null, 2) + '\n', 'utf8');
  const pagina = path.join(carpeta, 'index.html');
  const constructor = path.join(kit, 'plantillas', 'red', 'construir.mjs');
  if (fs.existsSync(constructor)) {
    const r = spawnSync(process.execPath, [constructor, json, carpeta], { encoding: 'utf8', timeout: 30000 });
    if (r.status === 0) return { pagina, mensaje: (r.stdout || '').trim().replace(/^Red de Tú:/, 'Tu red:'), contrato };
    fs.writeFileSync(pagina, paginaMinima(contrato), 'utf8');
    return { pagina, mensaje: `La pieza visual no se construyó: ${(r.stderr || r.stdout || '').trim().slice(0, 200)}. Dejé una página simple.`, contrato };
  }
  fs.writeFileSync(pagina, paginaMinima(contrato), 'utf8');
  return { pagina, mensaje: 'No encontré plantillas/red: dejé una página simple con la lista.', contrato };
}
