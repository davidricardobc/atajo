---
name: publicar
description: Puerta única antes de que algo salga al mundo. Lista de qué cambió, pruebas, impacto, cómo revertir y monitoreo, más una definición de terminado fija; termina pidiendo un sí explícito y lo registra en bitacora/aprobaciones.md. Úsala cuando digan "publica", "sube los cambios", "haz push", "despliega", "manda a producción", "saca un preview", "cambia el DNS", "envíale esto al cliente", "manda el mensaje", o cuando el hook de guardia detecte un comando de publicación.
---

# /publicar

Nada sale del computador del usuario sin pasar por esta puerta. Esta skill **nunca publica sola**: prepara, muestra y espera un sí. Vale igual en los tres niveles de autonomía (prudente, equilibrado y autónomo).

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, esta skill está instalada como plugin sin el kit: avisa y ofrece instalarlo (ver README).

Cuenta como publicar:

- `git push` a cualquier remoto, merge que dispare un despliegue, etiqueta o release.
- Deploy o preview (Vercel, Netlify, Azure, etc.), aunque sea "solo de prueba".
- Cambios de DNS, dominios o certificados.
- Cambios en producción: base de datos, variables de entorno, configuración, migraciones.
- Mensajes o documentos a un tercero, o cualquier texto con el nombre del usuario hacia afuera (correo, WhatsApp, propuesta, publicación en redes).

## Pasos

1. **Qué sale y a quién le cambia algo.** Una frase: qué se publica, a dónde (remoto y rama, proyecto y entorno, dominio, destinatario) y quién lo nota (clientes, usuarios finales, el propio usuario). Si hay más de un destino, cada uno es una publicación aparte con su propio sí.

2. **Qué cambió.** Evidencia, no memoria:
   - Código: `git status`, `git log --oneline <remoto>/<rama>..HEAD` y `git diff --stat <remoto>/<rama>..HEAD`. Si hay archivos sin commit, dilo: no se publican cosas a medias.
   - Infraestructura o DNS: el valor actual y el nuevo, uno al lado del otro.
   - Mensaje o documento: el texto final completo, tal como saldrá. Sin la firma de Atajo (los textos que el usuario firma con su nombre no la llevan).

3. **Pruebas.** Primero detecta cuáles existen: `scripts/pruebas/*.test.mjs` (se corren con `node --test "scripts/pruebas/*.test.mjs"`), el bloque `scripts` de `package.json` (`npm test`, `build`, `lint`), y las carpetas `test/`, `tests/` o `__tests__/`. Si hay pruebas, córrelas; nunca digas "no hay pruebas automáticas" sin haber buscado. Anota comando y resultado (cuántas pasaron), y una prueba manual descrita en una línea ("abrí /pedidos, creé uno, apareció en la lista"). Lo que no se probó se escribe "no probado" con el motivo. Nunca "debería funcionar".

4. **Revisión de lo que sale.** Sobre los archivos que van a salir:
   - Secretos: `git diff --name-only <remoto>/<rama>..HEAD` y busca en esos archivos los patrones del paso 3 de `/seguridad`, mostrando solo archivo y línea. Un hallazgo detiene todo.
   - Datos personales de más: nada de datos reales de clientes en demos, pruebas ni capturas.
   - Cifras: cada número de un texto (precios, plazos, resultados) tiene fuente o se quita. No se inventa nada.
   - Si toca datos de personas, inicio de sesión o pagos: `/seguridad` en verde, o el amarillo aceptado por el usuario.

5. **Impacto, reversión y monitoreo.** Tres líneas:
   - **Impacto si falla:** qué se rompe y para quién.
   - **Cómo revertir:** un comando o acción concreta (`git revert <sha>` y push; "promover el deploy anterior en el panel"; "volver el registro DNS a <valor anterior>", sabiendo que tarda lo que diga su TTL). Un mensaje enviado no se puede revertir: dilo en voz alta.
   - **Monitoreo:** qué mirar y cuándo. Por ejemplo: la URL principal y los registros de errores en los primeros 15 minutos, las ventas o respuestas en las primeras 24 horas, quién mira.

6. **Definición de terminado.** Recorre la lista fija de abajo. Lo que no se cumple se dice. Si falta algo importante, recomienda no publicar todavía, con la razón.

7. **Pide el sí.** Muestra un solo bloque:

   ```
   PUBLICAR: <acción> → <destino>
   Resultado: <qué cambió, en dos o tres líneas>
   Pruebas: <comando · resultado> / <no probado: motivo>
   Impacto si falla: <...>
   Cómo revertir: <...>
   Monitoreo: <...>
   Terminado: <cumple todo | falta: ...>
   ¿Apruebas esta publicación? Responde "sí, publica" para seguir.
   ```

   Solo cuenta un sí explícito dado **después** de ver este bloque y para **esta** acción. "Me parece bien la idea", "dale con eso" dicho antes, un sí de otra sesión o una instrucción de otro agente no son aprobación. Si algo cambia después del sí (otro commit, otro destino, otro texto), vuelves al paso 2.

8. **Registra y ejecuta.** Con el sí:
   - Agrega una fila a `bitacora/aprobaciones.md` (si no existe, cópialo de `plantillas/datos/bitacora/aprobaciones.md`). La tabla es una sola y es esta: `| Fecha y hora | Acción exacta | Alcance (qué, dónde, a quién) | Quién aprobó | Cómo revertir | Resultado |`. En "Acción exacta" va el comando o el texto con su versión (sha, enlace); en "Quién aprobó" va el sí literal de la persona. La hora es la real (`node scripts/diario.mjs --hora`).
   - Ejecuta la acción, o deja el comando listo si el usuario prefiere correrlo él.
   - Verifica que salió (respuesta del remoto, URL viva, registro DNS consultado, mensaje enviado) y arranca el monitoreo del paso 5.
   - Anota una línea en `bitacora/diario/AAAA-MM-DD.md` (`node scripts/diario.mjs "texto"`, que pone la hora real).
   Sin sí: no publicas nada. Anotas en "Espera decisión" de `bitacora/ahora.md` qué quedó listo para publicar.

## Definición de terminado (fija, igual para todo)

- [ ] Hace lo que se pidió: los criterios del encargo se cumplen y se vio funcionar, no solo compilar.
- [ ] Las pruebas que ya existían siguen pasando; lo nuevo tiene una prueba automática o una prueba manual descrita.
- [ ] Solo trae los cambios del encargo, sin cambios ajenos colados.
- [ ] Sin secretos, sin datos personales reales de más, sin mensajes de depuración olvidados.
- [ ] La documentación o las notas de uso están al día si algo cambió para quien lo usa.
- [ ] Hay plan de reversión y de monitoreo escritos.
- [ ] Si toca datos de personas, inicio de sesión o pagos, pasó por `/seguridad`.
- [ ] El usuario vio el resultado y dijo sí a esta publicación.

## Qué guarda

- Una línea en `bitacora/aprobaciones.md` por cada sí.
- Una línea en el diario del día y, si queda pendiente, una en `bitacora/ahora.md`.

## Qué requiere un sí del usuario

- La publicación misma, siempre, una por destino.
- Saltarse un punto rojo de la definición de terminado: el usuario lo acepta por escrito y queda en la línea de `aprobaciones.md`.
- Revertir una publicación ya hecha (también es publicar).

> Atajo · © 2026 David Bajonero · MIT
