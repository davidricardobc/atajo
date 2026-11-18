---
name: auditoria
description: Auditoría del sistema por semáforo en cuatro ejes (Memoria, Rumbo, Alcance, Guardia), cada hallazgo con evidencia de ruta y línea, revisión adversarial por un subagente de contexto nuevo y comparación con la auditoría anterior. Úsala cuando digan "audita el sistema", "auditoría", "qué está roto", "revisa mi sistema", el día 7 después de /arranque, una vez al mes o antes de regalar o publicar el kit.
---

# /auditoria

Comprueba con evidencia que el sistema recuerda, enfoca, alcanza y protege. No es opinión: cada comprobación tiene un archivo, una línea o un comando que la respalda. El resultado es un semáforo por comprobación, nunca un puntaje global, y una comparación con la auditoría anterior.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

## Semáforo

- **Verde**: la comprobación se cumple y hay evidencia.
- **Amarillo**: se cumple en parte, o no se pudo comprobar (se dice por qué). Sin evidencia nunca hay verde.
- **Rojo**: no se cumple y hay evidencia de que no se cumple.

Cada fila del informe lleva: eje, comprobación, semáforo, evidencia (`ruta:línea`, o comando y su salida resumida), y el semáforo que tenía en la auditoría anterior.

## Lo que necesitas

- Acceso de lectura a todo el kit. No se leen `.env` ni archivos de credenciales: se comprueba que existan fuera de git, no su contenido.
- Node es opcional. Si hay, corre los scripts; si no, cada comprobación dice cómo hacerse a mano.
- La auditoría anterior: el archivo `revisiones/auditoria-*.md` más reciente, si existe.

## Pasos

1. **Prepara.** Anota fecha y hora. Localiza la auditoría anterior y léela solo en su tabla de comprobaciones. Detecta Node (`node --version`). Si hay Node, corre `node scripts/indice.mjs` (regenera el índice y lista enlaces rotos) y `node scripts/sincronizar-skills.mjs --verificar` (Claude y Codex sincronizados). Guarda la salida resumida como evidencia. Sin Node: lee `conocimiento/indice.md` tal como está y anota que es manual. El chequeo de originalidad (`scripts/originalidad.mjs`) es tarea de quien mantiene el kit y necesita un corpus que la persona no tiene: aquí se marca "no aplica" (ver `CONTRIBUIR.md`).

2. **Memoria (continuidad).** Comprueba:
   - `bitacora/ahora.md` existe, tiene los cuatro bloques (Frentes abiertos, Espera decisión, Última actualización, Si se corta aquí) y su "Última actualización" es de hace menos de 7 días. Más de 60 líneas es amarillo.
   - `bitacora/diario/` tiene al menos una entrada en los últimos 7 días.
   - Hooks: `.claude/settings.json` tiene `SessionStart`, `Stop` y `PreToolUse` (con `Bash|PowerShell` en el matcher) apuntando a `scripts/`. Si no hay Node, verde solo si `CLAUDE.md` declara el modo manual (las tres líneas de "lee ahora.md… al cerrar actualiza… pide un sí").
   - Datos completos: cada archivo de `plantillas/datos/` existe en su ruta de la raíz, y `perfil/manual.md` existe y ya no tiene la marca `<!-- plantilla: sin llenar -->` (si la tiene, amarillo: "falta /arranque").
   - Horas reales: las horas del diario de los últimos 7 días son plausibles frente a la fecha del archivo (una secuencia perfecta de horas redondas o saltos de horas exactas es señal de hora inventada; amarillo).
   - `conocimiento/indice.md`: la sección "Enlaces rotos" está vacía. Cada roto es una línea de evidencia. Si el índice no existe, amarillo: "sin índice".
   - `perfil/`: cifras, precios y estados llevan fecha. Busca números sin fecha cerca (amarillo).

