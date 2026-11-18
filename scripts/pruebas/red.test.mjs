// Pruebas de scripts/red.mjs. Correr con: node --test "scripts/pruebas/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { carpetaTemporal, RAIZ_SCRIPTS } from './ayuda.mjs';
import { leerRed, leerPrioridades, leerDecisiones, leerProyectos } from '../red.mjs';
import { aContrato, recortar, rolCorto } from '../lib/red-pagina.mjs';

function kitDePrueba({ lleno = true } = {}) {
  const raiz = carpetaTemporal(true);
  const escribir = (rel, contenido) => {
    fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
    fs.writeFileSync(path.join(raiz, rel), contenido, 'utf8');
  };
  escribir('kit.json', JSON.stringify({ nombre: 'Atajo', version: '0.3.0' }));
  escribir('.claude/skills/retomar/SKILL.md', '---\nname: retomar\ndescription: Usa esta skill cuando la persona vuelva. Dice en qué iba.\n---\n');
  if (!lleno) {
    escribir('perfil/quien-soy.md', '<!-- plantilla: sin llenar -->\n# Quién soy\n- Nombre completo:\n');
    escribir('perfil/prioridades.md', '<!-- plantilla: sin llenar -->\n## Prioridad 1\n- Qué:\n');
    return raiz;
  }
  escribir('perfil/quien-soy.md', '# Quién soy\n- Nombre completo: Ana Ruiz (ficticia)\n- En una frase: vendo pan de masa madre.\n');
  escribir('perfil/prioridades.md', '# Prioridades\n## Prioridad 1: abrir el segundo local\n- Qué: local en Chapinero.\n- Fecha límite: 2027-02-01.\n- Señal de éxito (medible): local abierto.\n\n## Prioridad 2\n- Qué: vender por WhatsApp.\n- Fecha límite: 2027-01-15\n');
  escribir('proyectos/indice.md', '| Proyecto | Cuándo usarlo | Ruta |\n|---|---|---|\n| (ejemplo) Tienda | x | y |\n| Web de la panadería | ventas | https://pan.example |\n');
  escribir('decisiones/registro.md', '# Registro\n```\n## AAAA-MM-DD · Título corto\n```\n## 2026-10-06 · Instalar Atajo\n- x\n## 2026-11-01 · Subir precios\n- y\n');
  escribir('bitacora/ahora.md', '# Ahora\n## Frentes abiertos\n\n- **Local nuevo (P1)**: último paso: visita. Siguiente: contrato.\n');
  escribir('bitacora/pendientes.md', '# Pendientes\n## Cola\n\n1. Firmar el contrato · P1 · lunes (2026-11-10)\n2. Fotos del pan (2026-11-11)\n\n## Parqueadero\n\n- (ideas sin prioridad hoy)\n- Abrir un canal de recetas (2026-11-12).\n');
  return raiz;
}

