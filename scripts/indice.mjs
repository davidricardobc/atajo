#!/usr/bin/env node
// Genera conocimiento/indice.md: una línea por nota del kit, enlaces rotos y huérfanos.
//
// - Como hook PostToolUse (Write|Edit): lee stdin, y solo regenera si el archivo tocado es .md del kit.
// - A mano: node scripts/indice.mjs [--raiz <carpeta>] [--forzar]
//
// Convenciones: enlaces [[nombre]] o [[nombre|texto]], sin ruta ni extensión, nombres únicos.
// Frontmatter opcional: etiquetas: [a, b] y actualizado: AAAA-MM-DD.

import fs from 'node:fs';
import path from 'node:path';
import {
  leerStdinJson, encontrarRaiz, leerKit, leerTexto, listarArchivos, rutaRelativa,
  escribirSiCambio, fechaHoy, lineaFirma, leerArgumentos, esEjecucionDirecta,
} from './lib/comun.mjs';

const ENLACE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g;

export function separarFrontmatter(texto) {
  const lineas = texto.split(/\r?\n/);
  if (lineas[0]?.trim() !== '---') return { meta: {}, cuerpo: lineas };
  const fin = lineas.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (fin === -1) return { meta: {}, cuerpo: lineas };
  const meta = {};
  let claveLista = null;
  for (const linea of lineas.slice(1, fin)) {
    const item = linea.match(/^\s*-\s+(.*)$/);
    if (item && claveLista) {
      meta[claveLista].push(item[1].trim());
      continue;
    }
    const par = linea.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!par) continue;
    const [, clave, valor] = par;
    if (valor.startsWith('[') && valor.endsWith(']')) {
      meta[clave] = valor.slice(1, -1).split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      claveLista = null;
    } else if (valor === '') {
      meta[clave] = [];
      claveLista = clave;
    } else {
      meta[clave] = valor.trim().replace(/^['"]|['"]$/g, '');
      claveLista = null;
    }
  }
  return { meta, cuerpo: lineas.slice(fin + 1) };
}

function limpiarMarkdown(linea) {
  return linea
    .replace(/`([^`]*)`/g, '$1')
    .replace(ENLACE, (_, nombre, texto) => (texto || nombre).trim())
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '')
    .replace(/^\s*>\s?/, '')
    .replace(/<!--.*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function analizarNota(texto, nombreArchivo) {
  const { meta, cuerpo } = separarFrontmatter(texto);
  let titulo = null;
  let frase = '';
  const enlaces = [];
  let enCodigo = false;
  cuerpo.forEach((linea, i) => {
    if (/^\s*```/.test(linea)) {
      enCodigo = !enCodigo;
      return;
    }
    if (enCodigo) return;
    if (titulo === null) {
      const h = linea.match(/^#\s+(.*)$/);
      if (h) {
        titulo = limpiarMarkdown(h[1]);
        return;
      }
    }
    if (!frase && titulo !== null && linea.trim() && !/^#{1,6}\s/.test(linea) && !/^\s*<!--/.test(linea) && !/^\s*\|/.test(linea) && !/^\s*---\s*$/.test(linea)) {
      const limpia = limpiarMarkdown(linea);
      if (limpia) {
        // Primer corte de oración que deje al menos 20 caracteres; si no hay, la línea entera.
        let corte = -1;
        for (const m of limpia.matchAll(/[.!?](?=\s|$)/g)) {
          if (m.index >= 20) { corte = m.index; break; }
        }
        frase = corte >= 0 ? limpia.slice(0, corte + 1) : limpia;
        if (frase.length > 140) frase = `${frase.slice(0, 137).trimEnd()}...`;
      }
    }
    const sinCodigoInline = linea.replace(/`[^`]*`/g, '');
    for (const m of sinCodigoInline.matchAll(ENLACE)) {
      enlaces.push({ destino: m[1].trim(), linea: i + 1 });
    }
  });
  const etiquetas = Array.isArray(meta.etiquetas) ? meta.etiquetas : (meta.etiquetas ? [meta.etiquetas] : []);
  return {
    titulo: titulo ?? nombreArchivo,
    frase,
    etiquetas,
    actualizado: typeof meta.actualizado === 'string' ? meta.actualizado : null,
    enlaces,
  };
}

export function construirIndice(raiz, { ahora = new Date() } = {}) {
  const kit = leerKit(raiz);
  const excluir = Array.isArray(kit.indice.excluir) ? kit.indice.excluir : [];
  const maxLineas = Number(kit.indice.max_lineas) || 200;
  const archivos = listarArchivos(raiz, { extensiones: ['.md'], excluir })
    .filter((a) => {
      const rel = rutaRelativa(raiz, a);
      return rel !== 'AGENTS.md' && !/^conocimiento\/indice[^/]*\.md$/.test(rel) && !/\/\.gitkeep$/.test(rel);
    });

  const notas = archivos.map((archivo) => {
    const rel = rutaRelativa(raiz, archivo);
    const nombre = path.basename(archivo, '.md');
    const datos = analizarNota(leerTexto(archivo), nombre);
    const actualizado = datos.actualizado || fechaHoy(fs.statSync(archivo).mtime);
    return { ruta: rel, nombre, carpeta: rel.includes('/') ? rel.split('/')[0] : 'raiz', ...datos, actualizado, entrantes: 0 };
  });

  const porNombre = new Map();
  for (const nota of notas) {
    const clave = nota.nombre.toLowerCase();
    if (!porNombre.has(clave)) porNombre.set(clave, []);
    porNombre.get(clave).push(nota);
  }
  const duplicados = [...porNombre.entries()].filter(([, lista]) => lista.length > 1);

  const rotos = [];
  let totalEnlaces = 0;
  for (const nota of notas) {
    for (const enlace of nota.enlaces) {
      totalEnlaces++;
      const destino = porNombre.get(enlace.destino.toLowerCase());
      if (destino) destino.forEach((d) => { if (d !== nota) d.entrantes++; });
      else rotos.push({ desde: nota.ruta, destino: enlace.destino, linea: enlace.linea });
    }
  }
  const huerfanos = notas.filter((n) => n.entrantes === 0);

  const lineaNota = (n) => {
    const partes = [`\`${n.ruta}\``, `**${n.titulo}**`];
    if (n.frase) partes.push(n.frase);
    if (n.etiquetas.length) partes.push(n.etiquetas.map((e) => `#${e}`).join(' '));
    partes.push(`sale ${n.enlaces.length} · llega ${n.entrantes}`);
    partes.push(`act. ${n.actualizado}`);
    return `- ${partes.join(' · ')}`;
  };

  const encabezado = [
    '# Índice de conocimiento',
    '',
    `Generado por \`scripts/indice.mjs\` el ${fechaHoy(ahora)}. No lo edites a mano: se regenera al guardar cualquier nota.`,
    `${notas.length} notas · ${totalEnlaces} enlaces · ${rotos.length} rotos · ${huerfanos.length} huérfanas.`,
    '',
    'Cómo usarlo: busca aquí por título y etiquetas, abre máximo tres notas y sigue enlaces solo si la respuesta lo exige.',
    '',
  ];

  const colas = [];
  colas.push('## Enlaces rotos', '');
  colas.push(...(rotos.length ? rotos.map((r) => `- \`[[${r.destino}]]\` en \`${r.desde}\` (línea ${r.linea})`) : ['Ninguno.']));
  colas.push('', '## Huérfanas (sin enlaces entrantes; es señal, no error)', '');
  colas.push(...(huerfanos.length ? huerfanos.map((n) => `- \`${n.ruta}\``) : ['Ninguna.']));
  if (duplicados.length) {
    colas.push('', '## Nombres repetidos (los enlaces [[nombre]] necesitan nombres únicos)', '');
    colas.push(...duplicados.map(([clave, lista]) => `- \`${clave}\`: ${lista.map((n) => `\`${n.ruta}\``).join(', ')}`));
  }
  const firma = lineaFirma(kit);
  const pie = firma ? ['', firma] : [];

  const detalleCompleto = ['## Notas', '', ...notas.map(lineaNota), ''];
  let principal = [...encabezado, ...detalleCompleto, ...colas, ...pie];
  const secundarios = new Map();

  if (principal.length > maxLineas) {
    const carpetas = new Map();
    for (const nota of notas) {
      if (!carpetas.has(nota.carpeta)) carpetas.set(nota.carpeta, []);
      carpetas.get(nota.carpeta).push(nota);
    }
    const resumen = ['## Notas por carpeta', ''];
    for (const [carpeta, lista] of [...carpetas.entries()].sort()) {
      const archivoDetalle = `indice-${carpeta}`;
      resumen.push(`- \`${carpeta}/\` · ${lista.length} notas · detalle en [[${archivoDetalle}]]`);
      const detalle = [
        `# Índice de ${carpeta}`,
        '',
        `Parte de \`conocimiento/indice.md\`. Generado por \`scripts/indice.mjs\` el ${fechaHoy(ahora)}. No lo edites a mano.`,
        '',
        ...lista.map(lineaNota),
        ...pie,
        '',
      ];
      secundarios.set(`conocimiento/${archivoDetalle}.md`, detalle.join('\n'));
    }
    resumen.push('');
    principal = [...encabezado, ...resumen, ...colas, ...pie];
  }

  return { contenido: `${principal.join('\n')}\n`, secundarios, notas, rotos, huerfanos };
}

