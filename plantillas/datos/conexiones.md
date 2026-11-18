# Conexiones

Registro de todo lo que el sistema puede alcanzar: herramientas, cuentas, carpetas y servicios. Si algo no está aquí, el agente asume que no lo puede tocar. `/arranque` llena el entorno; `/conectar` agrega cada herramienta nueva con una prueba de lectura.

Regla de frescura: cada fila lleva la fecha de la última prueba. Lo que no se ha probado dice "sin probar".

## Entorno (lo detecta /arranque)

| Dato | Valor | Fecha |
|---|---|---|
| Sistema operativo | pendiente | |
| Claude Code (versión) | pendiente | |
| git | pendiente | |
| Node | pendiente (sin Node, los hooks quedan en modo manual) | |
| Codex | pendiente (opcional) | |
| Hooks instalados | pendiente | |

## Herramientas y servicios

| Herramienta | Para qué la usas | Qué puede leer el agente | Qué puede escribir | Probado | Fecha |
|---|---|---|---|---|---|
| (ejemplo) WhatsApp | hablar con clientes | nada todavía | nada | sin probar | |

## Carpetas fuera del kit

Los proyectos (código, repos, sistemas) van en `proyectos/indice.md`. Aquí solo carpetas de archivos y notas (Drive, Notion exportado, carpeta de fotos).

| Carpeta o fuente | Ruta | Qué hay | Probado | Fecha |
|---|---|---|---|---|
| | | | | |

## Cómo se agrega una conexión

1. Pide `/conectar` y di qué es y para qué sirve.
2. El agente verifica que exista, intenta una lectura de prueba y anota el resultado con fecha.
3. Nada de credenciales aquí: las claves viven en `.env` o en la herramienta, nunca en este archivo.
