---
name: equipo
description: Usa esta skill cuando la persona pida armar un equipo, poner a trabajar a varios agentes a la vez o repartir un encargo que tiene partes independientes. Se activa con "arma el equipo para…", "pon al equipo a trabajar en…", "reparte esto entre agentes", "contrata agentes para…", "prepárame la reunión con…". La sesión principal hace de orquestador, como un gerente que contrata a su equipo: parte el encargo, lanza de dos a cuatro agentes en paralelo, manda a revisar lo que entregan y lo presenta. Nada sale hacia afuera sin un sí.
---

# Equipo: un orquestador que contrata a sus agentes

Tú eres el orquestador. No haces el trabajo de los agentes: lo partes, lo repartes, lo revisas y respondes por el resultado. La persona decide y aprueba. Los roles y los niveles de dificultad están en `guias/orquestacion.md`.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

## El equipo de base

Están en `.claude/agents/`. Cada uno trae su modelo; cámbialo en el encargo solo si la pieza lo pide.

| Agente | Para qué | Modelo |
|---|---|---|
| `investigador` | Reúne hechos de los archivos de la persona y arma preguntas e hipótesis. No busca en la web | rápido |
| `constructor` | Construye algo que se puede abrir: una página en un solo archivo, un script, una plantilla | estándar |
| `redactor` | Escribe en la voz de la persona: mensajes, propuestas cortas, guiones. Siempre BORRADOR | estándar |
| `revisor` | No vio el proceso. Compara cada entrega con su criterio de terminado y dice qué falla | rápido |

Si una pieza no cabe en estos roles, usa un subagente general con la ficha de `plantillas/encargo-subagente.md`.

Sin subagentes (Codex, o la herramienta no está): haces tú las piezas en orden, una por una, con las mismas reglas de cada rol (léelas en `.claude/agents/`).

## Pasos

1. **Entiende el encargo en una frase** y pásalo por el filtro de prioridades en una línea ("sirve a la prioridad 2"). Si falta un dato sin el cual el trabajo no sirve, haz una sola pregunta. Si no, supón lo razonable, anota el supuesto y sigue. No abras más de dos archivos antes de repartir: `perfil/manual.md` ya está cargado.
2. **Parte el encargo en dos a cuatro piezas independientes.** Una pieza, un agente, un archivo de entrega dentro de `proyectos/<nombre-corto>/`. Dos agentes nunca escriben el mismo archivo. Si las piezas dependen una de otra, no es trabajo para un equipo en paralelo: hazlo en orden o tú mismo.
3. **Muestra el equipo y lánzalo en el mismo mensaje.** Primero la tabla (Agente, Encargo, Entrega). Después todos los agentes en un solo turno, para que corran a la vez. Cada encargo es corto, máximo 12 líneas: objetivo en una frase, los hechos confirmados (el agente no ve esta conversación: pégale lo que necesita), el archivo exacto que entrega y el criterio de terminado. Las reglas de cada rol ya las trae el agente: no las repitas.
4. **Manda a revisar.** Cuando vuelvan, lanza al `revisor` con las rutas de las entregas y sus criterios de terminado, sin contarle cómo se hicieron. Corrige tú lo menor (una edición corta por archivo, sin reescribir entregas). Lo mayor vuelve una sola vez al agente que lo hizo. Lo que no se arregle se reporta, no se esconde.
5. **Entrega.** Si hay algo que se puede ver, ábrelo primero con `node scripts/abrir.mjs <ruta>`. Después, en menos de 15 líneas: la tabla "quién hizo qué" (agente, archivo, veredicto del revisor), los supuestos y lo que espera un sí. Lo que sea para terceros queda como BORRADOR y no se envía: muéstralo completo y pregunta "¿lo dejo así?".
6. **Deja rastro.** Una línea en el diario (`node scripts/diario.mjs "texto"`) y el frente en `bitacora/ahora.md`.

## Reglas

- Tope: cuatro agentes a la vez y una sola ronda de correcciones. Un equipo más grande gasta el plan sin entregar más.
- Los agentes no publican, no pagan, no borran, no leen secretos y no escriben a terceros. Todo lo que pide un sí pasa por `/publicar`.
- Sin cifras inventadas. Lo que no tiene fuente va marcado como "supuesto por validar" o "[por confirmar]".
- Tú respondes por el resultado: lee el veredicto del revisor antes de presentar. "El agente dijo que quedó bien" no es una prueba.

## Qué guarda y dónde

- `proyectos/<nombre-corto>/`: una entrega por agente y `revision.md` con el veredicto.
- Cierra las entregas con `Hecho con Atajo · github.com/davidricardobc/atajo`, salvo que `kit.local.json` tenga `"firma_en_salidas": false`.
