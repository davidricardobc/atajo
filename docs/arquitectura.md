# Arquitectura de Atajo

Para quien quiere saber cómo está hecho antes de confiarle su trabajo. Versión 0.4.

## En una frase

Atajo es una capa de convenciones encima de Claude Code: archivos Markdown como memoria, skills como procedimientos, hooks de Node como automatismos y permisos de Claude Code como barrera. No hay servidor, base de datos ni dependencias de npm.

## Piezas

| Pieza | Dónde | Qué hace |
|---|---|---|
| Instrucciones del kit | `CLAUDE.md` | Reglas de continuidad, filtro de prioridades, autonomía y estilo. Importa `@perfil/manual.md`. |
| Manual de la persona | `perfil/manual.md` | Quién es, sus 3 prioridades, el nivel de autonomía elegido y sus reglas propias. Lo genera `/arranque`. |
| Skills | `.claude/skills/<nombre>/SKILL.md` | 14 procedimientos con frontmatter `name` y `description`. Claude Code los carga por descripción o con `/nombre`. |
| Agentes | `.claude/agents/<nombre>.md` | El equipo de base de `/equipo`: investigador, constructor, redactor y revisor. Cada uno trae sus herramientas y su modelo, sin web ni comandos. |
| Copia para Codex | `AGENTS.md`, `.agents/skills/` | Generados por `scripts/sincronizar-skills.mjs` desde `CLAUDE.md` y `.claude/skills/`. |
| Hooks | `.claude/settings.json` → `scripts/*.mjs` | SessionStart, Stop, PreCompact, PreToolUse y PostToolUse. Solo Node, sin paquetes. |
| Plantillas de datos | `plantillas/datos/` | Estructura inicial de los datos. Se copian a la raíz sin pisar nada. |
| La red | `scripts/red.mjs`, `scripts/lib/red-pagina.mjs`, `plantillas/red/` | Lee los archivos de la persona, los pasa al formato de `plantillas/red/CONTRATO.md` en `red/red.json` y `plantillas/red/construir.mjs` arma `red/index.html`: un solo HTML, sin internet, con las fuentes incrustadas. `red/` está fuera de git. |
| Guías | `guias/` | Conocimiento de referencia: precios, diagnóstico, orquestación, Ley 1581. |
| Marketplace | `.claude-plugin/marketplace.json` | Cuatro plugins (`nucleo`, `ventas`, `guardia`, `taller`) que apuntan a las mismas skills. |

## Decisiones de diseño

1. **Kit y datos separados por `.gitignore`.** El kit se actualiza con `git pull`; los datos de la persona (`perfil/`, `bitacora/`, `clientes/`...) están ignorados. Así una actualización nunca choca con los datos ni los sube por accidente. Costo: el respaldo de los datos es responsabilidad de la persona, y el README lo dice.
2. **Memoria en archivos legibles, no en el modelo.** El punto de retorno es `bitacora/ahora.md`, máximo 60 líneas, editado por frente. La persona puede leerlo y corregirlo. Se actualiza al cerrar cada hito, no al final de la conversación, porque la conversación se puede cortar.
3. **El archivo manda.** El hook de inicio inyecta `ahora.md` y la Cola de `pendientes.md` como contexto. El hook Stop revisa si cambiaron archivos después del último punto de retorno y, si es así, pide actualizarlo antes de terminar.
4. **Valor antes que configuración.** `/arranque` entrega el plan de la semana después de 4 preguntas. La configuración completa (voz, canales, autonomía) es opcional y va después.
5. **Una pregunta a la vez, con hipótesis.** Responder es corregir, no redactar. Cada respuesta se escribe al momento.
6. **Filtro contra la dispersión.** Toda tarea nueva se compara contra las 3 prioridades. Si no sirve a ninguna, va al Parqueadero con fecha.
7. **Funciona sin Node.** Los hooks son un extra. Sin Node, el instalador escribe `disableAllHooks` en `.claude/settings.local.json` y `/retomar` hace a mano lo que haría el hook de inicio.
8. **Funciona sin git.** El instalador baja el zip si no hay git. La actualización copia encima solo los archivos del kit.
9. **Lo propio va en archivos `mi-`.** Lo que la persona crea con `/leveling` o `/aprender` (skills, scripts, plantillas) vive en archivos nuevos con prefijo `mi-`, ignorados por git. Así ni `git pull` ni la copia del zip los pisan, y la actualización no se bloquea por cambios locales.
10. **Español desde el diseño.** Nombres de skills, carpetas de datos y mensajes en español. Los scripts se escriben en ASCII cuando PowerShell 5.1 lo exige (ver la cabecera de `scripts/instalar.ps1`).

