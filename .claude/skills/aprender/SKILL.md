---
name: aprender
description: Usa esta skill cuando el usuario quiera que el sistema aprenda algo nuevo o mejore con fuentes. Se activa con "aprende sobre…", "investiga cómo…", "qué hay nuevo en…", "anota esta lección", "esto no debe volver a pasar", "ármame una ruta de estudio de…", "verifica si estos precios siguen vigentes". Investiga en fuentes confiables, anota aprendizajes con fecha y fuente en conocimiento/aprendizajes.md, los enlaza con [[ ]], propone una sola mejora al sistema y, si se pide, arma una ruta de estudio corta.
---

# Aprender

El sistema mejora con fuentes y con sus propios errores. Esta skill convierte lo que se investiga o se vive en aprendizajes accionables con fuente, guardados en `conocimiento/aprendizajes.md`, y en una propuesta de mejora que el usuario aprueba o descarta. También arma rutas de estudio cortas para el usuario.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

Lee antes: `perfil/prioridades.md` (para el filtro) y `conocimiento/indice.md` (para no investigar lo que ya está anotado).

## Cuándo se usa

- El usuario pide aprender o investigar algo.
- Pasó algo que no debe repetirse: un error, un bloqueo, un desperdicio. Se anota como lección aunque no haya fuente externa (la fuente es la experiencia propia, con fecha).
- Hay que verificar datos con fecha (precios, tarifas, versiones) antes de usarlos en una propuesta o una guía.
- El usuario quiere una ruta de estudio.
- Una vez por semana, junto con `/leveling`, para revisar si alguna lección debe volverse regla, plantilla o skill.

## Fuentes, por orden de confianza

- Primero, documentación oficial del producto o la norma (sitios de los fabricantes, textos legales en portales oficiales).
- Segundo, blogs de ingeniería y publicaciones técnicas de las empresas que hacen la herramienta.
- Tercero, cursos y rutas de formación con respaldo institucional.
- Cuarto, practicantes reconocidos con historial público verificable.
- Quinto, la experiencia propia del kit: `decisiones/registro.md`, `revisiones/`, `bitacora/diario/`.

Regla: cada aprendizaje lleva fuente y fecha. Lo que no se pudo verificar se marca "sin verificar". Las cifras que cambian (precios, tarifas, estadísticas) llevan la fecha de consulta y se tratan como foto, no como verdad.

## Pasos

1. Define la pregunta en una línea y a cuál de las tres prioridades de `perfil/prioridades.md` le sirve (o a la operación del sistema). Si a ninguna, anótala en el Parqueadero de `bitacora/pendientes.md` y para aquí, salvo que el usuario diga "esto va igual".
2. Busca primero en `conocimiento/indice.md` si ya hay una nota sobre el tema. Si la hay, ábrela y parte de ahí; no repitas la investigación.
3. Investiga en las fuentes por orden de confianza, con búsqueda web y lectura de páginas. Máximo cinco fuentes por pregunta. Si una fuente contradice a otra, anota las dos y cuál pesa más y por qué. Si el usuario tiene Codex configurado, la lectura larga se puede delegar con `/codex` en nivel bajo o medio.
4. Extrae de tres a cinco aprendizajes accionables. Nada de resúmenes largos: cada uno dice qué se aprendió y cómo se aplica aquí.
5. Anótalos en `conocimiento/aprendizajes.md` con este formato: `- **AAAA-MM-DD · tema:** aprendizaje. Cómo aplicarlo: … Fuente: [nombre](url), consultado AAAA-MM-DD.` Agrega al menos un enlace `[[nota]]` a la nota de `conocimiento/` o la guía relacionada (`[[precios]]`, `[[diagnostico]]`, `[[ley-1581]]`, u otra). Si el tema merece su propia nota, créala en `conocimiento/<tema>.md` con frontmatter `etiquetas` y `actualizado`, y enlázala desde `aprendizajes.md`.
6. Propón una sola mejora concreta al sistema: una regla en "Reglas propias" de `perfil/manual.md`, una skill o plantilla propia (archivo nuevo con prefijo `mi-`, como en el paso 5 de `/leveling`), o una corrección de dato con fecha en una nota de `conocimiento/`. Los archivos del kit (skills, guías, plantillas) no se editan: una actualización los pisaría. Di qué cambiaría, qué costaría y cómo se probaría. No la apliques sin un sí, salvo que sea corregir un error propio ya acordado con el usuario.
7. Si el usuario aprueba: aplica la mejora, corre `node scripts/sincronizar-skills.mjs` si tocaste una skill, y anota la decisión en `decisiones/registro.md` con el porqué. Si la corrección vino de un error repetido, márcala como "instinto promovido" para que `/leveling` la cuente.
8. Cierra con una línea en el diario de `bitacora/` (`node scripts/diario.mjs "texto"`, que pone la hora real) y, si el frente queda abierto, en `bitacora/ahora.md`.

## Ruta de estudio (cuando el usuario la pide)

- De tres a cinco módulos, cada uno con enlace a la fuente oficial, duración estimada y qué sabrá hacer al terminar.
- Un ejercicio aplicado a un caso real del usuario (un cliente de `clientes/`, su propio negocio de `perfil/negocio.md`, o este kit).
- Una certificación opcional si suma a su objetivo del trimestre; si no suma, no la pongas.
- Se guarda en `conocimiento/ruta-<tema>.md`, enlazada desde `aprendizajes.md`, con fecha y un punto de retorno ("módulo 2 terminado el…") que el usuario actualiza.

## Qué guarda y dónde

- `conocimiento/aprendizajes.md`: siempre, con fecha, fuente y enlaces.
- `conocimiento/<tema>.md`: cuando el tema merece nota propia.
- `conocimiento/ruta-<tema>.md`: rutas de estudio.
- `decisiones/registro.md`: la mejora aprobada.
- Cierra las notas nuevas con `Hecho con Atajo · github.com/davidricardobc/atajo`, salvo que `kit.local.json` tenga `"firma_en_salidas": false`.

## Qué requiere un "sí" del usuario

- Aplicar la mejora propuesta.
- Investigar algo que no sirve a ninguna prioridad.
- Pagar por un curso, una certificación o una fuente.

## Reglas

- Sin fuentes inventadas ni cifras sin respaldo.
- Investiga solo lo que resuelve algo actual; cuida los tokens.
- Si el aprendizaje corrige algo que ya estaba escrito en una nota de `conocimiento/`, actualiza esa nota con la fecha nueva en lugar de dejar dos versiones vivas. Si corrige una guía del kit (`guias/`), no la edites: anota la corrección con fecha en `conocimiento/aprendizajes.md` y enlaza la guía.

> Atajo · © 2026 David Bajonero · MIT
