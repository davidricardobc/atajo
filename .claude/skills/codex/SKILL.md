---
name: codex
description: Delega un encargo acotado a Codex con codex exec, con nivel de razonamiento según la dificultad, ficha de encargo autocontenida, carpeta propia por tarea y revisión del resultado antes de reportar; también pide a Codex una revisión cruzada del trabajo de Claude en decisiones críticas. Úsala cuando digan "pásale esto a Codex", "delega a Codex", "que Codex lo revise", "segunda opinión", o cuando el orquestador quiera trabajo en paralelo o en un proyecto donde Codex ya tiene historial.
---

# /codex

Claude orquesta y revisa; Codex ejecuta un encargo cerrado en su propia carpeta. Codex no ve esta conversación: todo lo que necesita va en la ficha. Codex es opcional. Si no está instalado, la skill lo dice y no falla nada más.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

## Niveles de razonamiento

| Nivel | Cuándo | Ejemplos |
|---|---|---|
| `low` | Rutina sin riesgo | resúmenes, plantillas, textos, renombrar, ordenar |
| `medium` | Revisar o cambiar poco | revisar un documento, cambios pequeños de código, investigar una fuente |
| `high` | Difícil o con consecuencias | código que irá a producción, seguridad, datos de personas, pagos |
| `xhigh` | Solo si `high` no alcanza | arquitectura o fallas difíciles; escribe el motivo en la ficha |

Usa el nivel más bajo que alcance. Si la ficha no dice el nivel, usa `codex.nivel_por_defecto` de `kit.json` (`medium`; `kit.local.json` puede cambiarlo). Si un encargo falla por falta de razonamiento, sube un nivel una sola vez y anótalo.

## Pasos

1. **Comprueba que Codex existe y qué permite tu versión.** Corre `codex --version` y `codex exec --help` (y `codex exec review --help` si vas a pedir revisión cruzada). En Windows, si PowerShell bloquea `codex.ps1`, usa `codex.cmd`. Si no está en el PATH, busca el ejecutable que trae la extensión de VS Code (`~/.vscode/extensions/openai.chatgpt-*/bin/<plataforma>/`) y comprueba su `--version`. No instales nada. Usa **solo** opciones que aparezcan en esa ayuda; anota en la ficha cuáles usaste. Modelo: si `kit.local.json` define `codex.modelo`, pásalo con `-m`; si no, no pases `-m` y deja el predeterminado del usuario. Si el modelo es rechazado, detente y avisa: no cambies de modelo en silencio.

2. **Decide si conviene delegar y con qué nivel.** Delega cuando el encargo es acotado, se puede verificar y corre en paralelo a otra cosa, o cuando Codex ya trabajó en ese proyecto. No delegues lo que toca secretos, publica o exige conversar con el usuario. El nivel se pasa hoy con `-c model_reasoning_effort=<nivel>`; si tu versión lo rechaza o la ayuda indica otra forma, usa esa y anótalo.

3. **Carpeta propia y chequeo previo.** Un encargo por carpeta o por worktree de git, nunca dos agentes sobre los mismos archivos. Si el proyecto usa git, crea tú el worktree (`git worktree add <ruta> -b <rama>`) o usa `--worktree` si la ayuda lo lista. Antes de gastar tokens comprueba: la carpeta existe y se puede escribir; las dependencias están instaladas y el build pasa; ningún programa tiene archivos bloqueados (servidor local, editor). Anota en `bitacora/ahora.md` qué encargo corre y sobre qué carpeta.

