# Carpeta `clientes/`

Aquí vive todo lo que el sistema sabe de cada cliente o prospecto. Una carpeta por cliente, con el nombre en minúsculas y sin acentos ni espacios (`donde-chava`, `firma-perez`).

## Qué va en cada carpeta

| Archivo | Quién lo escribe | Qué contiene |
|---|---|---|
| `diagnostico.md` | `/diagnostico` | Lo que pide y lo que necesita, datos confirmados y pendientes, mapa de capacidades, veredicto, decisiones del cliente |
| `propuesta-v1.md`, `propuesta-v2.md`… | `/propuesta` | Cada versión del borrador de propuesta. Nunca se sobrescribe una versión; se crea la siguiente |
| `seguridad.md` | `/seguridad` | Lista de verificación de datos personales para la solución de ese cliente |
| `notas.md` | tú o el agente | Transcripciones resumidas, acuerdos, lo que dijo en cada reunión, con fecha |

## Reglas

- Datos de terceros, con cuidado. Nombres, teléfonos y correos de los clientes de tu cliente no van aquí; se anonimizan ("la encargada de caja", "cliente A"). Lo que sí va es lo que necesitas para vender y entregar.
- Fuera de git por defecto. Esta carpeta contiene información de otras empresas. El `.gitignore` del kit ya la excluye (`clientes/*`, salvo este LEEME), igual que el resto de tus datos (`perfil/`, `bitacora/`, `decisiones/`...). Si quieres versionarla, quita esas líneas a conciencia, anota el sí en `bitacora/aprobaciones.md` y pasa `/seguridad` antes de subirla a cualquier repositorio remoto.
- Respaldo: como no está en git, respáldala tú (copia de la carpeta o repositorio privado propio). Ver "Tus datos y cómo respaldarlos" en el README.
- Todo es borrador hasta que tú lo apruebes. Ninguna skill envía nada al cliente. Las propuestas y los mensajes de seguimiento llevan la leyenda "requiere revisión y aprobación" hasta que los revises.
- Cifras con estado. Cada número dice si es confirmado, estimado o pendiente. Si una cifra no tiene fuente, no entra a una propuesta como firme.
- Enlaces. Los archivos se enlazan entre sí con `[[ ]]` y apuntan a las guías `[[precios]]`, `[[diagnostico]]` y `[[ley-1581]]`. El índice de `conocimiento/indice.md` no recorre esta carpeta.

## Flujo típico

1. Reunión o chat con el prospecto. Antes, `/diagnostico` arma la guía de preguntas desde `guias/diagnostico.md`.
2. Después, `/diagnostico` convierte las notas en `diagnostico.md` y da un veredicto.
3. Si hay valor, `/propuesta` produce `propuesta-v1.md` con tres opciones, usando `guias/precios.md`, y la pasa por una revisión adversarial.
4. Tú revisas, ajustas, apruebas. Si la solución trata datos personales, `/seguridad` deja `seguridad.md`.
5. Lo que el cliente decida va a `notas.md` y, si es una decisión tuya, a `decisiones/registro.md`.

Esta carpeta se crea vacía. Si no tienes clientes, déjala así; el sistema no la menciona hasta que la necesites.

> Atajo · © 2026 David Bajonero · MIT
