#!/usr/bin/env node
// Abre un archivo o una dirección web con el programa por defecto del computador.
//
// Uso:
//   node scripts/abrir.mjs proyectos/panaderia/demo.html
//   node scripts/abrir.mjs https://github.com/davidricardobc/atajo
//
// Solo abre direcciones http o https y archivos que se pueden ver (páginas, textos, PDF, imágenes).
// Nunca abre programas ni accesos directos (.exe, .bat, .lnk...): abrirlos sería ejecutarlos.
// Con ATAJO_ABRIR_SIMULAR=1 dice qué abriría sin abrir nada (para pruebas).

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SE_PUEDEN_VER = new Set(['.html', '.htm', '.md', '.txt', '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.csv']);

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
  if (!fs.existsSync(ruta) || !fs.statSync(ruta).isFile()) {
    console.error(`No existe o no es un archivo: ${ruta}`);
    process.exit(1);
  }
  const extension = path.extname(ruta).toLowerCase();
  if (!SE_PUEDEN_VER.has(extension)) {
    console.error(`No abro archivos "${extension || 'sin extensión'}". Solo: ${[...SE_PUEDEN_VER].join(', ')}`);
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
hijo.on('spawn', () => {
  hijo.unref();
  console.log(`Abierto: ${destino}`);
});
