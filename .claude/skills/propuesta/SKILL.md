---
name: propuesta
description: Usa esta skill cuando el usuario quiera convertir un diagnóstico de cliente en una propuesta comercial con tres opciones, instalación y mensualidad, o revisar el alcance y el precio de una propuesta existente. Se activa con "arma la propuesta para…", "cotiza esto", "¿cuánto le cobro a…?", "revisa el precio y el alcance de…", "pásame el diagnóstico a propuesta". La salida es siempre un borrador en clientes/<cliente>/propuesta-vN.md con supuestos, "no incluye", hitos con aceptación objetiva y una revisión adversarial antes de mostrarse.
---

# Propuesta con tres opciones

Toma el diagnóstico de `clientes/<cliente>/diagnostico.md` y produce un borrador de propuesta con tres opciones de alcance distinto, instalación más mensualidad, hitos que se aceptan con pruebas objetivas y una recomendación con razones del cliente. Es la parte "Decidir" del marco: el trabajo es ayudar al cliente a decidir cuánto problema resolver, no empujarlo a un sí.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

Lee antes: `guias/precios.md` (método de siete pasos y rangos con fecha), `perfil/voz.md` (cómo escribe el usuario) y `plantillas/propuesta.md` (estructura). Nunca uses otra guía de precios.

## Pasos

1. Carga el diagnóstico. Si no existe `clientes/<cliente>/diagnostico.md`, no cotices: propone correr `/diagnostico` primero. Si existe pero el veredicto es "esto no es para nosotros", detente y ofrece redactar el mensaje de "no es para ti todavía". Si tiene datos pendientes que cambian el valor (volumen, tiempo, costo de errores), sigue, pero marca todo lo derivado como "pendiente de validar".
2. Mide el valor (paso 1 y 2 de la guía). Para cada fuente de valor (tiempo, pérdidas, errores) calcula el valor mensual, aplica el factor de confianza (confirmado 1,0; estimado 0,6; supuesto 0,3), resta meses de implantación y uno de adopción, y obtén V (valor conservador del año 1). Lo que no se sustente va a "escenario favorable" y no se cobra. No cuentes nada dos veces. Escribe los cálculos en la Parte B de la plantilla.
3. Calcula el piso y el corredor (pasos 3 y 4). Piso = horas estimadas × tarifa objetivo del usuario (de `perfil/negocio.md`; si no está, pregunta una sola vez y propón la referencia de la guía) × 1,2 más terceros durante la entrega. Corredor = 10 % a 20 % de V. Si el piso no cabe en el corredor, reduce el alcance o parte por módulos usando el mapa de capacidades del diagnóstico. Si ni así cabe, la recomendación es "esto no es para ti todavía", con la razón.
4. Arma las tres opciones (pasos 5 y 6): Arranque, Recomendada y Completa, con alcances distintos tomados del mapa de capacidades, no la misma cosa a tres precios. Cada una con resultado medible, alcance, "no incluye", supuestos explícitos (volumen máximo, sistemas, accesos, quién atiende excepciones), instalación, mensualidad de mantenimiento (y licencia si el usuario vende producto propio), terceros estimados a nombre del cliente con rango bajo/esperado/alto y límite de gasto, plazo y medición al lanzamiento, 30 y 90 días. Recomienda una con una frase del cliente. Lo normal es recomendar la del medio; si el diagnóstico pide recomendar Arranque o Completa, dilo igual de claro en la tabla y en el texto (por ejemplo "Arranque · la que recomiendo") para que el nombre "Recomendada" no contradiga la recomendación.
5. Define los hitos de la opción recomendada (paso 7): artefacto, prueba de aceptación con umbral y quién la ejecuta, aprobador por nombre de cargo, porcentaje de pago. Reparto base 30/40/30; la suma debe ser igual a la instalación. Sin anticipo por firma: el primer pago es al aprobar alcance y entregar accesos. Fecha límite de revisión por hito.
6. Completa las condiciones: qué incluye y qué no la mensualidad, nuevas funciones aparte, responsabilidades del cliente, cambios de alcance, pausa, salida, reversión, propiedad de datos y cuentas, datos personales (enlaza `[[ley-1581]]` y sugiere `/seguridad` si el sistema guarda datos de personas). Guarda el archivo como `clientes/<cliente>/propuesta-v1.md` (o la siguiente versión libre; nunca sobrescribas una anterior) con la leyenda de BORRADOR.
7. Revisión adversarial antes de mostrarla. Lanza un subagente nuevo, que no haya visto el proceso, con solo tres entradas: el diagnóstico, el borrador y `guias/precios.md`. Pregunta: "¿Dónde está mal el precio? ¿Qué falta en el alcance o en el 'no incluye'? ¿Qué supuesto rompe la propuesta? ¿Qué va a objetar el cliente? ¿Qué cifra no tiene fuente?". Pide hallazgos concretos con línea citada, máximo ocho. Registra cada hallazgo en la Parte C, corrige lo que proceda y guarda la nueva versión (`propuesta-v2.md`). Lo que no corrijas, explica por qué en la misma tabla.
8. Entrega al usuario: resumen de diez líneas (V, piso, corredor, las tres opciones con precio, la recomendación, los pendientes que impiden cotizar en firme y los hallazgos de la revisión) y la ruta del archivo. Recuerda que la Parte B y la Parte C no van en la versión que se envía. Anota una línea en el diario de `bitacora/` (`node scripts/diario.mjs "texto"`, que pone la hora real) y actualiza `bitacora/ahora.md`. Propón registrar en `decisiones/registro.md` el precio decidido cuando el usuario lo apruebe.

## Qué guarda y dónde

- `clientes/<cliente>/propuesta-vN.md`: cada versión, sin sobrescribir.
- Enlaces: `[[diagnostico]]`, `[[precios]]`, `[[ley-1581]]`, y desde el diagnóstico hacia la propuesta.
- Cierra el borrador con `Hecho con Atajo · github.com/davidricardobc/atajo`, salvo que `kit.local.json` tenga `"firma_en_salidas": false`. Esa línea se quita de la versión comercial que el usuario firma con su nombre.

## Qué requiere un "sí" del usuario

- Enviar la propuesta o cualquier parte al cliente. La skill nunca envía.
- Fijar la tarifa objetivo del usuario si no está en el perfil.
- Dar por cerrada una versión para exportar: el usuario revisa cifras, moneda e impuestos antes.
- Aprobar el texto no autoriza enviar, contratar ni publicar.

## Reglas

- Sin cifras inventadas. Cada número viene del diagnóstico, de la guía (con fecha) o se marca "pendiente de validar".
- Rangos de la guía con más de seis meses: verifícalos con `/aprender` antes de usarlos como referencia.
- Capacidad recuperada no es ahorro de caja. Si nadie sale de la nómina, dilo como horas para vender más.
- Tres opciones distintas, siempre. Si solo cabe una, dilo y explica por qué.
- Si consultas tarifas de terceros (Meta, modelos, servidores), anota proveedor, fecha y fuente en la propuesta.

> Atajo · © 2026 David Bajonero · MIT
