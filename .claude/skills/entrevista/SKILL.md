---
name: entrevista
description: Entrevista de una pregunta a la vez para sacar lo que el usuario tiene en la cabeza (un plan, una decisión, su marco, un cliente, una idea confusa) y dejarlo escrito sin perder nada. Úsala cuando digan "entrevístame sobre…", "ayúdame a pensar…", "no sé cómo explicar esto", "hazme preguntas", o cuando una tarea llegue sin para quién, por qué, cómo se ve el éxito o cuál es la restricción.
---

# /entrevista

Lo que la gente pide y lo que de verdad quiere casi nunca es lo mismo. Esta skill cierra esa brecha antes de que cueste algo: una pregunta a la vez, cada una con tu mejor suposición, hasta que puedas adivinar las respuestas antes de oírlas. Todo se guarda al momento. Si la conversación se corta, el archivo queda completo hasta la última respuesta.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

## Cuándo no usarla

- El pedido es claro y pequeño ("corrige esta tilde", "renombra este archivo").
- El usuario pidió rapidez, no profundidad.
- Es una pregunta de información ("¿cómo funciona X?").
- No hay un humano respondiendo (tarea programada, bucle automático). En ese caso anota la duda como bloqueo y no inventes.

## Lo que necesitas

- `perfil/quien-soy.md`, `perfil/negocio.md` y `perfil/prioridades.md` (si existen) para no preguntar lo que ya se sabe.
- La carpeta `entrevistas/`. Si no existe, créala.
- Nada más. No requiere Node ni scripts.

## Pasos

1. **Define el tema y abre el archivo.** Pon un nombre corto al tema (una o dos palabras, sin acentos ni espacios: `marco`, `cliente-x`, `plan-trimestre`). Si existe `conocimiento/indice.md`, busca ahí qué notas hablan del tema y abre máximo tres; si no existe, abre solo el perfil. Crea `entrevistas/AAAA-MM-DD-tema.md` con la plantilla de abajo, llenando "Objetivo" y "Lo que ya sé" antes de la primera pregunta.

2. **Escribe tu hipótesis en una frase, con porcentaje.** Una sola frase sobre lo que el usuario quiere de verdad, y un número honesto de confianza (0 a 100 por ciento). Si estás por debajo de 70 por ciento, di en la misma línea qué te falta saber. El número te obliga a ser honesto: si no puedes predecir cómo reaccionará a tus próximas tres preguntas, el número está inflado. Guárdalo en el archivo y muéstralo al usuario.

3. **Haz una sola pregunta, con tu suposición pegada.** Formato fijo:

   ```
   Pregunta: <una pregunta concreta>
   Mi suposición: <lo que crees que va a responder y por qué>
   ```

   Espera la respuesta. No hagas la segunda pregunta hasta tener la primera. La suposición sirve para dos cosas: el usuario corrige más rápido de lo que redacta desde cero, y deja a la vista lo que tú estabas dando por hecho. De vez en cuando apuesta en la dirección donde esperas que te contradiga, para que no te diga que sí por cortesía.

4. **Guarda la respuesta apenas llegue.** Antes de pensar la siguiente pregunta, escribe en el archivo: hora real (sácala con `node scripts/diario.mjs --hora`, o con `date` o `Get-Date` sin Node; nunca la calcules ni la supongas), pregunta, suposición, respuesta y si acertaste. Actualiza la hipótesis y el porcentaje. Si la respuesta suena a lo que "se debería" querer (palabras de moda, "lo que hace todo el mundo", "supongo que debería…"), anótalo en "Pide vs. quiere" y haz esta pregunta: "Si no tuvieras que justificárselo a nadie, ¿qué querrías de verdad?". Al final de cada guardado, deja al día el bloque "Punto de reanudación".

5. **Sigue la rama más incierta y sabe cuándo parar.** Cada respuesta abre la siguiente pregunta más incierta, no la siguiente de una lista. Paras cuando pase una de estas tres cosas:
   - Tu confianza llega cerca de 95 por ciento. La prueba es concreta: ¿puedes predecir la respuesta a las tres preguntas que harías ahora? Si sí, para.
   - El usuario dice "basta", "suficiente" o algo parecido.
   - Llegaste a 15 preguntas. Propón seguir otro día. El archivo ya tiene el punto de reanudación; con "retomemos la entrevista de <tema>" se continúa desde ahí.
   Si después de varias rondas sigues sin poder predecir nada, dilo: "llevo X preguntas y todavía no te leo; falta algo de fondo, ¿damos un paso atrás?".

