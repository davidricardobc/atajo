---
name: conectar
description: Usa esta skill cuando la persona diga "conecta esto", "agrega este proyecto", "que sepa de esta carpeta", "enlaza esta nota", instale una herramienta MCP o quiera reparar enlaces rotos del índice. Pone cada cosa nueva en su ruta correcta (proyectos/indice.md, conexiones.md o conocimiento/) con la mínima edición y regenera el índice.
---

# Conectar

Que el sistema encuentre algo nuevo por la ruta correcta y con la mínima edición. Si ya estaba bien enlazado, no tocas nada y lo dices.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

## Pasos

1. **Identifica qué es**: proyecto (código o sistema fuera del kit), carpeta o archivo de notas, herramienta o servicio, fuente (URL, documento), o una nota nueva de `conocimiento/`. Si no está claro para qué sirve, haz una sola pregunta con tu hipótesis.
2. **Verifica que exista.** Rutas locales: comprueba que la carpeta o archivo está ahí. URL: no abras nada que requiera credenciales; márcala "sin verificar acceso". Herramienta MCP: intenta una lectura de prueba inocua y anota el resultado.
3. **Pásalo por el filtro**: ¿a cuál de las tres prioridades de `perfil/prioridades.md` le sirve? Si a ninguna, propón dejarlo en el Parqueadero de `bitacora/pendientes.md` en vez de conectarlo.
4. **Escribe en el lugar correcto**, una fila o una nota, nada más:
   - Proyecto: fila en `proyectos/indice.md` con cuándo usarlo, ruta, por dónde empezar, reglas propias y fecha.
   - Herramienta, servicio o carpeta de archivos: fila en `conexiones.md` con qué puede leer, qué puede escribir, probado o no y fecha.
   - Nota o fuente: archivo en `conocimiento/<tema>.md` con frontmatter `etiquetas:` y `actualizado:`, al menos un `[[enlace]]` a una nota existente, y propones el enlace de vuelta.
5. **Repara enlaces rotos** si te lo piden o si el índice los muestra: por cada `[[x]]` roto, propón el archivo correcto o crear la nota; no cambies el texto sin confirmar.
6. **Regenera el índice**: `node scripts/indice.mjs` si hay Node. Sin Node, reconstruye `conocimiento/indice.md` a mano (una línea por nota: ruta, título, primera frase, etiquetas, enlaces) y repite esto una vez por semana en `/leveling`.
7. **Cierra**: una línea en el diario del día (`node scripts/diario.mjs "texto"`, que pone la hora real) y, si abriste un frente nuevo, actualiza `bitacora/ahora.md`.

## Qué guarda y dónde

- Una fila en `proyectos/indice.md` o `conexiones.md`, o una nota en `conocimiento/`.
- `conocimiento/indice.md` regenerado. Una línea en `bitacora/diario/AAAA-MM-DD.md`.

## Qué requiere un sí

- Nada para enlazar. Si conectar implica instalar algo, pagar o dar acceso a datos de terceros, lo dices y esperas el sí (queda en `bitacora/aprobaciones.md`).

> Atajo · © 2026 David Bajonero · MIT
