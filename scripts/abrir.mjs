#!/usr/bin/env node
// Abre un archivo o una dirección web con el programa por defecto del computador.
//
// Uso:
//   node scripts/abrir.mjs proyectos/panaderia/demo.html
//   node scripts/abrir.mjs https://github.com/davidricardobc/atajo
//
// Solo abre archivos que existen y direcciones http o https. No corre comandos.
// Con ATAJO_ABRIR_SIMULAR=1 dice qué abriría sin abrir nada (para pruebas).

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const objetivo = process.argv[2];
if (!objetivo) {
  console.error('Falta qué abrir. Uso: node scripts/abrir.mjs <archivo o dirección web>');
  process.exit(1);
}

let destino;
if (/^https?:\/\//i.test(objetivo)) {
  destino = objetivo;
} else {
  const ruta = path.resolve(objetivo);
  if (!fs.existsSync(ruta)) {
    console.error(`No existe: ${ruta}`);
    process.exit(1);
  }
  destino = pathToFileURL(ruta).href;
}

if (process.env.ATAJO_ABRIR_SIMULAR === '1') {
  console.log(`Abriría: ${destino}`);
  process.exit(0);
}

// Se pasa como argumento suelto, sin intérprete de comandos, para que nada del nombre se ejecute.
const [programa, argumentos] =
  process.platform === 'win32' ? ['rundll32', ['url.dll,FileProtocolHandler', destino]]
  : process.platform === 'darwin' ? ['open', [destino]]
  : ['xdg-open', [destino]];

const hijo = spawn(programa, argumentos, { detached: true, stdio: 'ignore' });
hijo.on('error', () => {
  console.error(`No pude abrirlo solo. Ábrelo a mano: ${destino}`);
  process.exit(1);
});
hijo.unref();
console.log(`Abierto: ${destino}`);
