---
name: arranque
description: Arma el plan de la semana con 3 prioridades en 4 preguntas (unos 3 minutos). Usar el día 1 o cuando la persona diga "configúrame", "empecemos", "arranca", "refresca mi perfil" o abra un kit con perfil sin llenar. Después ofrece, opcional, la configuración completa (voz, canales, autonomía). Una pregunta a la vez y con hipótesis. Se puede repetir sin perder datos ni reglas propias.
---

# Arranque

Dos partes. La **rápida** (4 preguntas, unos 3 minutos) deja a la persona con algo que puede usar hoy: su plan de la semana. La **completa** (5 preguntas más, unos 8 minutos) es opcional y se puede hacer ahora o otro día. Una pregunta a la vez, siempre con tu mejor hipótesis ("creo que vendes servicios, ¿voy bien?") para que responder sea corregir, no redactar. Escribes el archivo correspondiente después de cada respuesta, no al final. Nada de lo que escribes aquí entra a git: los datos viven fuera del repositorio del kit.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

Si la persona ya trae varias respuestas en el mismo mensaje, úsalas y pregunta solo lo que falte. Corre cada comando por separado, sin `cd` ni `&&`, para que coincida con los permisos del kit y no pida aprobación de más.

## Antes de la primera pregunta (sin anunciarlo)

1. Si faltan datos (`perfil/`, `bitacora/`), créalos: con Node, `node scripts/sesion-inicio.mjs --solo-datos`; sin Node, copia cada archivo de `plantillas/datos/` a la misma ruta en la raíz, solo si no existe.
2. Lee `perfil/*.md`. Un archivo con la marca `<!-- plantilla: sin llenar -->` está vacío. Si ya hay respuestas, muéstralas en cinco líneas y pregunta solo lo que falta o cambió; nunca sobrescribas una respuesta sin confirmarla. Si `perfil/manual.md` ya tiene algo en "Reglas propias" o "Instintos promovidos", guárdalo aparte: se copia tal cual.
3. Saluda en una línea ("Hola. En 3 minutos te dejo tu plan de la semana. Son 4 preguntas.") y haz la primera pregunta. Nada de explicar el kit antes.

## Parte 1: arranque rápido (4 preguntas)

La primera pregunta va sin hipótesis de nombre: no supongas quién es la persona por la firma del kit ni por el usuario del sistema. Después de cada respuesta quita la marca de plantilla del archivo que toca y escribe lo confirmado con fecha.

1. **¿Cómo te llamas y a qué te dedicas?** Una frase, como en un ascensor. → `perfil/quien-soy.md`.
2. **¿Qué quieres lograr en los próximos 90 días?** Hasta tres cosas. Propón tú la fecha y una señal de éxito medible para cada una ("¿te sirve 'cerrar 2 clientes antes del 15 de febrero'?") y deja que corrija. Si no tiene negocio, las prioridades pueden ser de estudio, trabajo o personales; entonces no menciones clientes ni precios. → `perfil/prioridades.md`.
3. **¿Qué tienes que hacer o entregar esta semana?** Como salga, en desorden. → Cola de `bitacora/pendientes.md`.
4. **¿Qué tarea repetitiva te come más tiempo?** → anótala en la Cola como candidata para `/leveling`.

Con eso entrega **el plan de la semana** en el chat, con este formato y sin discurso:

```
Tu semana, <nombre> · <fecha de hoy>

Prioridades (hasta <fecha>)
1. <prioridad> · señal: <señal>
2. ...

Esta semana, en orden
1. <acción concreta> · sirve a: P1 · <día sugerido>
2. ...  (máximo 5)

No entra esta semana (Parqueadero)
- <lo que no sirve a ninguna prioridad>

Para automatizar
- <tarea repetitiva>: en /leveling la convertimos en tu primera mejora.
```

Ordena por prioridad y fecha. Lo que no sirve a ninguna prioridad va al Parqueadero, sin juicio. Guarda el mismo orden en la Cola de `bitacora/pendientes.md` (la línea "Correr `/arranque`..." pasa a "Cerrados recientes").

Luego escribe la **versión rápida de `perfil/manual.md`** desde `plantillas/manual.plantilla.md`: lo que sabes queda escrito, lo demás va como "pendiente", nivel de autonomía equilibrado. No pidas visto bueno en esta parte: dilo en una línea ("Dejé tu manual con lo básico; lo afinamos en la parte 2"). `CLAUDE.md` no se toca.

Cierra la parte 1 con este bloque. Cambia solo el segundo pedido: hazlo a la medida de su prioridad 1, en primera persona y listo para pegar (por ejemplo "Escríbeme en borrador el mensaje para los 5 contactos que pidieron cotización"). No agregues nada más:

