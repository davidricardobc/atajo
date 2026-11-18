---
name: diagnostico
description: Usa esta skill cuando el usuario quiera entender a un cliente o prospecto antes de proponerle algo. Se activa con frases como "prepárame la reunión con…", "aquí están las notas de la reunión", "esta es la transcripción", "diagnostica a este cliente", "¿vale la pena este cliente?", "me pidió un CRM / un bot / cinco agentes, ¿qué hago?". Separa lo que el cliente pide de lo que necesita, pregunta una cosa a la vez con hipótesis, arma un mapa de capacidades si el pedido trae varias cosas y guarda todo en clientes/<cliente>/diagnostico.md al momento. Es el paso previo a /propuesta.
---

# Diagnóstico de cliente

Convierte una conversación con un cliente (notas, chat, transcripción, o lo que el usuario recuerde) en un diagnóstico que diga si hay valor, qué decisión tiene que tomar el cliente y qué datos faltan para cotizar. Es la parte "Escuchar" del marco del kit (`perfil/marco.md`): vender es ayudar a decidir, y la venta empieza cuando cierras la boca.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

Lee antes: `guias/diagnostico.md` (preguntas y reglas) y, si existe, `clientes/<cliente>/` para no preguntar lo que ya se sabe. Usa `plantillas/diagnostico.md` como estructura de salida.

## Dos modos

- Antes de la reunión: el usuario va a hablar con el cliente y quiere llegar preparado. Salida: una guía de ocho a diez preguntas abiertas, adaptadas al tipo de negocio, con el objetivo de que el cliente hable el 80 % del tiempo.
- Después de la reunión: el usuario trae lo que pasó. Salida: el diagnóstico completo.

Si no está claro cuál, pregunta una sola cosa: "¿ya hablaste con el cliente o vas a hablar?".

## Pasos

1. Abre el archivo antes de preguntar nada. Crea `clientes/<cliente>/diagnostico.md` desde la plantilla (nombre de carpeta en minúsculas, sin acentos ni espacios). Si ya existe, lee lo que hay y agrega una sección con la fecha de hoy. Todo lo que sigue se escribe ahí apenas se sabe, no al final: si la conversación se corta, el archivo queda completo hasta la última respuesta.
2. Anota el pedido tal cual. "Pide: un CRM". Eso es la hipótesis del cliente sobre la solución; se respeta y no se cotiza todavía.
3. Lee todo el material que trajo el usuario (notas, transcripción, chats) y extrae lo que diga sobre: dolor en palabras del cliente, proceso actual, volumen, tiempo por caso, personas, errores y su costo, pérdidas, ticket y margen, sistemas y datos, datos personales que guardan, quién decide y quién aprueba, urgencia, restricciones, qué ya intentaron. Llena la tabla de la plantilla y marca cada dato como confirmado, estimado o pendiente. No inventes cifras; un hueco se llama "pendiente".
4. Pregunta al usuario lo que falte, una pregunta a la vez, siempre con tu mejor hipótesis y un porcentaje de confianza ("creo que lo que más duele son los pedidos perdidos en hora pico, 70 %. ¿Voy bien?"). Cada respuesta se guarda antes de la siguiente pregunta. Prioriza lo que más cambia el valor: volumen, tiempo, costo de errores, quién decide. Para en diez preguntas, cuando la confianza global pase de 85 %, o cuando el usuario diga "basta"; lo que quede va a "Datos que faltan".
5. Separa lo que pide de lo que necesita y escríbelo en dos líneas. Si difieren, explica en una frase por qué (usa la tabla de la sección 4 de `guias/diagnostico.md` como referencia, no como respuesta).
6. Si el pedido trae varias cosas (tres herramientas, "cinco agentes", "automatizar todo"), arma el mapa de capacidades: cada módulo, el dolor que atiende, de qué depende (datos, otro módulo, una decisión del cliente), el orden en que conviene construirlo y su peso en el valor (alto, medio, bajo). Lo que no tenga un dolor detrás se anota como idea, sin módulo. Este mapa define las tres opciones de `/propuesta`.
7. Escribe el veredicto honesto en una de tres formas: "sí hay valor", "hay valor pero falta X" o "esto no es para nosotros", con una frase que el usuario pueda decirle al cliente. Luego las tres decisiones que el cliente tendrá que tomar y la tabla de datos que faltan para cotizar (dato, quién lo consigue, para cuándo). Si hay datos personales de terceros en el material, anonimízalos en el archivo y recuerda `/seguridad`.
8. Cierra: propone el siguiente paso (propuesta, demostración corta o segunda reunión) y un borrador de mensaje de seguimiento corto para que el usuario lo revise (gracias, tres cosas entendidas en palabras del cliente, datos pendientes, fecha). Si el usuario quiere, guarda la transcripción resumida en `clientes/<cliente>/notas.md`. Agrega una línea al diario de `bitacora/` (`node scripts/diario.mjs "texto"`, que pone la hora real) y actualiza `bitacora/ahora.md` si el frente queda abierto.

## Qué guarda y dónde

- `clientes/<cliente>/diagnostico.md`: siempre, escrito al momento.
- `clientes/<cliente>/notas.md`: solo si el usuario lo pide.
- Enlaces: `[[negocio]]`, `[[precios]]`, `[[diagnostico]]` y la propuesta cuando exista.
- Cierra el archivo con `Hecho con Atajo · github.com/davidricardobc/atajo`, salvo que `kit.local.json` tenga `"firma_en_salidas": false`.

## Qué requiere un "sí" del usuario

- Enviar cualquier mensaje al cliente. La skill solo deja el borrador.
- Guardar datos personales de terceros sin anonimizar.
- Pasar a `/propuesta`: se propone, no se arranca sola.

## Reglas

- Una pregunta a la vez. Nunca un formulario.
- Sin cifras inventadas. "Muchos" no se cotiza; "unos 250 a la semana" sí.
- No propongas soluciones en este paso. Si el usuario insiste, anota la idea en el archivo y sigue escuchando.
- Si no hay valor, dilo. Es la frase que más confianza construye.

> Atajo · © 2026 David Bajonero · MIT