## Barreras de seguridad

En capas, de la más fuerte a la más blanda:

1. **Permisos de Claude Code** (`.claude/settings.json`).
   - `deny` para leer o editar `.env`, `.envrc`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa*`, `credentials*` y `secrets.*`.
   - `allow` para comandos de solo lectura (`git status`, `git log`, `node --version`...), los scripts del kit y la edición de las carpetas de datos de la persona. `clientes/` y los archivos del kit no están en `allow`: Claude Code pide aprobación.
   - Claude Code ignora el `allow` de un proyecto hasta que la persona acepta el diálogo de confianza de la carpeta.
2. **La guardia** (`scripts/guardia.mjs`, hook PreToolUse).
   - Pide confirmación (`ask`) ante comandos que publican o descartan trabajo: `git push`, `git reset --hard`, `git clean -f`, `git branch -D`, despliegues (`vercel`, `netlify`, `wrangler`, `gh release`...) y borrados masivos.
   - Bloquea (`deny`) cualquier herramienta que lea o copie un archivo de secretos, también por comodines (`cat .e*`) y por referencias de git (`HEAD:.env`).
   - Con entrada vacía o ilegible pide confirmación: no deja pasar a ciegas.
   - Es una red, no una garantía: un comando escrito de otra forma puede esquivarla. Las pruebas están en `scripts/pruebas/guardia.test.mjs`.
3. **Reglas en `CLAUDE.md`.** Publicar, pagar, borrar y escribir a terceros siempre piden un sí explícito, en cualquier nivel de autonomía. Cada sí se anota en `bitacora/aprobaciones.md`. La skill `/publicar` es la puerta única.
4. **Datos de terceros.** `clientes/` está fuera de git por defecto y la skill `/seguridad` trae una lista de verificación de la Ley 1581 de Colombia (no es asesoría legal).

## Niveles de autonomía

`prudente`, `equilibrado` (predeterminado) y `autónomo`. Cambian lo que el agente hace sin preguntar dentro del kit y de los proyectos enlazados (editar código local, lanzar subagentes, commits locales). Las filas de "siempre pide sí" no cambian con el nivel. Tabla completa en `guias/orquestacion.md`.

## Delegación

`guias/orquestacion.md` reparte el trabajo por dificultad: tareas simples a un modelo rápido, medias a uno intermedio, críticas al más capaz o a una revisión adversarial con contexto nuevo. Cada encargo usa `plantillas/encargo-subagente.md`: objetivo, criterio de terminado, límites y formato del informe. El agente principal revisa el informe contra el criterio antes de reportar.

## Calidad comprobable

- `node --test "scripts/pruebas/*.test.mjs"`: pruebas de cada script (hooks, índice, sincronización, originalidad).
- `node scripts/verificar.mjs`: frontmatter de cada skill, copia para Codex al día, enlaces internos de los Markdown del kit, JSON válidos y sintaxis de los instaladores.
- `.github/workflows/verificar.yml` corre las dos cosas en Ubuntu, macOS y Windows en cada push y pull request.

## Límites conocidos

- Claude Code en la web y en el celular clonan el repositorio desde GitHub: los datos de la persona, que están fuera de git, no viajan. Atajo está pensado para correr en el computador de la persona.
- En Codex no hay hooks ni guardia; la continuidad depende de `/retomar`.
- La guardia reconoce patrones; no entiende intenciones.
- Sin probar todavía: una cuenta de Windows con espacios en el nombre de usuario (hay reportes de hooks que fallan con esas rutas en Claude Code), y Mac y Linux reales (los cubre GitHub Actions).
- En modo sin interfaz (`claude -p`) en una carpeta sin confianza aceptada, Claude Code ignora el `allow` del proyecto: los scripts del kit piden permiso y no corren.
- El chequeo de originalidad necesita un corpus que no se distribuye con el kit (ver `CONTRIBUIR.md`).
