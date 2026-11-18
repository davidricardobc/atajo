// Funciones compartidas por los scripts de Atajo.
// Sin dependencias. Corre en Node 18 o superior, en Windows y Mac.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MARCA_PLANTILLA = '<!-- plantilla: sin llenar -->';
const CARPETAS_SIEMPRE_FUERA = ['.git', 'node_modules', '.claude', '.agents', '.claude-plugin', 'plugins', '.atajo'];

// Carpetas de datos de la persona (fuera de git). Se crean vacías si faltan.
const CARPETAS_DATOS = [
  'perfil', 'bitacora', 'bitacora/diario', 'decisiones', 'entrevistas', 'revisiones',
  'clientes', 'conocimiento', 'proyectos', 'archivo',
];

/** Lee todo stdin. Si no hay stdin (terminal) o tarda demasiado, devuelve ''. */
export function leerStdin({ esperaMs = 5000 } = {}) {
  return new Promise((resolver) => {
    if (process.stdin.isTTY) return resolver('');
    let texto = '';
    let listo = false;
    const terminar = () => {
      if (listo) return;
      listo = true;
      clearTimeout(reloj);
      resolver(texto);
    };
    const reloj = setTimeout(terminar, esperaMs);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (parte) => { texto += parte; });
    process.stdin.on('end', terminar);
    process.stdin.on('error', terminar);
  });
}

/** Lee stdin y lo interpreta como JSON. Si falla, devuelve {}. */
export async function leerStdinJson(opciones) {
  const texto = await leerStdin(opciones);
  if (!texto.trim()) return {};
  try {
    return JSON.parse(texto);
  } catch {
    return {};
  }
}

/** Busca hacia arriba la carpeta que contiene kit.json. Prueba varias pistas en orden. */
export function encontrarRaiz(pistas = []) {
  const candidatos = [process.env.CLAUDE_PROJECT_DIR, ...pistas, process.cwd()].filter(Boolean);
  for (const candidato of candidatos) {
    let actual = path.resolve(String(candidato));
    for (;;) {
      if (fs.existsSync(path.join(actual, 'kit.json'))) return actual;
      const padre = path.dirname(actual);
      if (padre === actual) break;
      actual = padre;
    }
  }
  return null;
}

function leerJsonSeguro(ruta) {
  try {
    const leido = JSON.parse(leerTexto(ruta));
    return leido && typeof leido === 'object' ? leido : {};
  } catch {
    return {};
  }
}

/**
 * Lee kit.json (valores del kit) y encima kit.local.json (elecciones de la persona, fuera de git).
 * Si falta algo o está roto, devuelve valores por defecto.
 */
export function leerKit(raiz) {
  const base = {
    nombre: 'Atajo',
    version: '',
    firma: '© 2026 David Bajonero',
    firma_en_salidas: true,
    autonomia: 'equilibrado',
    leveling_dia: '',
    inicio: { max_lineas: 80, ahora_max_lineas: 60, cola_lineas: 15 },
    cierre: { tolerancia_segundos: 5 },
    indice: { excluir: ['archivo', 'plantillas', 'clientes'], max_lineas: 200 },
    codex: { modelo: '', nivel_por_defecto: 'medium' },
  };
  const kit = leerJsonSeguro(path.join(raiz, 'kit.json'));
  const local = leerJsonSeguro(path.join(raiz, 'kit.local.json'));
  const anidadas = ['inicio', 'cierre', 'indice', 'codex'];
  const resultado = { ...base, ...kit, ...local };
  for (const clave of anidadas) {
    resultado[clave] = { ...base[clave], ...(kit[clave] || {}), ...(local[clave] || {}) };
  }
  return resultado;
}

/** Lee un archivo UTF-8 y quita el BOM si lo tiene. */
export function leerTexto(ruta) {
  return fs.readFileSync(ruta, 'utf8').replace(/^﻿/, '');
}

/** Escribe solo si el contenido cambió. Crea la carpeta si hace falta. Devuelve true si escribió. */
export function escribirSiCambio(ruta, contenido) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  if (fs.existsSync(ruta) && leerTexto(ruta) === contenido) return false;
  fs.writeFileSync(ruta, contenido, 'utf8');
  return true;
}

