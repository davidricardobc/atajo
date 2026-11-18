#!/usr/bin/env node
// Construye la red: toma un JSON (ver CONTRATO.md) y la plantilla, y escribe <salida>/index.html
// con las imágenes al lado, en <salida>/img/. Sin dependencias: solo Node 18 o superior.
//
// Uso:  node construir.mjs [red.json] [carpeta-de-salida] [--una-pieza]
//   red.json           por defecto ./red.json
//   carpeta-de-salida  por defecto ./salida
//   --una-pieza        mete las imágenes dentro del HTML (un solo archivo para enviar)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, basename, extname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const unaPieza = args.includes('--una-pieza');
const [entrada = 'red.json', salida = 'salida'] = args.filter((a) => !a.startsWith('--'));
const rutaJson = resolve(entrada), carpeta = resolve(salida);
const TIPOS = ['persona', 'prioridad', 'proyecto', 'skill', 'agente', 'decision', 'aprendizaje'];
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.avif': 'image/avif' };

function fallar(msg) { console.error('No se pudo construir: ' + msg); process.exit(1); }
if (!existsSync(rutaJson)) fallar(`no existe ${rutaJson}. Pasa la ruta del JSON: node construir.mjs datos/david.json`);

let red;
try { let txt = readFileSync(rutaJson, 'utf8'); if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1); red = JSON.parse(txt); } catch (e) { fallar(`el JSON no se pudo leer (${e.message}).`); }

// ---- Validación del contrato ----
const avisos = [];
if (!Array.isArray(red.nodos) || !red.nodos.length) fallar('falta la lista "nodos".');
if (!Array.isArray(red.enlaces)) { red.enlaces = []; avisos.push('No hay "enlaces": cada neurona se conecta sola a la persona.'); }
if (!red.persona || !red.persona.nombre) avisos.push('Falta "persona.nombre".');
const ids = new Set();
for (const n of red.nodos) {
  if (n.id == null || n.id === '') fallar('hay un nodo sin "id".');
  if (ids.has(String(n.id))) fallar(`el id "${n.id}" está repetido.`);
  ids.add(String(n.id));
  if (!TIPOS.includes(n.tipo)) fallar(`el nodo "${n.id}" tiene un tipo que no existe: "${n.tipo}". Tipos: ${TIPOS.join(', ')}.`);
  if (!n.nombre) avisos.push(`El nodo "${n.id}" no tiene "nombre": se muestra el id.`);
  if (n.url && !/^(https?|file):\/\//i.test(n.url)) { avisos.push(`La url de "${n.id}" no empieza por http, https o file: se ignora.`); delete n.url; }
}
if (!red.nodos.some((n) => n.tipo === 'persona')) ids.add('yo'); // la persona se crea sola con el id "yo"
// Una ruta local que no existe en este computador: "Abrir" daría error
for (const n of red.nodos) {
  if (!n.ruta || n.url || /^[a-z][a-z0-9+.-]+:\/\//i.test(n.ruta)) continue;
  if (!existsSync(isAbsolute(n.ruta) ? n.ruta : join(resolve(salida), n.ruta))) avisos.push(`La ruta de "${n.id}" no existe en este computador (${n.ruta}): "Abrir" no va a encontrar nada.`);
}
red.enlaces = red.enlaces.filter((e) => {
  const ok = ids.has(String(e.de)) && ids.has(String(e.a));
  if (!ok) avisos.push(`Enlace ignorado: "${e.de}" → "${e.a}" apunta a un id que no existe.`);
  return ok;
});

// ---- Imágenes: se copian al lado, o se incrustan con --una-pieza ----
mkdirSync(carpeta, { recursive: true });
const base = dirname(rutaJson), usados = new Map();
let copiadas = 0;
for (const n of red.nodos) {
  if (!n.imagen) continue;
  if (/^(https?:|data:)/i.test(n.imagen)) { avisos.push(`La imagen de "${n.id}" es remota o incrustada: se quita para no pedir nada a internet.`); delete n.imagen; continue; }
  const origen = isAbsolute(n.imagen) ? n.imagen : join(base, n.imagen);
  const tipo = MIME[extname(origen).toLowerCase()];
  if (!existsSync(origen) || !tipo) { avisos.push(`No se encontró la imagen de "${n.id}" (${n.imagen}): la neurona sale sin foto.`); delete n.imagen; continue; }
  if (unaPieza) { n.imagen = `data:${tipo};base64,${readFileSync(origen).toString('base64')}`; copiadas++; continue; }
  let nombre = basename(origen);
  if (usados.has(nombre) && usados.get(nombre) !== origen) nombre = `${String(n.id).replace(/[^\w-]/g, '_')}-${nombre}`;
  usados.set(nombre, origen);
  mkdirSync(join(carpeta, 'img'), { recursive: true });
  copyFileSync(origen, join(carpeta, 'img', nombre));
  n.imagen = 'img/' + encodeURIComponent(nombre); copiadas++;
}

// ---- Plantilla ----
let html = readFileSync(join(aqui, 'plantilla', 'red.html'), 'utf8');
const leer = (p) => (existsSync(join(aqui, p)) ? readFileSync(join(aqui, p)) : null);
const sans = leer('fuentes/bricolage-grotesque-subset.woff2'), mono = leer('fuentes/geist-mono-subset.woff2');
let fuentes = '';
if (sans) fuentes += `@font-face { font-family: "Bricolage Grotesque"; src: url(data:font/woff2;base64,${sans.toString('base64')}) format("woff2"); font-weight: 200 800; font-display: block; }\n`;
if (mono) fuentes += `@font-face { font-family: "Geist Mono"; src: url(data:font/woff2;base64,${mono.toString('base64')}) format("woff2"); font-weight: 100 900; font-display: block; }\n`;
if (!sans || !mono) avisos.push('Faltan fuentes en fuentes/: la página usa las del sistema.');
const dentro = (svg) => svg.replace(/<\?xml[^>]*>/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
const simbolo = leer('identidad/atajo-simbolo.svg'), favicon = leer('identidad/favicon.svg');
const titulo = String(red.titulo || 'Mi red').replace(/[<>&]/g, '');
const BARRA = String.fromCharCode(92), sep = (c) => String.fromCharCode(c);
// Dentro de <script>: sin '<' y sin separadores de línea Unicode
const datos = JSON.stringify(red).split('<').join(BARRA + 'u003c').split(sep(0x2028)).join(BARRA + 'u2028').split(sep(0x2029)).join(BARRA + 'u2029');

html = html
  .replace('/*__FUENTES__*/', () => fuentes)
  .replace('__TITULO__', () => titulo)
  .replace('__FAVICON__', () => (favicon ? encodeURIComponent(favicon.toString('utf8').replace(/\s+/g, ' ')) : ''))
  .replace('<!--__SIMBOLO__-->', () => (simbolo ? dentro(simbolo.toString('utf8')) : ''))
  .replace(/\/\*__RED__\*\/[\s\S]*?;<\/script>/, () => `${datos};</script>`);
writeFileSync(join(carpeta, 'index.html'), html);

const cuenta = {}; for (const n of red.nodos) cuenta[n.tipo] = (cuenta[n.tipo] || 0) + 1;
console.log(`Red de ${red.persona?.nombre || 'alguien'}: ${red.nodos.length} neuronas, ${red.enlaces.length} enlaces, ${copiadas} imágenes.`);
console.log('  ' + Object.entries(cuenta).map(([t, c]) => `${t} ${c}`).join(' · '));
for (const a of avisos) console.log('  Aviso: ' + a);
console.log('Lista: ' + join(carpeta, 'index.html'));
