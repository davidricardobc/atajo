---
name: leveling
description: Revisión semanal que encuentra una sola mejora, la construye, la prueba y la mide; el sistema sube de nivel solo con mejoras entregadas. Usar cuando digan "subamos de nivel", "leveling", "qué automatizo ahora", "revisión de la semana", "qué estoy haciendo a mano", o cuando /auditoria deje un hallazgo abierto.
---

# /leveling

Piensa en un personaje que nunca deja de subir de nivel: no por grandes saltos, sino porque cada semana entrega una cosa que funciona y la mide. Eso es `/leveling`. Una vez por semana: oír qué pasó, ofrecer una sola mejora, operarla hasta que ande. El nivel es un número y una frase propia ("Nivel 4: ya no copias los pedidos a mano"). No se nombra ninguna serie ni personaje.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

Sigue el ritual de `perfil/marco.md`: **Oír, Ofrecer, Operar**. Si ese archivo todavía no existe, usa el ritual tal como está aquí.

## Lo que necesitas

- `revisiones/leveling.md` (si no existe, créalo con la plantilla del final).
- `bitacora/diario/` de los últimos 7 días, `bitacora/pendientes.md`, `decisiones/registro.md`, `conocimiento/aprendizajes.md`.
- `perfil/prioridades.md` y `perfil/marco.md`.
- La última `revisiones/auditoria-*.md`, si hay.
- Node es opcional. Cada script tiene su vía manual indicada.

## Antes de empezar: una por semana

Mira la línea "Última sesión" de `revisiones/leveling.md`. Si tiene menos de 7 días, dilo y ofrece dos salidas: esperar al día acordado, o anotar la idea en la Cola de `pendientes.md`. Solo sigues si el usuario dice "hazlo igual" (anótalo en la entrada como "segunda de la semana").

## Pasos

1. **Oír: junta las señales, no opiniones.** Lee el diario de los últimos 7 días, las tareas cerradas y la Cola de `pendientes.md`, las decisiones nuevas, las lecciones de `aprendizajes.md`, los hallazgos abiertos de la última auditoría y la medida que dejó pendiente el `/leveling` anterior (sección "Medidas por leer"). Cuenta y anota con evidencia (ruta y línea):
   - Qué se repitió: tareas hechas a mano 3 veces o más.
   - Qué falló: errores, reintentos, cosas que el usuario tuvo que rehacer.
   - Qué corrigió el usuario al agente más de una vez (candidato a "instinto": una corrección repetida se vuelve regla).
   - Qué quedó esperando una decisión demasiado tiempo.
   Lee también la medida de la semana pasada: si la mejora anterior no se sostuvo, el nivel no baja, pero esa mejora vuelve a la Cola y lo anotas.

2. **Filtra por las tres prioridades.** Abre `perfil/prioridades.md`. Cada señal que no sirva a una de las tres va al Parqueadero de `pendientes.md` con una línea y fecha. Si una prioridad ya venció o ya se cumplió, dilo aquí y propón actualizarla (requiere un sí). Lo que queda es la lista de candidatos.

3. **Ofrecer: una sola mejora.** Escoge una con el marco del usuario. Preséntala así, en cinco líneas:
   - Qué cambia, en palabras del usuario (no en jerga).
   - Valor: qué se ahorra o qué se gana, con la señal que lo respalda del paso 1.
   - Costo real: horas tuyas y del usuario, tokens aproximados, plata si hay.
   - Riesgo: qué puede salir mal y cómo se revierte.
   - Qué se va a medir y cómo se lee la próxima semana.
   Menciona en una línea el segundo candidato y por qué quedó atrás. Pregunta: "¿vamos con esta?". Sin un sí, no construyes; si prefiere la otra, se repite la ficha para esa.

4. **Acota con una entrevista corta.** Máximo cinco preguntas, una a la vez, cada una con tu suposición pegada (como en `/entrevista`): qué entra, qué no, cómo se prueba, qué pasa si falla, quién lo usa. Guarda cada respuesta en `revisiones/leveling.md` bajo "En curso" apenas llegue. Si no hay nada que acotar, dilo y pasa al siguiente paso.

5. **Operar: constrúyela.** La entrega es una de estas: una regla en "Reglas propias" de `perfil/manual.md`, una skill nueva en `.claude/skills/mi-<nombre>/`, un script nuevo en `scripts/mi-<nombre>.mjs` (con su prueba en `scripts/pruebas/mi-<nombre>.test.mjs`), una plantilla nueva en `plantillas/mi-<nombre>.md` o una reparación verificada. Crea archivos nuevos con el prefijo `mi-`; no edites los archivos que trae el kit (`CLAUDE.md`, sus skills, scripts, guías y plantillas): la próxima actualización los pisaría o chocaría con tus cambios. Si una skill del kit necesita un ajuste, cópiala con el prefijo `mi-` y ajusta la copia. Si toca un proyecto externo, sigue la matriz de autonomía de `CLAUDE.md`. Nada se publica ni se paga.