3. **Rumbo (prioridades).** Comprueba:
   - `perfil/prioridades.md` tiene exactamente tres prioridades, cada una con fecha límite, señal de éxito medible y "qué cuenta como avance". Ninguna vencida sin nota.
   - `bitacora/pendientes.md` tiene las tres secciones (Cola, Del usuario, Parqueadero). La Cola está ordenada y ninguna tarea lleva más de 30 días sin tocarse (usa la fecha de la línea o del diario).
   - El Parqueadero se usa: tiene entradas con fecha y una fecha de revisión. Vacío con ideas sueltas en el diario es amarillo.
   - `decisiones/registro.md` tiene entradas de los últimos 30 días y cada una dice el porqué. Decisiones mencionadas en el diario sin entrada aquí son rojo.

4. **Alcance (lo que el sistema puede tocar).** Comprueba:
   - Cada fila de `conexiones.md` dice qué puede leer, qué puede escribir y cuándo se probó. Sin fecha de prueba es amarillo.
   - Cada `.claude/skills/<nombre>/SKILL.md` tiene frontmatter con `name` igual a la carpeta y `description` en español. Uso de las skills, en una sola fila: busca `/<nombre>` en `bitacora/diario/` y lista las que no aparecen. Es informativo: "no aplica" en las dos primeras semanas después de `/arranque`; después, amarillo solo si `/retomar` o `/leveling` no aparecen.
   - `.agents/skills/` es espejo de `.claude/skills/` (misma lista de carpetas, mismo contenido). Compara con `git diff --no-index` o leyendo ambos.
   - `proyectos/indice.md`: cada ruta existe en disco. Ruta que no existe es rojo.
   - `CLAUDE.md` y `AGENTS.md` están sincronizados: `node scripts/sincronizar-skills.mjs --verificar` sin diferencias (difieren solo en la línea del import `@perfil/manual.md`, que en `AGENTS.md` es una orden de lectura). Desincronizados es rojo. Sin Node: compara a mano salvo esa línea.

