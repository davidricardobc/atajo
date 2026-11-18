#!/usr/bin/env node
// Hook PreToolUse de Atajo: la guardia.
//
// - Comandos que publican, despliegan o descartan trabajo: pide confirmación (ask).
// - Rutas de secretos (.env, .envrc, *.pem, *.key, *.p12, *.pfx, id_rsa*, credentials*, secrets.json):
//   bloquea (deny) en Bash, PowerShell, Read, Edit, Write, MultiEdit, NotebookEdit y Grep.
//   Solo aplica a comandos que leen o copian contenido: listar nombres (ls, git ls-files,
//   git check-ignore, Test-Path) sí se puede.
// - Entrada vacía o ilegible: pide confirmación (no deja pasar a ciegas).
// Si no hay nada que decir, no imprime nada y la herramienta sigue.
//
// La guardia es una red de seguridad, no una garantía: un comando puede esquivarla.
// Las reglas de CLAUDE.md y el sí explícito de la persona siguen siendo la primera línea.
//
// Uso manual: echo '{"tool_name":"Bash","tool_input":{"command":"git push"}}' | node scripts/guardia.mjs

import path from 'node:path';
import { leerStdin, esEjecucionDirecta } from './lib/comun.mjs';
import { nombreEsSecreto, comodinAlcanzaSecreto } from './lib/secretos.mjs';

export { nombreEsSecreto };

const HERRAMIENTAS_DE_COMANDO = new Set(['Bash', 'PowerShell']);

// `git` con opciones globales antes del subcomando: git -C x push, git -c a=b push.
const GIT = String.raw`\bgit\b(?:\s+(?:-C\s+\S+|-c\s+\S+|--git-dir=\S+|--work-tree=\S+|--no-pager))*\s+`;
const g = (resto, banderas = 'i') => new RegExp(GIT + resto, banderas);

const PUBLICACION = [
  { patron: g(String.raw`push\b`), motivo: 'git push publica tus cambios en el repositorio remoto y puede disparar un despliegue' },
  { patron: g(String.raw`reset\s+(?:\S+\s+)*--hard\b`), motivo: 'git reset --hard descarta cambios sin pasar por archivo/' },
  { patron: g(String.raw`clean\b(?=[^\n;|&]*\s-[a-zA-Z]*[fF])`), motivo: 'git clean con -f borra archivos sin rastrear de forma irreversible' },
  { patron: g(String.raw`checkout\s+(?:\S+\s+)*--\s+\.`), motivo: 'git checkout -- . descarta todos los cambios locales' },
  { patron: g(String.raw`checkout\s+(?:\S+\s+)*\.(?:\s|$)`), motivo: 'git checkout . descarta todos los cambios locales' },
  { patron: g(String.raw`restore\s+(?:\S+\s+)*\.(?:\s|$)`), motivo: 'git restore . descarta todos los cambios locales' },
  { patron: g(String.raw`restore\s+(?:\S+\s+)*--worktree\b`), motivo: 'git restore --worktree descarta cambios locales' },
  { patron: g(String.raw`stash\s+(?:drop|clear)\b`), motivo: 'git stash drop o clear borra trabajo guardado' },
  { patron: g(String.raw`branch\s+(?:\S+\s+)*-D\b`, ''), motivo: 'git branch -D borra una rama aunque no esté fusionada' },
  { patron: g(String.raw`push\s+.*--(?:force|delete)\b`), motivo: 'git push con --force o --delete reescribe o borra en el remoto' },
  { patron: /\bvercel\b/i, motivo: 'vercel puede desplegar o cambiar el sitio publicado' },
  { patron: /\bnetlify\b/i, motivo: 'netlify puede desplegar o cambiar el sitio publicado' },
  { patron: /\bwrangler\s+(deploy|publish)\b/i, motivo: 'wrangler deploy publica en Cloudflare' },
  { patron: /\bfirebase\s+deploy\b/i, motivo: 'firebase deploy publica en producción' },
  { patron: /\baz\s+(webapp|staticwebapp|functionapp|containerapp|deployment|network\s+dns)\b/i, motivo: 'este comando de Azure toca recursos publicados o DNS' },
  { patron: /\bgh\s+(release|pr\s+merge)\b/i, motivo: 'este comando de GitHub publica una versión o fusiona en la rama principal' },
  { patron: /\bnpm\s+publish\b/i, motivo: 'npm publish sube un paquete público' },
  { patron: /\brm\s+(?:\S+\s+)*(?:-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)\b/, motivo: 'rm recursivo borra carpetas completas sin pasar por archivo/' },
  { patron: /\b(?:Remove-Item|ri|rmdir|rd)\b[^\n;|&]*\s-(?:r|re|rec|recu|recur|recurs|recurse)\b/i, motivo: 'Remove-Item -Recurse borra carpetas completas sin pasar por archivo/' },
  { patron: /\b(?:rmdir|rd)\s+(?:\S+\s+)*\/[sS]\b/, motivo: 'rmdir /s borra carpetas completas' },
  { patron: /\bdel\s+(?:\S+\s+)*\/[sSqQ]\b/, motivo: 'del con /s o /q borra sin preguntar' },
  { patron: /\bfind\b[^\n;|&]*\s-(?:delete\b|exec(?:dir)?\s+(?:rm|del|Remove-Item)\b)/i, motivo: 'find con -delete o -exec rm borra archivos en bloque sin pasar por archivo/' },
];

