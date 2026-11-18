#!/usr/bin/env node
// Verificación del kit: lo que se puede comprobar sin abrir Claude Code.
//
// - Cada skill de .claude/skills tiene frontmatter con name (igual a su carpeta) y description.
// - La copia para Codex (.agents/skills y AGENTS.md) está al día.
// - Los enlaces internos [texto](ruta) de los Markdown del kit apuntan a archivos que existen.
// - Los JSON del kit se leen bien y las skills y agentes del marketplace existen.
// - La versión de kit.json coincide con la del marketplace y con la primera de CHANGELOG.md.
// - Los instaladores tienen sintaxis válida (bash -n y el parser de PowerShell, si están).
//
// Uso: node scripts/verificar.mjs [--raiz <carpeta>]
// Sale con código 0 si todo pasa y 1 si algo falla. Lo corre .github/workflows/verificar.yml.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listarArchivos, leerArgumentos, esEjecucionDirecta, CARPETAS_DATOS } from './lib/comun.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

/** Lee el frontmatter simple (clave: valor) de un SKILL.md. Devuelve null si no hay. */
export function leerFrontmatter(texto) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(texto);
  if (!m) return null;
  const datos = {};
  for (const linea of m[1].split(/\r?\n/)) {
    const par = /^([A-Za-z_-]+):\s*(.*)$/.exec(linea);
    if (par) datos[par[1]] = par[2].trim();
  }
  return datos;
}

/** Problemas de frontmatter en .claude/skills. */
export function revisarSkills(raiz) {
  const problemas = [];
  const base = path.join(raiz, '.claude', 'skills');
  if (!fs.existsSync(base)) return ['no existe .claude/skills'];
  for (const carpeta of fs.readdirSync(base, { withFileTypes: true })) {
    if (!carpeta.isDirectory()) continue;
    const ruta = path.join(base, carpeta.name, 'SKILL.md');
    if (!fs.existsSync(ruta)) { problemas.push(`${carpeta.name}: falta SKILL.md`); continue; }
    const fm = leerFrontmatter(fs.readFileSync(ruta, 'utf8'));
    if (!fm) { problemas.push(`${carpeta.name}: SKILL.md sin frontmatter`); continue; }
    if (fm.name !== carpeta.name) problemas.push(`${carpeta.name}: name es "${fm.name || ''}" y debe ser "${carpeta.name}"`);
    if (!fm.description) problemas.push(`${carpeta.name}: falta description`);
    else if (fm.description.length > 1024) problemas.push(`${carpeta.name}: description pasa de 1024 caracteres`);
  }
  return problemas;
}

/** Enlaces Markdown relativos rotos en los .md del kit (sin datos de la persona ni plantillas). */
export function revisarEnlaces(raiz) {
  const problemas = [];
  const excluir = [...CARPETAS_DATOS, 'plantillas', 'node_modules', 'conexiones.md', 'CLAUDE.local.md'];
  const archivos = listarArchivos(raiz, { extensiones: ['.md'], excluir });
  const enlace = /(?<!!)\[[^\]\n]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const archivo of archivos) {
    const texto = fs.readFileSync(archivo, 'utf8').replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
    for (const m of texto.matchAll(enlace)) {
      const destino = m[1];
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(destino)) continue;
      const limpio = decodeURIComponent(destino.split('#')[0]);
      if (!limpio) continue;
      if (!fs.existsSync(path.resolve(path.dirname(archivo), limpio))) {
        problemas.push(`${path.relative(raiz, archivo).replace(/\\/g, '/')}: enlace roto a ${destino}`);
      }
    }
  }
  return problemas;
}

/** JSON del kit, skills del marketplace y versiones. */
export function revisarJsonYVersiones(raiz) {
  const problemas = [];
  const leer = (rel) => {
    const ruta = path.join(raiz, rel);
    if (!fs.existsSync(ruta)) { problemas.push(`falta ${rel}`); return null; }
    try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch (e) { problemas.push(`${rel}: JSON inválido (${e.message})`); return null; }
  };
  const kit = leer('kit.json');
  leer('.claude/settings.json');
  leer('plantillas/datos/kit.local.json');
  const mercado = leer('.claude-plugin/marketplace.json');
  const version = kit && kit.version;
  if (mercado) {
    if (version && mercado.version !== version) problemas.push(`marketplace.json dice ${mercado.version} y kit.json ${version}`);
    for (const plugin of mercado.plugins || []) {
      if (version && plugin.version !== version) problemas.push(`plugin ${plugin.name}: versión ${plugin.version}, kit.json ${version}`);
      for (const skill of plugin.skills || []) {
        if (!fs.existsSync(path.join(raiz, skill, 'SKILL.md'))) problemas.push(`plugin ${plugin.name}: no existe ${skill}/SKILL.md`);
      }
      for (const agente of plugin.agents || []) {
        if (!fs.existsSync(path.join(raiz, agente))) problemas.push(`plugin ${plugin.name}: no existe ${agente}`);
      }
    }
  }
  const cambios = path.join(raiz, 'CHANGELOG.md');
  if (version && fs.existsSync(cambios)) {
    const primera = /^## (\d+\.\d+\.\d+)/m.exec(fs.readFileSync(cambios, 'utf8'));
    if (!primera || primera[1] !== version) problemas.push(`CHANGELOG.md empieza en ${primera ? primera[1] : 'ninguna versión'} y kit.json dice ${version}`);
  }
  return problemas;
}

