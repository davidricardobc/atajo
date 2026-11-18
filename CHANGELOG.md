# Cambios

Formato: una sección por versión, lo más nuevo arriba. Fechas en AAAA-MM-DD.

## 0.4.0 · 2026-11-18

### Nuevo

- `/equipo`: la sesión principal hace de orquestador. Parte un encargo con partes independientes en dos a cuatro piezas, lanza los agentes en paralelo, manda a un revisor y entrega pidiendo tu sí. Nada sale hacia afuera sin ese sí.
- `.claude/agents/`: el equipo de base de `/equipo`. `investigador` (hechos, hipótesis y preguntas, sin web), `constructor` (una pieza que se puede abrir), `redactor` (textos en tu voz, siempre BORRADOR) y `revisor` (compara cada entrega con su criterio de terminado). Ninguno tiene herramientas de web ni de comandos.
- `scripts/abrir.mjs`: abre una dirección web o un archivo que se puede ver (páginas, textos, PDF, imágenes) con el programa por defecto, sin intérprete de comandos. No abre programas ni accesos directos. `/equipo` lo usa para mostrar el resultado.

### Cambios

- El plugin `taller` suma `/equipo` y sus cuatro agentes.
- En Codex, que no tiene subagentes, `/equipo` hace las piezas en orden, una por una, con las reglas de cada rol.
- `scripts/verificar.mjs` revisa también que existan los agentes del marketplace.
- `/red` muestra `/equipo` con su frase de una línea.
- `guias/orquestacion.md`, el README y la guía de la primera semana mencionan `/equipo`.

## 0.3.0 · 2026-11-18

Primera versión pública.

### Nuevo

- `/red`: dibuja tu sistema como una red de neuronas (tú, tus prioridades, frentes, proyectos, tareas, decisiones y skills) en `red/index.html`, una página local sin internet. Lo arma `scripts/red.mjs` leyendo tus archivos; no inventa nada.
- `/arranque` cierra con "Tu siguiente paso": 3 pedidos listos para pegar (uno hecho a la medida de tu prioridad 1) y la invitación a `/red`. Los instaladores lo dicen como paso 4.
- `docs/primera-semana.md`: qué hacer del día 1 al 7.
- README con "Primeros 5 usos" (estudiante, vendedor, dueño de negocio), una captura de `/red` con datos ficticios y preguntas de costo, privacidad y qué hace y qué no.

### Cambios

- Tus mejoras propias (skills, scripts y plantillas que crean `/leveling` y `/aprender`) van en archivos nuevos que empiezan por `mi-`. Git los ignora, así que una actualización nunca los pisa ni se bloquea por ellos. Antes, esas skills editaban archivos del kit.
- `/auditoria` resume el uso de las skills en una sola fila y no marca amarillo a quien recién empieza.
- Descripciones de `/arranque`, `/retomar` y `/leveling` con lo que hacen al principio.
- Los instaladores terminan con la guía de la primera semana y qué decir si algo falla, y explican sin jerga qué pasa cuando falta Node.
- El ejemplo B de `guias/precios.md` usa una firma de contadores ficticia.
- `/red`: las primeras 5 tareas de tu Cola salen como neuronas, el rol y los nombres se cortan en una idea completa (sin "…") y cada skill tiene una frase de una línea.
- La guardia ya no trata `find ... -exec` como "solo listar": sobre un secreto se bloquea, y `find -delete` o `-exec rm` piden tu sí.
- `/propuesta` deja claro cuál opción recomienda aunque no sea la del medio.

- La firma de las salidas ahora es "Hecho con Atajo · github.com/davidricardobc/atajo". El copyright del kit no cambia. Se apaga con `"firma_en_salidas": false` en `kit.local.json`.
- `guias/orquestacion.md` suma topes de tokens por tipo de modelo y cómo reportar el gasto de cada encargo.
- Los instaladores avisan que la primera vez Claude Code pregunta si confías en la carpeta.

## 0.2.0 · 2026-11-14

Para actualizar: corre otra vez el comando de instalación y responde "s". Tus datos no se tocan.

### Arranque

- `/arranque` empieza con 4 preguntas (unos 3 minutos) y entrega el plan de la semana con tus 3 prioridades. La configuración completa (voz, canales, autonomía) pasa a ser una parte 2 opcional que queda en la Cola.
- Claude Code ya no pide permiso para editar tus carpetas de datos (`perfil/`, `bitacora/`, `decisiones/`, `entrevistas/`, `revisiones/`, `conocimiento/`, `proyectos/`, `conexiones.md`, `kit.local.json`). El kit y `clientes/` siguen pidiendo aprobación.

### Instalación

- git deja de ser obligatorio: sin git, el instalador baja el zip y la actualización copia encima solo los archivos del kit.
- El instalador dice qué necesitas antes de empezar y explica en español qué hacer si falla la descarga.
- Al reinstalar, recomienda `/arranque` si el perfil sigue sin llenar (antes decía `/retomar`).
- La lista de planes incluye Ultra y aclara que el plan gratis no trae Claude Code.

### Documentación

- README nuevo: qué es en una frase, instalación en 3 pasos, ejemplo de salida, diagrama, requisitos, camino sin Claude Code, zip, actualizar, desinstalar y privacidad.
- `README.en.md` (resumen en inglés), `docs/arquitectura.md` (decisiones de diseño y barreras de seguridad) y este archivo.

### Calidad

- `scripts/verificar.mjs`: revisa el frontmatter de cada skill, que la copia para Codex esté al día, los enlaces internos, los JSON y la sintaxis de los instaladores.
- `.github/workflows/verificar.yml`: corre las pruebas y la verificación en Ubuntu, macOS y Windows.

## 0.1.0 · 2026-10-06

- Primera versión: núcleo, 12 skills, guías, plantillas, hooks (inicio, cierre, índice, guardia), instaladores para Windows y Mac/Linux, y marketplace de 4 plugins.
