// Pruebas del equipo de base (.claude/agents) y de la skill /equipo. Correr con: node --test "scripts/pruebas/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ_SCRIPTS } from './ayuda.mjs';
import { leerFrontmatter } from '../verificar.mjs';

const RAIZ = path.resolve(RAIZ_SCRIPTS, '..');
const AGENTES = path.join(RAIZ, '.claude', 'agents');
const BASE = ['investigador', 'constructor', 'redactor', 'revisor'];
const PROHIBIDAS = ['WebSearch', 'WebFetch', 'Bash', 'PowerShell'];

const agentesDelKit = () => fs.readdirSync(AGENTES).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));

test('el equipo de base está completo', () => {
  for (const nombre of BASE) assert.ok(agentesDelKit().includes(nombre), `falta .claude/agents/${nombre}.md`);
});

test('cada agente tiene frontmatter válido y ninguno trae web ni comandos', () => {
  for (const nombre of agentesDelKit()) {
    const fm = leerFrontmatter(fs.readFileSync(path.join(AGENTES, `${nombre}.md`), 'utf8'));
    assert.ok(fm, `${nombre}: sin frontmatter`);
    assert.equal(fm.name, nombre, `${nombre}: name debe ser igual al nombre del archivo`);
    for (const campo of ['description', 'tools', 'model']) assert.ok(fm[campo], `${nombre}: falta ${campo}`);
    const herramientas = fm.tools.split(',').map((h) => h.trim());
    for (const h of herramientas) {
      assert.ok(!PROHIBIDAS.some((p) => h.startsWith(p)), `${nombre}: no puede tener ${h}`);
    }
  }
});

test('la skill equipo nombra solo agentes que existen', () => {
  const texto = fs.readFileSync(path.join(RAIZ, '.claude', 'skills', 'equipo', 'SKILL.md'), 'utf8');
  const nombrados = [...texto.matchAll(/^\|\s*`([a-z-]+)`\s*\|/gm)].map((m) => m[1]);
  assert.ok(nombrados.length > 0, 'la tabla del equipo de base no nombra agentes');
  const existen = agentesDelKit();
  for (const n of nombrados) assert.ok(existen.includes(n), `la skill nombra a ${n} y no existe .claude/agents/${n}.md`);
  for (const n of [...texto.matchAll(/al `([a-z-]+)`/g)].map((m) => m[1])) {
    assert.ok(existen.includes(n), `la skill lanza a ${n} y no existe .claude/agents/${n}.md`);
  }
  for (const n of BASE) assert.ok(nombrados.includes(n), `la skill no nombra a ${n}`);
});
