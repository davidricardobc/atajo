// Nombres de archivo que guardan secretos. Lo usan la guardia (PreToolUse) y el cierre (Stop).
// Misma lista que permissions.deny en .claude/settings.json y que el .gitignore del kit.

import path from 'node:path';

export const SECRETOS = [
  { patron: /^\.env(\..+)?$/i, excepcion: /\.(example|sample|template|dist|ejemplo|plantilla)$/i, nombre: '.env' },
  { patron: /^\.envrc$/i, nombre: '.envrc' },
  { patron: /\.pem$/i, nombre: '*.pem' },
  { patron: /\.key$/i, nombre: '*.key' },
  { patron: /\.(p12|pfx)$/i, nombre: '*.p12 / *.pfx' },
  { patron: /^id_(rsa|dsa|ecdsa|ed25519)(\..*)?$/i, excepcion: /\.pub$/i, nombre: 'id_rsa*' },
  { patron: /^credentials/i, nombre: 'credentials*' },
  { patron: /^secrets?\.(json|ya?ml|toml)$/i, nombre: 'secrets.json' },
];

/** Devuelve el tipo de secreto si el nombre (o su parte final) es un archivo de secretos; si no, null. */
export function nombreEsSecreto(nombre) {
  if (!nombre) return null;
  // Rutas de Windows y de Unix; también referencias de git como HEAD:.env.
  const base = path.basename(String(nombre).replace(/\\/g, '/')).replace(/^[^:]*:(?=\S)/, '');
  for (const regla of SECRETOS) {
    if (regla.patron.test(base) && !(regla.excepcion && regla.excepcion.test(base))) return regla.nombre;
  }
  return null;
}

/**
 * Un comodín de shell (.env*, .en?, *.pem, cred*) puede alcanzar un secreto.
 * Se compara el comodín contra nombres típicos de secretos.
 */
const NOMBRES_TIPICOS = ['.env', '.env.local', '.env.production', '.envrc', 'llave.pem', 'servidor.key', 'cert.p12', 'cert.pfx', 'id_rsa', 'credentials.json', 'secrets.json', 'secrets.yaml'];

export function comodinAlcanzaSecreto(token) {
  const base = path.basename(String(token).replace(/\\/g, '/'));
  if (!/[*?[]/.test(base)) return null;
  const regex = comodinARegex(base);
  if (!regex) return null;
  for (const nombre of NOMBRES_TIPICOS) {
    if (regex.test(nombre) && nombreEsSecreto(nombre)) return nombreEsSecreto(nombre);
  }
  return null;
}

/** Convierte un comodín de shell en RegExp. Un [ sin cerrar es un carácter normal. Nunca lanza error. */
function comodinARegex(comodin) {
  let fuente = '';
  for (let i = 0; i < comodin.length; i++) {
    const c = comodin[i];
    if (c === '*') { fuente += '.*'; continue; }
    if (c === '?') { fuente += '.'; continue; }
    if (c === '[') {
      const cierre = comodin.indexOf(']', i + 2);
      if (cierre !== -1) {
        const clase = comodin.slice(i + 1, cierre).replace(/^!/, '^').replace(/\\/g, '\\\\');
        fuente += `[${clase}]`;
        i = cierre;
        continue;
      }
    }
    fuente += c.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  }
  try {
    return new RegExp(`^${fuente}$`, 'i');
  } catch {
    return null;
  }
}
