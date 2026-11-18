import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { crearKit, borrarKit, correr } from './ayuda.mjs';
import { analizarNota, separarFrontmatter, construirIndice } from '../indice.mjs';

test('separa frontmatter con listas y fechas', () => {
  const { meta, cuerpo } = separarFrontmatter('---\netiquetas: [a, b]\nactualizado: 2026-10-01\n---\n# T\n');
  assert.deepEqual(meta.etiquetas, ['a', 'b']);
  assert.equal(meta.actualizado, '2026-10-01');
  assert.equal(cuerpo[0], '# T');
});

test('saca título, primera frase y enlaces, ignorando código', () => {
  const nota = analizarNota('# Mi nota\n\n<!-- comentario -->\nEsta es la **primera** frase. Esta es la segunda.\n\n`[[no-cuenta]]` y [[si-cuenta|texto]] y [[otra#seccion]].\n\n```\n[[en-codigo]]\n```\n', 'mi-nota');
  assert.equal(nota.titulo, 'Mi nota');
  assert.equal(nota.frase, 'Esta es la primera frase.');
  assert.deepEqual(nota.enlaces.map((e) => e.destino), ['si-cuenta', 'otra']);
});

test('construye el índice con rotos, huérfanas y excluye archivo/ y plantillas/', () => {
  const raiz = crearKit();
  try {
    const { contenido, notas, rotos, huerfanos } = construirIndice(raiz);
    const rutas = notas.map((n) => n.ruta);
    assert.ok(rutas.includes('perfil/negocio.md'));
    assert.ok(!rutas.some((r) => r.startsWith('archivo/') || r.startsWith('plantillas/')));
    assert.ok(rotos.some((r) => r.destino === 'nota-que-no-existe' && r.desde === 'perfil/prioridades.md'));
    assert.ok(!rotos.some((r) => r.destino === 'enlace-de-plantilla'));
    assert.ok(huerfanos.some((n) => n.ruta === 'conocimiento/huerfana.md'));
    assert.match(contenido, /`perfil\/negocio\.md` · \*\*Negocio\*\* · Contabilidad para pymes\. · #negocio #ventas · sale 1 · llega 1 · act\. 2026-10-01/);
    assert.match(contenido, /Hecho con Atajo · github\.com\/davidricardobc\/atajo/);
  } finally {
    borrarKit(raiz);
  }
});

test('como hook PostToolUse solo regenera si se tocó un .md, y a mano siempre', () => {
  const raiz = crearKit();
  try {
    let r = correr('indice.mjs', { raiz, entrada: { hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: path.join(raiz, 'kit.json') } } });
    assert.equal(r.codigo, 0);
    assert.ok(!fs.existsSync(path.join(raiz, 'conocimiento', 'indice.md')));
    r = correr('indice.mjs', { raiz, entrada: { hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: path.join(raiz, 'perfil', 'negocio.md') } } });
    assert.equal(r.codigo, 0);
    assert.equal(r.salida, '', 'el hook trabaja en silencio');
    assert.ok(fs.existsSync(path.join(raiz, 'conocimiento', 'indice.md')));
    r = correr('indice.mjs', { raiz });
    assert.match(r.salida, /Índice sin cambios/);
  } finally {
    borrarKit(raiz);
  }
});

test('si pasa del límite, agrupa por carpeta y escribe detalles', () => {
  const raiz = crearKit();
  try {
    fs.writeFileSync(path.join(raiz, 'kit.json'), JSON.stringify({ nombre: 'Atajo', indice: { max_lineas: 12 } }));
    const r = correr('indice.mjs', { raiz });
    assert.equal(r.codigo, 0);
    const indice = fs.readFileSync(path.join(raiz, 'conocimiento', 'indice.md'), 'utf8');
    assert.match(indice, /## Notas por carpeta/);
    assert.match(indice, /\[\[indice-perfil\]\]/);
    assert.ok(fs.existsSync(path.join(raiz, 'conocimiento', 'indice-perfil.md')));
    // Al volver al límite normal, los detalles sobrantes se limpian.
    fs.writeFileSync(path.join(raiz, 'kit.json'), JSON.stringify({ nombre: 'Atajo' }));
    correr('indice.mjs', { raiz });
    assert.ok(!fs.existsSync(path.join(raiz, 'conocimiento', 'indice-perfil.md')));
  } finally {
    borrarKit(raiz);
  }
});
