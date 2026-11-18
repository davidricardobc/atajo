import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { crearKit, borrarKit, correr } from './ayuda.mjs';

import { paraCodex } from '../sincronizar-skills.mjs';

test('convierte el import @perfil/manual.md en una orden de lectura para Codex', () => {
  const claude = '# Manual\n\nLo tuyo vive aquí:\n\n@perfil/manual.md\n\nEscribe `@README` en backticks: no es import.\n';
  const codex = paraCodex(claude);
  assert.match(codex, /`perfil\/manual\.md` \(Codex: léelo completo al empezar la sesión; no tiene imports\)/);
  assert.doesNotMatch(codex, /\n@perfil/);
  assert.match(codex, /`@README`/, 'lo que va en backticks no se toca');
});

test('copia las skills a .agents/skills y genera AGENTS.md desde CLAUDE.md', () => {
  const raiz = crearKit();
  try {
    const r = correr('sincronizar-skills.mjs', { raiz });
    assert.equal(r.codigo, 0, r.error);
    assert.match(r.salida, /arranque, retomar/);
    assert.ok(fs.existsSync(path.join(raiz, '.agents', 'skills', 'retomar', 'SKILL.md')));
    assert.equal(fs.readFileSync(path.join(raiz, 'AGENTS.md'), 'utf8'), paraCodex(fs.readFileSync(path.join(raiz, 'CLAUDE.md'), 'utf8')));
    const otra = correr('sincronizar-skills.mjs', { raiz });
    assert.match(otra.salida, /ninguna \(ya estaban iguales\)/);
    assert.match(otra.salida, /AGENTS\.md: sin cambios/);
  } finally {
    borrarKit(raiz);
  }
});

test('--skill sincroniza una sola y --verificar detecta desincronización', () => {
  const raiz = crearKit();
  try {
    correr('sincronizar-skills.mjs', { raiz });
    fs.writeFileSync(path.join(raiz, '.claude', 'skills', 'retomar', 'SKILL.md'), '# Retomar v2\n');
    fs.writeFileSync(path.join(raiz, 'CLAUDE.md'), '# Manual nuevo\n');
    let v = correr('sincronizar-skills.mjs', { raiz, argumentos: ['--verificar'] });
    assert.equal(v.codigo, 1);
    assert.match(v.salida, /skill retomar/);
    assert.match(v.salida, /AGENTS\.md/);
    assert.notEqual(fs.readFileSync(path.join(raiz, 'AGENTS.md'), 'utf8'), '# Manual nuevo\n', 'verificar no escribe');
    const r = correr('sincronizar-skills.mjs', { raiz, argumentos: ['--skill', 'retomar'] });
    assert.equal(r.codigo, 0);
    assert.equal(fs.readFileSync(path.join(raiz, '.agents', 'skills', 'retomar', 'SKILL.md'), 'utf8'), '# Retomar v2\n');
    v = correr('sincronizar-skills.mjs', { raiz, argumentos: ['--verificar'] });
    assert.equal(v.codigo, 0);
  } finally {
    borrarKit(raiz);
  }
});

test('avisa pero no borra las skills que solo existen en .agents/skills', () => {
  const raiz = crearKit();
  try {
    fs.mkdirSync(path.join(raiz, '.agents', 'skills', 'vieja'), { recursive: true });
    fs.writeFileSync(path.join(raiz, '.agents', 'skills', 'vieja', 'SKILL.md'), '# Vieja\n');
    const r = correr('sincronizar-skills.mjs', { raiz });
    assert.match(r.salida, /Solo en \.agents\/skills \(no se tocan\): vieja/);
    assert.ok(fs.existsSync(path.join(raiz, '.agents', 'skills', 'vieja')));
  } finally {
    borrarKit(raiz);
  }
});
