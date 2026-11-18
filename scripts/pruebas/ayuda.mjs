// Ayudante de pruebas: arma un kit temporal y ejecuta scripts como lo haría Claude Code.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const RAIZ_SCRIPTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Carpeta temporal. Con conEspacio, la ruta lleva un espacio (como "Mis Documentos"). */
export function carpetaTemporal(conEspacio = false) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'atajo-prueba-'));
  if (!conEspacio) return base;
  const conEsp = path.join(base, 'con espacio');
  fs.mkdirSync(conEsp);
  return conEsp;
}

export function crearKit({ perfilLleno = true, conAhora = true, conEspacio = false } = {}) {
  const raiz = carpetaTemporal(conEspacio);
  const escribir = (rel, contenido) => {
    const ruta = path.join(raiz, rel);
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
    fs.writeFileSync(ruta, contenido, 'utf8');
    return ruta;
  };
  escribir('kit.json', JSON.stringify({ nombre: 'Atajo', firma: 'github.com/davidricardobc/atajo', firma_en_salidas: true, autonomia: 'equilibrado' }, null, 2));
  escribir('CLAUDE.md', '# Manual de prueba\n\nLee `bitacora/ahora.md` primero. Ver [[marco]].\n');
  escribir('perfil/quien-soy.md', perfilLleno
    ? '# Quién soy\n\nSoy Ana, vendo servicios de contabilidad. Ver [[negocio]] y [[marco]].\n'
    : '<!-- plantilla: sin llenar -->\n# Quién soy\n\nLlena esto con /arranque.\n');
  escribir('perfil/negocio.md', '---\netiquetas: [negocio, ventas]\nactualizado: 2026-10-01\n---\n# Negocio\n\nContabilidad para pymes. Enlaza con [[prioridades]].\n');
  escribir('perfil/prioridades.md', '# Prioridades\n\n1. Cerrar dos clientes. Ver [[nota-que-no-existe]].\n');
  escribir('perfil/marco.md', '# Marco\n\nEscuchar, Decidir, Entregar.\n');
  escribir('conocimiento/aprendizajes.md', '# Aprendizajes\n\n- 2026-10-01 · prueba: algo. Fuente: x.\n');
  escribir('conocimiento/huerfana.md', '# Nota suelta\n\nNadie me enlaza.\n');
  escribir('plantillas/diario.md', '# Diario {{fecha}}\n\nEjemplo con [[enlace-de-plantilla]] que no debe contarse.\n');
  escribir('archivo/viejo.md', '# Viejo\n\nTampoco cuento. [[otro-roto]]\n');
  if (conAhora) {
    escribir('bitacora/ahora.md', '# Ahora\n\n## Frentes abiertos\n\n- Propuesta: último paso borrador v1; siguiente revisar precios.\n\n## Espera decisión de Ana\n\n- Nada.\n\n## Última actualización\n\n2026-10-06 09:00, sesión abc.\n\n## Si se corta aquí, haz esto primero\n\nRevisar precios.\n');
  }
  escribir('bitacora/pendientes.md', '# Pendientes\n\n## Cola\n\n1. Revisar precios de la propuesta.\n2. Escribir correo de seguimiento.\n\n## Del usuario\n\n- Llamar al banco.\n\n## Parqueadero\n\n- Idea de podcast.\n');
  escribir('.claude/skills/retomar/SKILL.md', '---\nname: retomar\ndescription: prueba\n---\n# Retomar\n');
  escribir('.claude/skills/arranque/SKILL.md', '---\nname: arranque\ndescription: prueba\n---\n# Arranque\n');
  return raiz;
}

export function borrarKit(raiz) {
  // Si la raíz es la subcarpeta "con espacio", se borra también la carpeta temporal que la contiene.
  const objetivo = path.basename(raiz) === 'con espacio' ? path.dirname(raiz) : raiz;
  fs.rmSync(objetivo, { recursive: true, force: true });
}

/** Marca de sesión para las pruebas del hook Stop: la sesión empezó hace `minutos`. */
export function marcarSesion(raiz, minutos = 60) {
  const ruta = path.join(raiz, '.atajo', 'sesion.json');
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const inicio = new Date(Date.now() - minutos * 60_000);
  fs.writeFileSync(ruta, JSON.stringify({ sesion: 'prueba', inicio: inicio.toISOString(), inicio_ms: inicio.getTime(), origen: 'startup' }), 'utf8');
}

export function correr(script, { raiz, entrada = null, argumentos = [] } = {}) {
  const resultado = spawnSync(process.execPath, [path.join(RAIZ_SCRIPTS, script), ...argumentos], {
    input: entrada === null ? '' : (typeof entrada === 'string' ? entrada : JSON.stringify(entrada)),
    env: { ...process.env, CLAUDE_PROJECT_DIR: raiz },
    encoding: 'utf8',
    cwd: raiz,
  });
  return { codigo: resultado.status, salida: resultado.stdout, error: resultado.stderr };
}

export function tocar(ruta, fecha) {
  fs.utimesSync(ruta, fecha, fecha);
}

/** Pone a todos los archivos del kit temporal una fecha de hace `minutos` (simula un kit viejo). */
export function envejecer(raiz, minutos) {
  const fecha = new Date(Date.now() - minutos * 60_000);
  const recorrer = (carpeta) => {
    for (const entrada of fs.readdirSync(carpeta, { withFileTypes: true })) {
      const completa = path.join(carpeta, entrada.name);
      if (entrada.isDirectory()) recorrer(completa);
      else fs.utimesSync(completa, fecha, fecha);
    }
  };
  recorrer(raiz);
}