test('lee persona, prioridades, proyectos, decisiones, frentes, Cola y skills', () => {
  const raiz = kitDePrueba();
  try {
    const red = leerRed(raiz, new Date('2026-11-17T12:00:00Z'));
    assert.deepEqual(red.persona, { nombre: 'Ana Ruiz', titulo: 'Red de Ana Ruiz', frase: 'vendo pan de masa madre' });
    assert.deepEqual(red.prioridades.map((p) => [p.id, p.titulo, p.fecha]), [['P1', 'abrir el segundo local', '2027-02-01'], ['P2', 'vender por WhatsApp', '2027-01-15']]);
    assert.equal(red.prioridades[0].senal, 'local abierto');
    assert.deepEqual(red.proyectos, [{ nombre: 'Web de la panadería', para: 'ventas', donde: 'https://pan.example' }]);
    assert.deepEqual(red.decisiones, [{ fecha: '2026-11-01', titulo: 'Subir precios' }], 'sin la del bloque de código ni "Instalar Atajo"');
    assert.deepEqual(red.bitacora.frentes[0], { nombre: 'Local nuevo', prioridad: 'P1', detalle: 'último paso: visita. Siguiente: contrato.' });
    assert.equal(red.bitacora.cola[0].texto, 'Firmar el contrato · P1 · lunes');
    assert.deepEqual(red.bitacora.parqueadero, ['Abrir un canal de recetas']);
    assert.deepEqual(red.skills, [{ nombre: 'retomar', descripcion: 'la persona vuelva.' }]);
    assert.deepEqual(red.aprendizajes, []);
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('con el perfil sin llenar no inventa nada', () => {
  const raiz = kitDePrueba({ lleno: false });
  try {
    const red = leerRed(raiz);
    assert.equal(red.persona.nombre, 'Tú');
    assert.equal(red.persona.titulo, 'Tu red');
    assert.deepEqual(leerPrioridades(raiz), []);
    assert.deepEqual(leerProyectos(raiz), []);
    assert.deepEqual(leerDecisiones(raiz), []);
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('el contrato tiene tipos válidos, la persona al centro y cada frente cuelga de su prioridad', () => {
  const raiz = kitDePrueba();
  try {
    const c = aContrato(leerRed(raiz));
    const tipos = ['persona', 'prioridad', 'proyecto', 'skill', 'agente', 'decision', 'aprendizaje'];
    assert.ok(c.nodos.every((n) => tipos.includes(n.tipo)));
    assert.equal(new Set(c.nodos.map((n) => n.id)).size, c.nodos.length, 'ids únicos');
    assert.deepEqual(c.persona, { nombre: 'Ana Ruiz', rol: 'vendo pan de masa madre' });
    const frente = c.nodos.find((n) => n.nombre === 'Local nuevo');
    assert.ok(c.enlaces.some((e) => e.de === frente.id && e.a === 'p1'));
    const web = c.nodos.find((n) => n.nombre === 'Web de la panadería');
    assert.equal(web.url, 'https://pan.example');
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('rol sin cortes a mitad de idea, Cola como neuronas (máximo 5) y una línea por skill', () => {
  assert.equal(rolCorto('hago tortas por encargo en Medellín para cumpleaños y bodas'), 'hago tortas por encargo en Medellín');
  assert.equal(rolCorto('hago tortas por encargo en el barrio de mi casa'), 'hago tortas por encargo', 'no termina en "en el"');
  assert.equal(rolCorto('estudio el último semestre de administración y vendo tortas'), 'estudio el último semestre de administración');
  assert.equal(rolCorto(''), 'Hecho con Atajo');
  assert.equal(recortar('Entregar el capítulo 2 de la tesis', 5), 'Entregar el capítulo 2');
  assert.doesNotMatch(rolCorto('soy diseñadora de marca para pymes de la ciudad de Bogotá'), /…/);
  const raiz = kitDePrueba();
  try {
    const cola = Array.from({ length: 7 }, (_, i) => `${i + 1}. Tarea número ${i + 1} con detalle · P1 · lunes (2026-11-18)`).join('\n');
    fs.writeFileSync(path.join(raiz, 'bitacora', 'pendientes.md'), `# Pendientes\n## Cola\n\n${cola}\n`, 'utf8');
    fs.mkdirSync(path.join(raiz, '.claude', 'skills', 'mi-cotizar'), { recursive: true });
    fs.writeFileSync(path.join(raiz, '.claude', 'skills', 'mi-cotizar', 'SKILL.md'), '---\nname: mi-cotizar\ndescription: Arma la cotización de tortas con precios, sabores, tamaños, domicilio y condiciones de pago. Usar cuando...\n---\n', 'utf8');
    const c = aContrato(leerRed(raiz));
    const tareas = c.nodos.filter((n) => n.id.startsWith('t'));
    assert.equal(tareas.length, 5, 'máximo 5 tareas de la Cola');
    assert.equal(tareas[0].nombre, 'Tarea número 1 con detalle');
    assert.equal(recortar('Elegir 5 empresas y mandar la hoja de vida', 6), 'Elegir 5 empresas');
    assert.equal(recortar('Comprar insumos para las 3 tortas del sábado', 5), 'Comprar insumos');
    assert.ok(c.enlaces.some((e) => e.de === tareas[0].id && e.a === 'p1'), 'la tarea cuelga de su prioridad');
    for (const s of c.nodos.filter((n) => n.tipo === 'skill')) {
      assert.ok(s.frase.split(/\s+/).length <= 9, `frase larga en ${s.nombre}: ${s.frase}`);
      assert.doesNotMatch(s.frase, /…/);
    }
    assert.equal(c.nodos.find((n) => n.nombre === '/retomar').frase, 'En qué ibas y el siguiente paso.');
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('la pieza del kit trae el cierre, la ayuda de teclas, el modo proyector y el aviso de demo local, y avisa de rutas que no existen', () => {
  const raiz = kitDePrueba();
  try {
    fs.writeFileSync(path.join(raiz, 'proyectos', 'indice.md'), '| Proyecto | Cuándo usarlo | Ruta |\n|---|---|---|\n| Recetario | recetas | C:\\no-existe\\recetario |\n', 'utf8');
    const r = spawnSync(process.execPath, [path.join(RAIZ_SCRIPTS, 'red.mjs'), '--raiz', raiz, '--sin-abrir'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /no existe en este computador/, 'avisa de la ruta local que no está');
    const html = fs.readFileSync(path.join(raiz, 'red', 'index.html'), 'utf8');
    for (const id of ['cierre', 'teclas', 'nota', 't-estado']) assert.match(html, new RegExp(`id="${id}"`), `falta #${id}`);
    assert.match(html, /html\.proyector/, 'modo proyector');
    assert.match(html, /suma una neurona/, 'la línea que explica cómo crece una red pequeña');
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});

test('el comando arma red/red.json y red/index.html con la pieza del kit, sin abrir el navegador', () => {
  const raiz = kitDePrueba();
  try {
    fs.writeFileSync(path.join(raiz, 'perfil', 'quien-soy.md'), '# Quién soy\n- Nombre completo: Ana <script>\n- En una frase: vendo pan.\n', 'utf8');
    const r = spawnSync(process.execPath, [path.join(RAIZ_SCRIPTS, 'red.mjs'), '--raiz', raiz, '--sin-abrir'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /neuronas/);
    const html = fs.readFileSync(path.join(raiz, 'red', 'index.html'), 'utf8');
    assert.doesNotMatch(html, /\/\*__RED__\*\//, 'los datos quedaron inyectados');
    assert.doesNotMatch(html, /Ana <script>/, 'el nombre va escapado');
    assert.doesNotMatch(html, /(src|href)=["']https?:/i, 'sin recursos de internet');
    assert.equal(JSON.parse(fs.readFileSync(path.join(raiz, 'red', 'red.json'), 'utf8')).persona.nombre, 'Ana <script>');
  } finally { fs.rmSync(raiz, { recursive: true, force: true }); }
});