function correrHerramienta(comando, args) {
  const r = spawnSync(comando, args, { encoding: 'utf8', timeout: 60000 });
  if (r.error) return null; // la herramienta no está
  return { codigo: r.status, salida: `${r.stdout || ''}${r.stderr || ''}`.trim() };
}

/** Sintaxis de los instaladores. Devuelve { problemas, omitidos }. */
export function revisarInstaladores(raiz) {
  const problemas = [];
  const omitidos = [];
  const sh = path.join(raiz, 'scripts', 'instalar.sh');
  const ps = path.join(raiz, 'scripts', 'instalar.ps1');
  // En Windows, "bash" puede ser el lanzador de WSL (System32\bash.exe), lento o colgado.
  // Se usa el bash de Git for Windows si existe; si no, se omite.
  let exeBash = 'bash';
  if (process.platform === 'win32') {
    const candidatos = [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs')]
      .filter(Boolean).map((base) => path.join(base, 'Git', 'bin', 'bash.exe'));
    exeBash = candidatos.find((c) => fs.existsSync(c)) || null;
  }
  const bash = exeBash ? correrHerramienta(exeBash, ['-n', sh]) : null;
  if (!bash) omitidos.push('bash -n (no hay bash; en Windows se busca el de Git for Windows)');
  else if (bash.codigo !== 0) problemas.push(`instalar.sh: ${bash.salida}`);
  const parser = `$e=$null; [System.Management.Automation.Language.Parser]::ParseFile($env:ATAJO_PS1,[ref]$null,[ref]$e) | Out-Null; if ($e.Count) { $e | ForEach-Object { $_.ToString() }; exit 1 }`;
  let psOk = false;
  for (const exe of ['pwsh', 'powershell']) {
    const r = spawnSync(exe, ['-NoProfile', '-NonInteractive', '-Command', parser], { encoding: 'utf8', timeout: 60000, env: { ...process.env, ATAJO_PS1: ps } });
    if (r.error) continue;
    psOk = true;
    if (r.status !== 0) problemas.push(`instalar.ps1: ${`${r.stdout || ''}${r.stderr || ''}`.trim()}`);
    break;
  }
  if (!psOk) omitidos.push('parser de PowerShell (no hay pwsh ni powershell)');
  if (/[^\x00-\x7F]/.test(fs.readFileSync(ps, 'utf8'))) problemas.push('instalar.ps1 debe ser ASCII (PowerShell 5.1 lee mal los acentos sin BOM)');
  return { problemas, omitidos };
}

function revisarCodex(raiz) {
  const r = spawnSync(process.execPath, [path.join(AQUI, 'sincronizar-skills.mjs'), '--raiz', raiz, '--verificar'], { encoding: 'utf8' });
  return r.status === 0 ? [] : [`copia para Codex desincronizada: corre node scripts/sincronizar-skills.mjs\n${(r.stdout || '').trim()}`];
}

export function verificar(raiz) {
  const instaladores = revisarInstaladores(raiz);
  const grupos = [
    ['Skills con frontmatter válido', revisarSkills(raiz)],
    ['Copia para Codex al día', revisarCodex(raiz)],
    ['Enlaces internos', revisarEnlaces(raiz)],
    ['JSON, marketplace y versiones', revisarJsonYVersiones(raiz)],
    ['Sintaxis de los instaladores', instaladores.problemas],
  ];
  return { grupos, omitidos: instaladores.omitidos };
}

if (esEjecucionDirecta(import.meta.url)) {
  const args = leerArgumentos();
  const raiz = path.resolve(args.banderas.raiz || path.join(AQUI, '..'));
  const { grupos, omitidos } = verificar(raiz);
  let fallas = 0;
  for (const [nombre, problemas] of grupos) {
    if (problemas.length === 0) { console.log(`[ok] ${nombre}`); continue; }
    fallas += problemas.length;
    console.log(`[falla] ${nombre}`);
    for (const p of problemas) console.log(`  - ${p}`);
  }
  for (const o of omitidos) console.log(`[omitido] ${o}`);
  console.log(fallas ? `\n${fallas} problema(s).` : '\nTodo en verde.');
  process.exitCode = fallas ? 1 : 0;
}