6. **Devuelve lo que entendiste, en sus palabras.** Seis líneas, usando las frases del usuario, para que confirme o corrija línea por línea:

   ```
   - Resultado:        <qué quiere que exista o cambie>
   - Para quién:       <quién gana con esto>
   - Por qué ahora:    <qué cambió>
   - Éxito:            <cómo sabremos que funcionó>
   - Restricción:      <el límite que manda: plata, tiempo, gente, regla>
   - Fuera de alcance: <lo que no se va a hacer>
   ```

   Pide un sí explícito. "Lo que tú digas", "suena bien" o "dale" no son un sí: pregunta "¿algo que cambiarías?" y, si delega, ofrece dos opciones concretas para que escoja.

7. **Cierra y propón dónde vive cada cosa.** Escribe en el archivo tres listas: hechos confirmados, supuestos que quedaron abiertos, decisiones que se tomaron. Luego propón (sin aplicar) el destino de cada hecho confirmado:
   - A `perfil/` (quien-soy, negocio, prioridades, voz o marco) lo que describe al usuario y cambia poco. Con fecha si es una cifra o un estado.
   - A `decisiones/registro.md` cada decisión, con su porqué y qué la cambiaría.
   - A `conocimiento/<tema>.md` lo que es conocimiento reutilizable, con al menos un `[[enlace]]` a una nota existente y uno de vuelta propuesto. Enlaza siempre la captura: `[[AAAA-MM-DD-tema]]`.
   Muestra la propuesta como lista "archivo → qué línea entra". Solo aplicas con un sí del usuario, y aplicas solo lo que aprobó.

8. **Deja rastro.** Agrega una línea al diario (`node scripts/diario.mjs "texto"`, que escribe en `bitacora/diario/AAAA-MM-DD.md` con la hora real) y, si el tema abre un frente nuevo o cambia uno, actualiza `bitacora/ahora.md`. Si el usuario aprobó cambios al perfil o una decisión, escríbelos y regenera el índice (`node scripts/indice.mjs` si hay Node; si no, pide a `/conectar` que lo haga a mano).

## Plantilla del archivo `entrevistas/AAAA-MM-DD-tema.md`

```markdown
---
etiquetas: [entrevista, <tema>]
actualizado: AAAA-MM-DD
---

# Entrevista: <tema> (AAAA-MM-DD)

## Objetivo
<una frase: qué queremos tener claro al terminar>

## Lo que ya sé (del perfil y las notas)
- <hecho> (fuente: [[quien-soy]], [[negocio]]…)

## Hipótesis
- HH:MM · <frase> · confianza NN %. Falta: <qué>.
- (se agrega una línea cada vez que cambie)

## Preguntas y respuestas
### 1 · HH:MM
- Pregunta: …
- Mi suposición: …
- Respuesta: …
- Acerté: sí / en parte / no

## Pide vs. quiere
- Pide: … · Quiere: … · Señal: <qué frase lo delató>

## Punto de reanudación
- Preguntas hechas: N de 15 · Confianza: NN %
- Siguiente pregunta prevista: …
- Estado: en curso / cerrada / pausada el AAAA-MM-DD

## Cierre
### Hechos confirmados
### Supuestos abiertos
### Decisiones tomadas
### Propuesta de destino
- perfil/<archivo>.md → "<línea>"
- decisiones/registro.md → "<decisión>: <porqué>"
- conocimiento/<nota>.md → nota nueva, enlaza [[…]] y [[…]]

Hecho con Atajo · github.com/davidricardobc/atajo
```

La última línea se omite si `kit.local.json` tiene `"firma_en_salidas": false`.

## Qué guarda y dónde

- `entrevistas/AAAA-MM-DD-tema.md`: cada respuesta con hora, el punto de reanudación y el cierre.
- Propuestas (no cambios) para `perfil/`, `decisiones/registro.md` y `conocimiento/`.
- Una línea en el diario del día.

## Qué requiere un sí del usuario

- Aplicar cualquier cambio a `perfil/`, `decisiones/registro.md` o `conocimiento/` que salga de la entrevista.
- Dar por buena la lectura del paso 6 (sí explícito, no "lo que tú digas").

## Reglas

- Una pregunta por turno. Nunca una lista de preguntas.
- Guardas antes de preguntar lo siguiente. El archivo manda, no tu memoria.
- No vuelves a preguntar lo que está en el perfil; lo confirmas de pasada si hace falta ("sigues vendiendo a pymes, ¿cierto?").
- Lo que no se dijo, no se inventa. Un hueco es un supuesto abierto.
- Si el tema es "marco", el resultado va a `perfil/marco.md` y debe caber en diez líneas, servir a alguien que no vende y producir una pregunta concreta que el agente pueda hacer.

> Atajo · © 2026 David Bajonero · MIT