```
Listo. Atajo ya te conoce.

Tu siguiente paso: copia uno de estos pedidos y pégalo aquí.
- "Empecemos con la tarea 1 de mi semana: dime por dónde arranco."
- "<pedido a la medida de su prioridad 1>"
- "Subamos de nivel: ¿qué hago a mano que podamos automatizar?"

- Escribe /red y mira tu sistema como una red: tú, tus 3 prioridades y lo que viene.
- Mañana abres Claude Code aquí y escribes /retomar: sigo donde quedamos.

¿Seguimos con la parte 2 (5 preguntas, unos 8 minutos: tu voz, tus canales y cuánta autonomía me das) o la dejamos para otro día?
```

Si dice que no, termina en el paso "Al terminar". Si pide la red, corre `/red` después del paso "Al terminar".

## Parte 2: configuración completa (opcional)

1. **Por dónde entra el dinero, o qué recurso te es más escaso** (`perfil/negocio.md`).
2. **Por dónde hablas con tus clientes o tu gente, y dónde viven tus archivos y notas** (`perfil/negocio.md`, `conexiones.md`).
3. **Dos textos reales tuyos, pegados sin editar** (`perfil/voz.md`).
4. **Qué nivel de autonomía quieres**: prudente, equilibrado o autónomo. Explica cada uno en una línea con la tabla de `guias/orquestacion.md`; recomienda equilibrado. Guárdalo en `kit.local.json` (`autonomia`) y agrega una entrada en `decisiones/registro.md` ("Nivel de autonomía: X", con el porqué).
5. **Qué nunca debo hacer sin preguntarte, y qué día quieres `/leveling`** (`perfil/quien-soy.md`, `kit.local.json` `leveling_dia`).

Después reescribe `perfil/manual.md` completo desde la plantilla: reemplaza cada `{{VARIABLE}}`, deja en la tabla solo la regla del nivel elegido, borra el comentario de instrucciones y pega sin cambios "Reglas propias" e "Instintos promovidos". Lo que no se sepa va como "pendiente", nunca inventado. Muestra el resultado en diez líneas y pide un visto bueno antes de guardar.

Detecta el entorno y anótalo en la tabla "Entorno" de `conexiones.md`: sistema operativo, `git --version`, `node --version`, `claude --version`, `codex --version` (cada uno por separado). Si no hay Node, avisa que los hooks quedan en modo manual (`/retomar` al abrir, `bitacora/ahora.md` a mano). Si tiene clientes, pregunta si `clientes/` va a git; incluirla requiere un sí que se anota en `bitacora/aprobaciones.md`. Si la carpeta es un repositorio y git no tiene `user.name` o `user.email`, ofrece fijarlos solo en este repositorio; si quiere respaldar sus datos, explica las dos vías del README sin ejecutar ningún `push`.

## Al terminar (parte 1 sola o las dos)

1. `bitacora/ahora.md`: frente "Arranque" cerrado (di si quedó la parte 2 pendiente) y el primer frente real abierto, apuntando a la línea 1 de la Cola. Si la parte 2 quedó pendiente, agrégala al final de la Cola: "Terminar `/arranque` parte 2 (voz, canales, autonomía)".
2. `decisiones/registro.md`: entrada nueva "Arranque de Atajo" con el nombre y la fecha (la entrada "Instalar Atajo" no se edita: el registro solo se agrega).
3. Con Node: `node scripts/sincronizar-skills.mjs` (regenera `AGENTS.md` para Codex) y `node scripts/indice.mjs`. Sin Node: el índice se construye en `/conectar`.
4. Línea del diario: `node scripts/diario.mjs "Arranque: plan de la semana listo"` (sin Node: consulta la hora con `date` o `Get-Date` antes de escribirla).

## Qué guarda y dónde

- Parte 1: `perfil/quien-soy.md`, `perfil/prioridades.md`, `perfil/manual.md` (versión rápida), `bitacora/pendientes.md`, `bitacora/ahora.md`, `decisiones/registro.md`, `bitacora/diario/AAAA-MM-DD.md`.
- Parte 2: además `perfil/negocio.md`, `perfil/voz.md`, `perfil/manual.md` completo, `kit.local.json` (`autonomia`, `leveling_dia`), `conexiones.md` (entorno).
- `AGENTS.md` regenerado por el script (único archivo del kit que cambia, y lo hace el script).

## Qué requiere un sí

- Guardar el `perfil/manual.md` completo de la parte 2 (muestras el resumen primero).
- Incluir `clientes/` en git.
- Fijar `user.name` y `user.email` de git en el repositorio.

> Atajo · © 2026 David Bajonero · MIT
