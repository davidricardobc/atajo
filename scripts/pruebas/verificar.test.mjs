// Pruebas de scripts/verificar.mjs. Correr con: node --test "scripts/pruebas/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { carpetaTemporal, RAIZ_SCRIPTS } from './ayuda.mjs';
import { leerFrontmatter, revisarSkills, revisarEnlaces, revisarJsonYVersiones } from '../verificar.mjs';

const escribir = (raiz, rel, contenido) => {
  const ruta = path.join(raiz, rel);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, contenido, 'utf8');
};

test('lee el frontmatter simple de una skill', () => {
  assert.deepEqual(leerFrontmatter('---\nname: x\ndescription: Hace algo.\n---\n# X\n'), { name: 'x', description: 'Hace algo.' });
  assert.equal(leerFrontmatter('# Sin frontmatter\n'), null);
});

test('detecta skills sin frontmatter, con name distinto o sin description', () => {
  const raiz = carpetaTemporal();
  try {
    escribir(raiz, '.claude/skills/buena/SKILL.md', '---\nname: buena\ndescription: Sirve.\n---\n');
    escribir(raiz, '.claude/skills/otra/SKILL.md', '---\nname: distinta\ndescription: Sirve.\n---\n');
    escribir(raiz, '.claude/skills/muda/SKILL.md', '---\nname: muda\n---\n');
    escribir(raiz, '.claude/skills/pelada/SKILL.md', '# Nada\n');
    const p = revisarSkills(raiz).join('\n');
    assert.doesNotMatch(p, /buena/);
    assert.match(p, /otra: name es "distinta"/);
    assert.match(p, /muda: falta description/);
    assert.match(p, /pelada: SKILL.md sin frontmatter/);
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('encuentra enlaces rotos e ignora URLs, anclas, código y datos de la persona', () => {
  const raiz = carpetaTemporal();
  try {
    escribir(raiz, 'docs/existe.md', '# Existe\n');
    escribir(raiz, 'README.md', '[ok](docs/existe.md) [ancla](#arriba) [web](https://x.y) [roto](docs/no.md)\n`[codigo](no.md)`\n');
    escribir(raiz, 'perfil/quien-soy.md', '[dato](no-existe.md)\n');
    const p = revisarEnlaces(raiz);
    assert.deepEqual(p, ['README.md: enlace roto a docs/no.md']);
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('avisa si las versiones de kit.json, marketplace y CHANGELOG no coinciden', () => {
  const raiz = carpetaTemporal();
  try {
    escribir(raiz, 'kit.json', '{"version":"0.2.0"}');
    escribir(raiz, '.claude/settings.json', '{}');
    escribir(raiz, 'plantillas/datos/kit.local.json', '{}');
    escribir(raiz, '.claude-plugin/marketplace.json', '{"version":"0.1.0","plugins":[{"name":"n","version":"0.2.0","skills":["./.claude/skills/falta"]}]}');
    escribir(raiz, 'CHANGELOG.md', '# Cambios\n\n## 0.2.0 · hoy\n');
    const p = revisarJsonYVersiones(raiz).join('\n');
    assert.match(p, /marketplace.json dice 0.1.0/);
    assert.match(p, /no existe .\/.claude\/skills\/falta\/SKILL.md/);
    assert.doesNotMatch(p, /CHANGELOG/);
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('el kit real pasa la verificación completa', () => {
  const r = spawnSync(process.execPath, [path.join(RAIZ_SCRIPTS, 'verificar.mjs')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /Todo en verde/);
});
