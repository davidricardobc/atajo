---
etiquetas: [guia, orquestacion, autonomia]
actualizado: 2026-11-18
---
# Orquestación: quién hace qué y qué necesita un sí

Guía del kit. `CLAUDE.md` resume lo esencial; aquí está el detalle y la lista completa de acciones que requieren aprobación. Tus reglas propias van en `perfil/manual.md`, no aquí ni en `CLAUDE.md` (los dos se actualizan con el kit).

## Roles

- **Tú** decides, apruebas y manejas la relación con otras personas.
- **El orquestador** (tu sesión principal de Claude Code) entiende el pedido, lo pasa por el filtro de prioridades, lo parte en encargos, delega, revisa y reporta. Construye directo cuando es más rápido que delegar.
- **Los subagentes** ejecutan encargos acotados en carpetas o archivos propios y devuelven un informe.
- **Codex** (opcional) recibe encargos con `/codex` si lo tienes instalado: trabajo en paralelo o proyectos donde ya tiene historial.

## Niveles de dificultad y a quién va cada cosa

| Nivel | Ejemplos | Quién lo hace | Modelo sugerido |
|---|---|---|---|
| Rutina | resúmenes, plantillas, renombrar, ordenar pendientes, generar índice | el orquestador o un subagente rápido | el más económico del plan (Haiku) |
| Medio | revisar un documento, un diagnóstico, cambios pequeños de código, investigar una fuente | subagente estándar | Sonnet |
| Difícil | diseño, análisis profundo, construcciones largas, código que irá a producción | subagente con el modelo más capaz, o Codex en nivel alto | Opus (o el más capaz de tu plan) |

Regla de cupo: los modelos grandes gastan el plan rápido. Sonnet es el predeterminado para subagentes; Opus solo para lo difícil.

## Matriz de autonomía (tres niveles)

`/arranque` te pide elegir uno y lo escribe en `perfil/manual.md` y en `kit.local.json` (`autonomia`). Predeterminado: equilibrado.

| Acción | Prudente | Equilibrado | Autónomo |
|---|---|---|---|
| Leer archivos del kit y de proyectos enlazados | sí | sí | sí |
| Crear y editar archivos dentro del kit | sí | sí | sí |
| Editar código de un proyecto enlazado | pregunta | sí si es local y reversible (git) | sí |
| Lanzar subagentes | pregunta | sí, si sirve a una prioridad | sí |
| Lanzar Codex | pregunta | sí, si está configurado | sí |
| Commit local | pregunta | sí, con mensaje que diga qué, por qué y cómo se probó | sí |
| Push, deploy, preview, DNS, producción | siempre pide sí | siempre pide sí | siempre pide sí |
| Pagar, contratar, cambiar planes | siempre pide sí | siempre pide sí | siempre pide sí |
| Mensajes a clientes o con tu nombre hacia afuera | siempre pide sí (muestra borrador) | igual | igual |
| Leer o mostrar secretos | nunca | nunca | nunca |
| Borrar (en vez de mover a `archivo/`) | siempre pide sí | siempre pide sí | siempre pide sí |
| Duda de criterio cuando no estás | se detiene y anota | escoge la opción segura, la anota en `decisiones/registro.md` y sigue | igual |

Cada sí se registra en `bitacora/aprobaciones.md` con fecha, acción y alcance. Aprobar la idea no es aprobar la acción. La skill `/publicar` es la puerta única para todo lo de la fila "siempre pide sí".

## La guardia: red de seguridad, no garantía