4. **Escribe la ficha `task.md` en la carpeta del encargo.** Parte de `plantillas/encargo-subagente.md` si existe; debe tener, en este orden:
   - Objetivo en una frase y a qué prioridad sirve.
   - Contexto confirmado: hechos, decisiones tomadas y rutas absolutas. Nunca "lee toda la carpeta" ni "como hablamos".
   - Archivos que puede tocar y archivos prohibidos. Cambios ajenos que debe conservar.
   - Criterio de terminado: qué debe existir y con qué comando se verifica.
   - Prohibido: leer o mostrar `.env`, credenciales o tokens; publicar (push, deploy, preview, DNS, producción); pagar; borrar fuera de su carpeta; escribir a terceros. Datos ficticios en pruebas.
   - Nivel y modelo usados, y por qué.
   - Formato del informe de vuelta: qué cambió y dónde, pruebas corridas con su resultado, lo no probado, riesgos, pendientes y cómo revertir.

5. **Ejecuta con la entrada cerrada.** La ficha entra por stdin, así la entrada se cierra al terminar el archivo y Codex no se queda esperando. Usa `--sandbox workspace-write` para construir y `--sandbox read-only` para revisar. Agrega `--skip-git-repo-check` solo si la carpeta no es un repo a propósito.

   ```bash
   codex exec -c model_reasoning_effort=medium --sandbox workspace-write \
     -C "<carpeta>" -o "<carpeta>/result.md" - < "<carpeta>/task.md"
   ```

   ```powershell
   Get-Content -Raw -Encoding utf8 "<carpeta>\task.md" |
     codex exec -c model_reasoning_effort=medium --sandbox workspace-write -C "<carpeta>" -o "<carpeta>\result.md" -
   ```

   En los primeros minutos confirma que arrancó (hay salida o una sesión nueva). Nunca uses opciones que quiten el sandbox o las aprobaciones (las que dicen `dangerously`, `danger-full-access`, `--ignore-rules`) ni amplíes permisos para saltar un bloqueo: informa el bloqueo.

6. **Revisa antes de reportar.** El resumen de Codex no es prueba. Comprueba: código de salida; `result.md`; los archivos tocados (`git -C <carpeta> status` y `git -C <carpeta> diff --stat`); que no haya archivos fuera del alcance ni secretos; y corre tú las pruebas del criterio de terminado. Si falta algo, devuelve una corrección acotada al mismo alcance, una vez, y vuelve a revisar solo lo cambiado. Al usuario le reportas qué cambió, dónde, qué se probó y qué falta; nunca "listo" sin verificar.

7. **Revisión cruzada en decisiones críticas.** Cuando el trabajo de Claude toca producción, seguridad, datos de personas, dinero, temas legales o algo difícil de revertir, pide a Codex que lo revise sin ver el razonamiento de Claude:
   - Cambios de código: `codex exec review --uncommitted` o `codex exec review --base <rama>` (si tu versión lo lista), con `-c model_reasoning_effort=high`.
   - Documentos o decisiones: `codex exec --sandbox read-only` con una ficha que trae solo los archivos, el criterio y una pregunta: "¿qué está mal aquí? Cita archivo y línea".
   Claude evalúa cada hallazgo y lo acepta o lo descarta con una razón escrita. No se acepta a ciegas ni se descarta en bloque. El resultado va al informe para el usuario.

8. **Registra.** Agrega una línea a `revisiones/codex.md` (si no existe, créalo con esta tabla): `| Fecha | Encargo | Carpeta | Nivel | Modelo | Resultado (ok, parcial, bloqueado) | Tokens aprox. | Desperdicio y causa |`. Quita el encargo de `bitacora/ahora.md` y anota una línea en el diario del día (`node scripts/diario.mjs "texto"`, que pone la hora real). Si un encargo consumió mucho y avanzó poco, díselo al usuario antes de lanzar otro.

## Qué guarda

- `task.md` y `result.md` en la carpeta del encargo.
- Una línea en `revisiones/codex.md` por ejecución.
- La línea del encargo en `bitacora/ahora.md` mientras corre.

## Qué requiere un sí del usuario

- Instalar o actualizar Codex, o cambiar su plan.
- Cualquier publicación del resultado: pasa por `/publicar`.
- Usar un nivel `xhigh` en encargos largos, o lanzar más de tres encargos en paralelo, si el usuario pidió cuidar su cupo.

> Atajo · © 2026 David Bajonero · MIT