export function generarIndice(raiz, opciones = {}) {
  const resultado = construirIndice(raiz, opciones);
  const rutaIndice = path.join(raiz, 'conocimiento', 'indice.md');
  const escrito = escribirSiCambio(rutaIndice, resultado.contenido);
  for (const [rel, contenido] of resultado.secundarios) escribirSiCambio(path.join(raiz, rel), contenido);
  // Limpia detalles por carpeta que ya no aplican.
  const carpetaConocimiento = path.join(raiz, 'conocimiento');
  if (fs.existsSync(carpetaConocimiento)) {
    for (const nombre of fs.readdirSync(carpetaConocimiento)) {
      if (/^indice-.*\.md$/.test(nombre) && !resultado.secundarios.has(`conocimiento/${nombre}`)) {
        fs.unlinkSync(path.join(carpetaConocimiento, nombre));
      }
    }
  }
  return { ...resultado, escrito, ruta: rutaIndice };
}

async function principal() {
  const { banderas } = leerArgumentos();
  const entrada = await leerStdinJson();
  const raiz = encontrarRaiz([banderas.raiz, entrada.cwd]);
  if (!raiz) {
    if (!entrada.hook_event_name) console.error('Atajo: no encontré kit.json hacia arriba.');
    return;
  }
  if (entrada.hook_event_name === 'PostToolUse' && !banderas.forzar) {
    const tocado = entrada.tool_input?.file_path || entrada.tool_input?.notebook_path || '';
    if (!/\.md$/i.test(tocado)) return;
    const rel = rutaRelativa(raiz, path.resolve(tocado));
    if (rel.startsWith('..') || /^conocimiento\/indice[^/]*\.md$/.test(rel)) return;
  }
  const resultado = generarIndice(raiz);
  if (!entrada.hook_event_name) {
    console.log(`Índice ${resultado.escrito ? 'actualizado' : 'sin cambios'}: ${rutaRelativa(raiz, resultado.ruta)} · ${resultado.notas.length} notas · ${resultado.rotos.length} enlaces rotos · ${resultado.huerfanos.length} huérfanas.`);
  }
}

if (esEjecucionDirecta(import.meta.url)) {
  principal().catch((error) => {
    console.error(`Atajo: indice.mjs falló sin bloquear: ${error.message}`);
  });
}