5. **Guardia (seguridad y aprobaciones).** Comprueba, sin abrir secretos:
   - `.gitignore` incluye los secretos (`.env`, `.envrc`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa*`, `credentials*`, `secrets.json`) y las carpetas de datos (`perfil/`, `bitacora/`, `decisiones/`, `entrevistas/`, `revisiones/`, `conocimiento/`, `proyectos/`, `clientes/`, `conexiones.md`, `kit.local.json`), salvo lo que la persona decidió versionar con un sí en `aprobaciones.md`. Comprueba con `git check-ignore -v <ruta>` y `git ls-files` (solo nombres, nunca contenido). Un secreto o un dato personal rastreado es rojo. Si la carpeta no es un repo git, amarillo: "sin git" (el kit no se podrá actualizar con `git pull`).
   - Búsqueda de patrones de claves en archivos rastreados: `sk-`, `AKIA`, `ghp_`, `xoxb-`, `-----BEGIN`, `password=`, `token=`, `api_key`. Cada coincidencia real es rojo (muestra ruta y línea, nunca el valor).
   - `.claude/settings.json`: `permissions.allow` solo tiene comandos de lectura (`git status`, `git log`, `node scripts/*`, `date`...) y no autoriza `git push`, `vercel`, `netlify`, `az webapp` ni `gh release`. Hook `PreToolUse` activo o modo manual declarado.
   - Las filas "siempre pide sí" están en `CLAUDE.md` y la tabla del nivel elegido en `perfil/manual.md`.
   - `bitacora/aprobaciones.md` existe y cada push, deploy o mensaje a terceros que aparezca en el diario tiene su línea aquí. Uno sin registro es rojo.
   - Datos de terceros (cédulas, teléfonos, correos que no sean del usuario) solo en `clientes/`. Búscalos en `conocimiento/`, `bitacora/` y `entrevistas/`; cada hallazgo es rojo y se reporta anonimizado.
   - Originalidad del kit: "no aplica" (es un chequeo de quien mantiene el kit, con corpus propio; ver `CONTRIBUIR.md`).

6. **Revisión adversarial con contexto nuevo.** Escribe el borrador del informe. Lanza un subagente que no vio nada de este proceso (nivel Medio de `guias/orquestacion.md`; basta con Sonnet) y dale solo: el borrador, la lista de rutas de los archivos clave y esta consigna: "Tu trabajo es encontrar lo que está mal o lo que este informe pasó por alto. No confirmes nada; busca fallos. Cita ruta y línea de cada hallazgo. Si una comprobación en verde no tiene evidencia suficiente, dilo." Recibe su lista y clasifica cada punto: aceptado (entra al informe con su evidencia), rechazado (con el motivo en una línea) o por verificar (queda amarillo). Si no puedes lanzar subagentes (Codex, o la herramienta no está), relee el borrador con la misma consigna como si fueras otra persona, y marca la revisión como "degradada: sin contexto nuevo".

7. **Compara con la anterior.** Tabla corta: qué pasó de rojo o amarillo a verde, qué empeoró, qué comprobación es nueva, qué desapareció. Si no hay auditoría anterior, dilo y esta queda como línea base.

8. **Guarda, propone y deja rastro.** Escribe `revisiones/auditoria-AAAA-MM-DD.md` con la plantilla de abajo. Propón máximo tres mejoras, ordenadas por riesgo (primero Guardia, luego Memoria, Rumbo, Alcance), cada una en una línea con la comprobación que la origina, y agrégalas a la Cola de `bitacora/pendientes.md` marcadas "de auditoría AAAA-MM-DD" (el usuario las reordena). Si una es grande, señálala como candidata para `/leveling`. Actualiza `bitacora/ahora.md` y agrega una línea al diario (`node scripts/diario.mjs "texto"`, que pone la hora real). Termina con tres líneas al usuario: cuántos verdes, amarillos y rojos; qué cambió frente a la anterior; cuál es la primera mejora.

## Plantilla de `revisiones/auditoria-AAAA-MM-DD.md`

```markdown
---
etiquetas: [auditoria, revision]
actualizado: AAAA-MM-DD
---

# Auditoría del AAAA-MM-DD

Hora: HH:MM · Node: sí / no · Scripts corridos: … · Auditoría anterior: [[auditoria-AAAA-MM-DD]] o "ninguna (línea base)"

## Resumen
Verdes: N · Amarillos: N · Rojos: N

## Comprobaciones
| Eje | Comprobación | Semáforo | Evidencia (ruta:línea o comando → salida) | Anterior |
|---|---|---|---|---|
| Memoria | ahora.md actualizado hace menos de 7 días | verde | bitacora/ahora.md:3 "Última actualización: AAAA-MM-DD" | amarillo |

## Revisión adversarial
Revisor: subagente de contexto nuevo / degradada (sin contexto nuevo)
| Hallazgo del revisor | Clasificación | Motivo o evidencia |
|---|---|---|

## Comparación con la anterior
- Mejoró: …
- Empeoró: …
- Nuevo: …

## Mejoras propuestas (máximo tres, ya en la Cola)
1. <mejora> · origen: <eje, comprobación> · tamaño: pequeña / para /leveling

Hecho con Atajo · github.com/davidricardobc/atajo
```

La última línea se omite si `kit.local.json` tiene `"firma_en_salidas": false`.

## Qué guarda y dónde

- `revisiones/auditoria-AAAA-MM-DD.md`: tabla de comprobaciones, revisión adversarial, comparación y mejoras.
- Hasta tres líneas nuevas en la Cola de `bitacora/pendientes.md`.
- Una línea en `bitacora/ahora.md` y otra en el diario del día.

## Qué requiere un sí del usuario

- Nada para auditar: la skill solo lee, corre scripts locales y escribe el informe.
- Sí para aplicar cualquier arreglo que salga de los hallazgos (eso lo hace `/leveling`, `/conectar` o `/seguridad`, según el caso).
- Sí para borrar o mover cualquier archivo que el informe señale (se mueve a `archivo/`, no se borra).

## Reglas

- Sin evidencia no hay verde. "Se ve bien" no es evidencia.
- Nunca muestres el valor de un secreto, ni siquiera parcial. Solo ruta y línea.
- Nombres de terceros y datos personales se reportan anonimizados.
- La skill no corrige nada mientras audita. Separar diagnóstico de arreglo evita tapar lo que debía verse.
- Una comprobación que no aplica (por ejemplo, `clientes/` en un usuario sin clientes) se marca "no aplica", no verde ni amarillo.

> Atajo · © 2026 David Bajonero · MIT