6. **Pruébala con un caso real.** No con un ejemplo inventado: con una tarea de esta semana del usuario. Anota qué se probó, qué salió y la evidencia (ruta, salida del comando o captura en texto). Si es un script y hay Node, corre `node --test "scripts/pruebas/*.test.mjs"`. Si falla, se arregla o se anota como "no entregada" con el motivo; una mejora a medias no sube nivel.

7. **Mide y registra el nivel.** Toma la primera lectura de la medida que definiste en el paso 3 (línea base). Escribe la entrada en `revisiones/leveling.md`: fecha, nivel, mejora, señal que la originó, prueba, medida (línea base y fecha de la próxima lectura), estado. Reglas:
   - El nivel sube solo si la mejora quedó entregada, probada con caso real y con su primera medida anotada. Si falta una de las tres, el estado es "pendiente" y el nivel no cambia.
   - Dale al nivel una frase propia en presente: "Nivel N: <qué ya no pasa o ya pasa>".
   - Si una corrección repetida se volvió regla, escríbela en "Instintos promovidos" de `perfil/manual.md` (fecha, regla, de qué corrección nació) y anótala también aquí.
   - Agrega la medida a "Medidas por leer" para la próxima semana.
   - Actualiza las líneas "Nivel actual" y "Última sesión" del encabezado, y vacía la sección "En curso".

8. **Cierra la semana.** Si existen y hay Node, corre `node scripts/sincronizar-skills.mjs` (copia `.claude/skills/` a `.agents/skills/` y regenera `AGENTS.md`) y `node scripts/indice.mjs`. Sin Node: copia a mano las carpetas de skills que cambiaron a `.agents/skills/` y pide a `/conectar` que reconstruya el índice. Actualiza `bitacora/ahora.md` (frente "leveling": qué se entregó y qué se mide), mueve lo cerrado en `pendientes.md`, y agrega una línea al diario (`node scripts/diario.mjs "texto"`, que pone la hora real). Termina con tres líneas al usuario: nivel alcanzado, qué quedó andando, qué se lee la próxima semana.

## Qué guarda y dónde

- `revisiones/leveling.md`: nivel, historial, instintos promovidos, medidas por leer, en curso.
- El artefacto entregado (skill, regla, script con prueba, plantilla o reparación).
- `bitacora/ahora.md`, `bitacora/pendientes.md` y el diario del día.

## Qué requiere un sí del usuario

- Elegir la mejora de la semana (paso 3).
- Cambiar `perfil/prioridades.md` si una prioridad venció o se cumplió.
- Correr una segunda sesión en la misma semana.
- Todo lo de la fila "siempre pide sí" de la matriz de autonomía: publicar, pagar, borrar, escribir a terceros.

## Reglas

- Una mejora por semana. La segunda idea buena va a la Cola, no a la mesa.
- Datos antes que opiniones: cada señal del paso 1 trae ruta y línea.
- Si no se puede medir, no cuenta como hecha.
- El nivel nunca baja. Una mejora que no se sostuvo vuelve a la Cola y queda anotada.
- Sin nombres de series ni personajes. El nivel es un número y una frase propia.
- Lo que la skill genere cierra con `Hecho con Atajo · github.com/davidricardobc/atajo`, salvo que `kit.local.json` tenga `"firma_en_salidas": false`.

## Plantilla de `revisiones/leveling.md`

Si el archivo no existe, cópialo de `plantillas/datos/revisiones/leveling.md` (es este contenido):

```markdown
# Leveling: historial de niveles

Nivel actual: 0 · "Nivel 0: el sistema acaba de arrancar"
Día de la semana para /leveling: <lo elige el usuario en /arranque; queda en kit.local.json>
Última sesión: (ninguna)

## Historial
| Fecha | Nivel | Mejora | Señal que la originó | Prueba (caso real y evidencia) | Medida (línea base → próxima lectura) | Estado |
|---|---|---|---|---|---|---|

## Instintos promovidos
(correcciones repetidas que se volvieron regla en perfil/manual.md: fecha, regla, de qué corrección nació)

## Medidas por leer
(qué se mide, cómo se lee, fecha de la próxima lectura)

## En curso
(respuestas de la entrevista corta de la sesión actual; se borra al cerrar la entrada)

## Candidatos descartados
(fecha, idea, a qué prioridad no servía o por qué perdió; si vale la pena, también está en el Parqueadero)

Hecho con Atajo · github.com/davidricardobc/atajo
```

> Atajo · © 2026 David Bajonero · MIT
