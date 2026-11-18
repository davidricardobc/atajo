---
name: retomar
description: Dice en qué iba la persona y propone el siguiente paso (la línea 1 de la Cola). Usar cuando pregunte "¿en qué iba?", "retomemos", "dónde quedamos", abra una pestaña nueva o una sesión sin hooks, o después de perder el contexto o de actualizar el kit. Crea los datos que falten, lee el punto de retorno, la Cola y el diario, y verifica decisiones pendientes.
---

# Retomar

Vuelve a donde iba sin depender de hooks ni de la memoria del modelo. Es la vía manual de lo que hace `scripts/sesion-inicio.mjs` al arrancar, más una propuesta de siguiente paso. También es el primer paso después de actualizar el kit con el instalador o con `git pull`.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

## Pasos

1. **Crea los datos que falten.** Si hay Node: `node scripts/sesion-inicio.mjs` (crea lo que falte desde `plantillas/datos/`, escribe la marca de sesión e imprime el punto de retorno con la hora real; usa esa salida). Sin Node: por cada archivo de `plantillas/datos/`, si no existe en la misma ruta de la raíz, cópialo; nunca pises uno existente. Luego consulta la hora real con `date` (Mac, Linux) o `Get-Date -Format "yyyy-MM-dd HH:mm"` (PowerShell) antes de escribir cualquier hora.
2. **Lee `bitacora/ahora.md`** completo. Si le falta alguno de los cuatro bloques (Frentes abiertos, Espera decisión, Última actualización, Si se corta aquí), complétalo antes de seguir.
3. **Lee la Cola** de `bitacora/pendientes.md` (solo esa sección) y el diario de hoy y de ayer en `bitacora/diario/`. No abras más archivos todavía.
4. **Revisa "Espera decisión".** Por cada punto, pregunta en una línea si ya se decidió. Si sí, agrega la entrada en `decisiones/registro.md` y quítalo de `ahora.md`. Si no, lo dejas.
5. **Detecta choques.** Si el diario de hoy tiene una sección de otra sesión sobre el mismo frente en la última hora, adviértelo y pregunta si sigues ahí o tomas otro frente.
6. **Propón el siguiente paso**: la línea 1 de la Cola, en una frase concreta y con el archivo o comando por donde empezar. `ahora.md` ("Si se corta aquí") debe apuntar a esa misma línea; si no coincide, corrige `ahora.md`, no la Cola. Espera la respuesta. Si la persona pregunta "¿en qué me enfoco?", responde con la Cola ordenada por prioridad y fecha, sin discurso. Si el kit se acaba de actualizar, dilo en una línea (qué cambió según `git log -5 --oneline`) y confirma que los datos siguen intactos.
7. **Actualiza solo si algo cambió**: `ahora.md` por frente (nunca completo) y la línea del diario con `node scripts/diario.mjs "Sesión retomada: <frente>"` (sin Node, con la hora que consultaste en el paso 1).

## Qué guarda y dónde

- Los datos que faltaban, copiados desde `plantillas/datos/`.
- La actualización de `bitacora/ahora.md`, una línea en `bitacora/diario/AAAA-MM-DD.md` y, si hubo decisión, una entrada en `decisiones/registro.md`.

## Qué requiere un sí

- Nada. Esta skill solo lee y ordena. Si el siguiente paso propuesto es publicar, pagar, borrar o escribir a un tercero, lo dice y pasa por `/publicar`.

> Atajo · © 2026 David Bajonero · MIT