// Comandos que solo listan nombres o estado: no leen contenido, así que un nombre de secreto no se bloquea.
const SOLO_NOMBRES = [
  // find solo lista si no trae acciones: con -exec, -ok o -delete puede leer o borrar.
  /^(?:ls|ll|dir|find(?![^\n]*\s-(?:exec|execdir|ok|okdir|delete|fprint|fprintf|fls)\b)|stat|file|test|\[|\[\[|touch|basename|dirname|realpath|readlink|du|wc\s+-[lc]*\s)/i,
  /^(?:Test-Path|Get-ChildItem|gci|Get-Item|gi|Resolve-Path|Split-Path|Join-Path)\b/i,
  /^git\b(?:\s+(?:-C\s+\S+|-c\s+\S+|--no-pager))*\s+(?:check-ignore|ls-files|status|rm\s+--cached|diff\s+--(?:name-only|name-status|stat)|log(?!.*\s-(?:p|L|G)\b)(?!.*--patch))\b/i,
];

// Comandos que leen archivos sin nombrarlos directamente en la línea.
const LECTURA_INDIRECTA = [
  { patron: /\b(?:node\s+(?:-e|--eval|-p|--print)|python3?\s+-c|ruby\s+-e|perl\s+-e|php\s+-r)\b/i, motivo: 'un comando de una línea que nombra un archivo de secretos' },
];

/**
 * Parte el comando en segmentos (por ; | || && & y saltos de línea) respetando comillas,
 * y cada segmento en tokens sin comillas. Devuelve [{ texto, tokens }].
 */
export function segmentos(comando) {
  const texto = String(comando);
  const resultado = [];
  let actual = [];
  let token = '';
  let comilla = null;
  let enToken = false;
  const cerrarToken = () => {
    if (enToken) actual.push(token);
    token = '';
    enToken = false;
  };
  const cerrarSegmento = () => {
    cerrarToken();
    if (actual.length) resultado.push({ tokens: actual.map((t) => t.replace(/^[<>]+/, '')).filter(Boolean) });
    actual = [];
  };
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comilla) {
      if (c === comilla) comilla = null;
      else token += c;
      enToken = true;
      continue;
    }
    if (c === '"' || c === "'") { comilla = c; enToken = true; continue; }
    if (c === ';' || c === '\n' || c === '|' || c === '&') { cerrarSegmento(); continue; }
    if (c === '(' || c === ')') { cerrarToken(); continue; }
    if (/\s/.test(c)) { cerrarToken(); continue; }
    if (c === '<' || c === '>') { cerrarToken(); continue; }
    token += c;
    enToken = true;
  }
  cerrarSegmento();
  for (const s of resultado) s.texto = s.tokens.join(' ');
  return resultado;
}

function esSoloNombres(segmento) {
  return SOLO_NOMBRES.some((p) => p.test(segmento.texto));
}

const BUSCADORES = /^(?:grep|egrep|fgrep|rg|ag|ack|findstr|Select-String|sls)$/i;

/** En grep y parecidos, el primer no-opción (o lo que sigue a -e) es el patrón, no un archivo. */
function sinPatronDeBusqueda(lista) {
  if (!lista.length || !BUSCADORES.test(lista[0])) return lista;
  const salida = [lista[0]];
  let patronVisto = false;
  for (let i = 1; i < lista.length; i++) {
    const t = lista[i];
    if (/^(?:-e|--regexp|-Pattern)$/i.test(t)) { i++; patronVisto = true; continue; }
    if (t.startsWith('-')) { salida.push(t); continue; }
    if (!patronVisto) { patronVisto = true; continue; }
    salida.push(t);
  }
  return salida;
}

// Un shell que recibe otro comando entre comillas: bash -c "cat .env", powershell -Command "...", cmd /c, eval.
const SHELLS = /^(?:bash|sh|zsh|dash|ksh|fish|cmd|powershell|pwsh|eval)(?:\.exe)?$/i;
const BANDERA_DE_COMANDO = /^(?:-[a-z]*c|\/[ck]|-command|--command)$/i;

/** Si el segmento es un shell anidado, devuelve el comando interno; si no, null. */
export function comandoAnidado(segmento) {
  const [primero, ...resto] = segmento.tokens;
  if (!primero || !SHELLS.test(path.basename(primero.replace(/\\/g, '/')))) return null;
  if (/^eval$/i.test(primero)) return resto.join(' ') || null;
  const i = resto.findIndex((t) => BANDERA_DE_COMANDO.test(t));
  return i === -1 ? null : resto.slice(i + 1).join(' ') || null;
}

/** Busca un secreto en un comando. Devuelve { nombre, tipo } o null. */
export function secretoEnComando(comando, profundidad = 0) {
  for (const segmento of segmentos(comando)) {
    const interno = profundidad < 3 ? comandoAnidado(segmento) : null;
    if (interno) {
      const hallado = secretoEnComando(interno, profundidad + 1);
      if (hallado) return hallado;
      continue;
    }
    if (esSoloNombres(segmento)) continue;
    const lista = sinPatronDeBusqueda(segmento.tokens);
    const indirecta = LECTURA_INDIRECTA.some((r) => r.patron.test(segmento.texto));
    for (const token of lista) {
      // Dentro de node -e / python -c el archivo viene pegado a comillas o funciones: se buscan trozos.
      const partes = indirecta ? token.split(/[^\w.\-\\/*?[\]]+/) : [token];
      for (const parte of partes) {
        if (!parte) continue;
        const tipo = nombreEsSecreto(parte) || comodinAlcanzaSecreto(parte);
        if (tipo) return { nombre: path.basename(parte.replace(/\\/g, '/')), tipo };
      }
    }
  }
  return null;
}

/** grep -r (o -R) sin ruta o sobre la raíz lee todos los archivos, incluidos los de secretos. */
export function grepSobreTodo(comando) {
  for (const segmento of segmentos(comando)) {
    const lista = segmento.tokens;
    if (!lista.length || !/^(?:grep|egrep|fgrep)$/i.test(lista[0])) continue;
    const recursivo = lista.slice(1).some((t) => /^-[a-zA-Z]*[rR]/.test(t) || t === '--recursive' || t === '--dereference-recursive');
    if (!recursivo) continue;
    const sinOpciones = lista.slice(1).filter((t) => !t.startsWith('-'));
    // El primer no-opción es el patrón; lo que sigue son rutas.
    const rutas = sinOpciones.slice(1);
    const excluye = lista.some((t) => /^--exclude/.test(t));
    if (excluye) continue;
    if (rutas.length === 0) return true;
    if (rutas.every((r) => /^(?:\.|\.\/|\/|~|~\/|\$HOME|\.\.|\*)$/.test(r))) return true;
  }
  return false;
}

function negar(candidato, tipo) {
  return {
    permissionDecision: 'deny',
    permissionDecisionReason: `Atajo bloqueó el acceso a ${path.basename(String(candidato).replace(/\\/g, '/'))}: los archivos ${tipo} guardan secretos y no se leen, muestran ni editan desde el agente. Si necesitas un valor, pídele a la persona que lo configure a mano.`,
  };
}

function pedirSi(motivo) {
  return {
    permissionDecision: 'ask',
    permissionDecisionReason: `Atajo pide confirmación: ${motivo}. Antes de aprobar, revisa resultado, pruebas, impacto y cómo revertir (skill /publicar). Un sí aquí queda registrado en bitacora/aprobaciones.md.`,
  };
}

/** Devuelve la decisión para una entrada de PreToolUse, o null si no aplica. */
export function decidir(entrada) {
  const herramienta = entrada.tool_name || '';
  const datos = entrada.tool_input || {};
  const esComando = HERRAMIENTAS_DE_COMANDO.has(herramienta);
  const comando = esComando ? String(datos.command || datos.script || '') : '';

  // 1. Secretos: bloqueo en cualquier herramienta que lea, edite o busque contenido.
  if (esComando) {
    const hallado = secretoEnComando(comando);
    if (hallado) return negar(hallado.nombre, hallado.tipo);
  }
  for (const campo of ['file_path', 'path', 'notebook_path']) {
    if (!datos[campo]) continue;
    const tipo = nombreEsSecreto(datos[campo]);
    if (tipo) return negar(datos[campo], tipo);
  }
  if (herramienta === 'Grep' && datos.glob) {
    const tipo = nombreEsSecreto(datos.glob) || comodinAlcanzaSecreto(datos.glob);
    if (tipo) return negar(datos.glob, tipo);
  }

  // 2. Publicación o borrado: pedir el sí.
  if (esComando) {
    if (/\s-(?:e|ec|enc|encodedcommand)\s/i.test(` ${comando} `) && /\b(?:powershell|pwsh)\b/i.test(comando)) {
      return pedirSi('powershell con -EncodedCommand oculta el comando real y la guardia no puede revisarlo');
    }
    for (const regla of PUBLICACION) {
      if (regla.patron.test(comando)) return pedirSi(regla.motivo);
    }
    if (grepSobreTodo(comando)) {
      return pedirSi('grep recursivo sin ruta o sobre la raíz lee todos los archivos, incluidos .env y credenciales. Dale una carpeta concreta o usa --exclude');
    }
  }
  return null;
}

async function principal() {
  const crudo = await leerStdin();
  if (!crudo.trim()) {
    imprimir({ permissionDecision: 'ask', permissionDecisionReason: 'La guardia de Atajo no recibió la entrada del hook. Revisa la acción antes de aprobar.' });
    return;
  }
  let entrada;
  try {
    entrada = JSON.parse(crudo);
  } catch {
    // Entrada ilegible: se revisa como texto y, si no hay motivo claro, se pide confirmación.
    const decision = decidir({ tool_name: 'Bash', tool_input: { command: crudo } })
      || { permissionDecision: 'ask', permissionDecisionReason: 'La guardia de Atajo no pudo leer la entrada del hook. Revisa la acción antes de aprobar.' };
    imprimir(decision);
    return;
  }
  const decision = decidir(entrada || {});
  if (decision) imprimir(decision);
}

function imprimir(decision) {
  const salida = { hookSpecificOutput: { hookEventName: 'PreToolUse', ...decision } };
  process.stdout.write(`${JSON.stringify(salida)}\n`);
}

if (esEjecucionDirecta(import.meta.url)) {
  principal().catch((error) => {
    // Si la guardia falla, no deja pasar nada peligroso a ciegas: pide confirmación.
    imprimir({ permissionDecision: 'ask', permissionDecisionReason: `La guardia de Atajo falló (${error.message}). Revisa el comando antes de aprobar.` });
  });
}