`scripts/guardia.mjs` corre antes de cada comando (Bash y PowerShell) y de cada lectura, edición o búsqueda de archivos. Pide confirmación ante `git push`, `git reset --hard`, `git clean -f`, `git checkout -- .`, `git restore .`, `git stash drop`, borrados recursivos (`rm -r`, `Remove-Item -Recurse`, `rd /s`) y despliegues (Vercel, Netlify, Azure, Cloudflare, Firebase, `gh release`, `npm publish`). Bloquea la lectura, edición o copia de archivos de secretos (`.env`, `.envrc`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa*`, `credentials*`, `secrets.json`), también con comodines (`.env*`) y dentro de `node -e` o `python -c`. Deja pasar los comandos que solo listan nombres (`ls`, `git ls-files`, `git check-ignore`, `Test-Path`), que es lo que usan `/seguridad` y `/auditoria`.

Límites que debes saber:

- Reconoce patrones de texto. Un comando escrito de otra forma (un alias, un script que llama a otro, una variable que arma la ruta) puede pasar. Por eso la regla de fondo está en `CLAUDE.md` y en el sí explícito de la persona, no en la guardia.
- Solo actúa dentro de Claude Code con Node instalado. En Codex o sin Node no hay guardia: rige el modo manual.
- Si la entrada del hook llega vacía o ilegible, pide confirmación en vez de dejar pasar.
- `permissions.deny` de `.claude/settings.json` duplica la lista de secretos para las herramientas de archivo, por si la guardia falla.

## La ficha de encargo

Plantilla en `plantillas/encargo-subagente.md`. Todo encargo lleva:

- Objetivo en una frase y a qué prioridad sirve.
- Contexto confirmado: hechos y rutas absolutas. Nunca "lee toda la carpeta".
- Archivos que puede tocar y archivos prohibidos.
- Criterio de terminado: qué debe existir y cómo se verifica.
- Lo que no puede hacer: publicar, pagar, borrar, leer secretos, escribir a terceros.
- Formato del informe de vuelta: qué cambió, dónde, cómo se probó, qué quedó pendiente, tokens aproximados.

El orquestador revisa el informe contra el criterio de terminado antes de reportarte. Un resumen del subagente no es prueba: abre los archivos, corre las pruebas.

## Topes y reporte del gasto

Delegar cuesta cupo de tu plan. Lo caro no es un modelo pequeño buscando más: es un modelo grande leyendo mucho o dando vueltas sobre una falla. Por eso cada encargo lleva topes escritos y vuelve con su gasto.

| Modelo del subagente | Búsquedas web | Páginas abiertas | Documento entregado | Revisiones |
|---|---|---|---|---|
| Rápido (Haiku o Sonnet) | hasta ~25 | hasta ~15 | hasta ~250 líneas | 1 o 2 |
| Intermedio (Opus) | hasta ~15 | hasta ~10 | hasta ~200 líneas | 1 |
| El más capaz | hasta ~10 | hasta ~6 | hasta ~150 líneas | 1 |

- Patrón barato y bueno: un modelo rápido junta los datos y uno capaz decide sobre ese resumen.
- Construcción (apps, juegos, código largo): el gasto se va en vueltas, no en búsquedas. Pon un tope de tokens por ronda ("si vas por unos 300k, cierra, haz commit y reporta") y máximo 2 vueltas por falla: a la segunda se anota y se sigue.
- En el encargo van también: P0, P1 y P2 (si se acaba el tiempo, entrega P0 completo), la lista "No va en esta ronda", commits pequeños al cerrar cada pieza (un corte por cupo no pierde trabajo) y un reporte con máximo de líneas.
- Mientras corre, no leas su transcripción ni repitas su trabajo. Al volver, corre tú solo lo barato y decisivo (pruebas, que no haya secretos en git) y di qué prueba cara no repetiste.
- Reporte del gasto: tokens, modelo y qué se logró, en una línea por encargo en el diario o en la ficha del proyecto. Si algo gasta mucho y avanza poco, muéstraselo a la persona antes de seguir.
- Cierra el ciclo: el reporte trae hasta 2 cosas que se repitieron. Lo que falló 2 veces o se hizo a mano 3 veces se vuelve script, hook o skill antes de la ronda siguiente.
- Windows: no escribas scripts con rutas de Windows dentro de un heredoc de Bash; las barras invertidas se pierden. Escribe el script a un archivo y córrelo desde ahí.

## Trabajo en paralelo

Para un encargo con partes independientes está `/equipo`: el orquestador lo parte en dos a cuatro piezas y las reparte entre los cuatro agentes de base de `.claude/agents/` (investigador, constructor, redactor y revisor), que corren a la vez. Cada agente trae su modelo según el nivel de la tabla de arriba y no publica, no paga ni escribe a terceros. Al final el revisor compara cada entrega con su criterio de terminado y tú das el sí.

- Un encargo por carpeta o por worktree de git. Nunca dos agentes sobre los mismos archivos.
- El orquestador anota en `bitacora/ahora.md` qué agentes corren y sobre qué frente, para que otra pestaña lo vea.
- Una sesión por frente. Si dos sesiones tocan el mismo frente, la segunda lo nota en `ahora.md` y pregunta.
- Si un proyecto avanza mucho pero gasta mucho, el orquestador te muestra qué se gastó, qué se logró y qué falta antes de seguir.

## Codex: nivel de razonamiento por tarea

| Nivel | Uso |
|---|---|
| `low` | textos, plantillas, resúmenes |
| `medium` | revisiones, cambios pequeños de código |
| `high` | código que va a producción, seguridad |

Nivel por defecto en `kit.json` (`codex.nivel_por_defecto`, `medium`); modelo y cambios de nivel en `kit.local.json` (`codex.modelo`). Cada ejecución se anota en `revisiones/codex.md`.

Enlaces: [[prioridades]], [[marco]], [[aprobaciones]].