/** Fecha local AAAA-MM-DD. */
export function fechaHoy(fecha = new Date()) {
  const aa = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${aa}-${mm}-${dd}`;
}

/** Hora local HH:MM. */
export function horaAhora(fecha = new Date()) {
  return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
}

/** Ruta relativa a la raíz, siempre con barras normales. */
export function rutaRelativa(raiz, ruta) {
  return path.relative(raiz, ruta).split(path.sep).join('/');
}

/**
 * Lista archivos de forma recursiva.
 * excluir: prefijos relativos a la raíz (carpetas o archivos), con barras normales.
 */
export function listarArchivos(raiz, { extensiones = null, excluir = [] } = {}) {
  const fuera = [...CARPETAS_SIEMPRE_FUERA, ...excluir].map((e) => e.replace(/\\/g, '/').replace(/\/+$/, ''));
  const resultado = [];
  const recorrer = (carpeta) => {
    let entradas;
    try {
      entradas = fs.readdirSync(carpeta, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entrada of entradas) {
      const completa = path.join(carpeta, entrada.name);
      const relativa = rutaRelativa(raiz, completa);
      if (fuera.some((f) => relativa === f || relativa.startsWith(`${f}/`))) continue;
      if (entrada.isDirectory()) {
        recorrer(completa);
      } else if (entrada.isFile()) {
        if (extensiones && !extensiones.includes(path.extname(entrada.name).toLowerCase())) continue;
        resultado.push(completa);
      }
    }
  };
  recorrer(raiz);
  return resultado.sort((a, b) => rutaRelativa(raiz, a).localeCompare(rutaRelativa(raiz, b)));
}

/** Verdadero si perfil/quien-soy.md sigue siendo la plantilla sin llenar (o no existe). */
export function perfilSinLlenar(raiz) {
  const ruta = path.join(raiz, 'perfil', 'quien-soy.md');
  if (!fs.existsSync(ruta)) return true;
  return leerTexto(ruta).includes(MARCA_PLANTILLA);
}

/** Línea de firma para archivos generados. Vacía si kit.json o kit.local.json la apagan. */
export function lineaFirma(kit) {
  if (kit.firma_en_salidas === false) return '';
  return `Hecho con ${kit.nombre || 'Atajo'} · ${kit.firma || 'github.com/davidricardobc/atajo'}`;
}

/** Devuelve las líneas de una sección "## Título" hasta el siguiente "## ". */
export function extraerSeccion(texto, titulo) {
  const lineas = texto.split(/\r?\n/);
  const inicio = lineas.findIndex((l) => new RegExp(`^##\\s+${titulo}\\b`, 'i').test(l));
  if (inicio === -1) return null;
  const cuerpo = [];
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (/^##\s/.test(lineas[i])) break;
    cuerpo.push(lineas[i]);
  }
  return cuerpo;
}

/** Argumentos simples: --clave valor, --bandera, y posicionales. */
export function leerArgumentos(argv = process.argv.slice(2)) {
  const banderas = {};
  const posicionales = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const nombre = a.slice(2);
      const siguiente = argv[i + 1];
      if (siguiente !== undefined && !siguiente.startsWith('--')) {
        banderas[nombre] = siguiente;
        i++;
      } else {
        banderas[nombre] = true;
      }
    } else {
      posicionales.push(a);
    }
  }
  return { banderas, posicionales };
}

/** Agrega una línea al diario del día. Crea el archivo con encabezado si no existe. */
export function anotarEnDiario(raiz, linea, fecha = new Date()) {
  const dia = fechaHoy(fecha);
  const ruta = path.join(raiz, 'bitacora', 'diario', `${dia}.md`);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  let contenido = fs.existsSync(ruta) ? leerTexto(ruta) : `# Diario ${dia}\n\n`;
  if (!contenido.endsWith('\n')) contenido += '\n';
  contenido += `${linea}\n`;
  fs.writeFileSync(ruta, contenido, 'utf8');
  return ruta;
}

/**
 * Crea los datos de la persona que falten, copiando desde plantillas/datos/ a la misma ruta.
 * Nunca pisa un archivo que ya existe. Devuelve la lista de rutas relativas creadas.
 */
export function crearDatosFaltantes(raiz) {
  const creados = [];
  for (const carpeta of CARPETAS_DATOS) {
    const ruta = path.join(raiz, ...carpeta.split('/'));
    if (!fs.existsSync(ruta)) {
      fs.mkdirSync(ruta, { recursive: true });
      creados.push(`${carpeta}/`);
    }
  }
  const origen = path.join(raiz, 'plantillas', 'datos');
  if (!fs.existsSync(origen)) return creados;
  for (const archivo of listarArchivos(origen)) {
    const relativa = rutaRelativa(origen, archivo);
    const destino = path.join(raiz, ...relativa.split('/'));
    if (fs.existsSync(destino)) continue;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(archivo, destino);
    creados.push(relativa);
  }
  return creados;
}

/** Ruta de la marca de sesión (fuera de git). */
export function rutaMarcaSesion(raiz) {
  return path.join(raiz, '.atajo', 'sesion.json');
}

/** Escribe la marca de inicio de sesión: cuándo empezó y de dónde vino. */
export function escribirMarcaSesion(raiz, { sessionId = '', origen = 'manual', ahora = new Date() } = {}) {
  const ruta = rutaMarcaSesion(raiz);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const marca = { sesion: String(sessionId || ''), inicio: ahora.toISOString(), inicio_ms: ahora.getTime(), origen };
  fs.writeFileSync(ruta, `${JSON.stringify(marca, null, 2)}\n`, 'utf8');
  return marca;
}

/** Lee la marca de sesión. Devuelve null si no hay o está rota. */
export function leerMarcaSesion(raiz) {
  const ruta = rutaMarcaSesion(raiz);
  if (!fs.existsSync(ruta)) return null;
  try {
    const marca = JSON.parse(leerTexto(ruta));
    if (!marca || typeof marca.inicio_ms !== 'number') return null;
    return marca;
  } catch {
    return null;
  }
}

/** Verdadero si el módulo se ejecutó directamente con node (no importado por otro). */
export function esEjecucionDirecta(metaUrl) {
  if (!process.argv[1]) return false;
  const propia = pathToFileURL(path.resolve(process.argv[1])).href;
  if (process.platform === 'win32') return propia.toLowerCase() === String(metaUrl).toLowerCase();
  return propia === metaUrl;
}

export { MARCA_PLANTILLA, CARPETAS_DATOS };
