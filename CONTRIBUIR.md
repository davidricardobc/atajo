# Contribuir y mantener Atajo

Para quien mantiene el kit o quiere proponer cambios. Si solo usas Atajo, no necesitas esto.

## Qué es kit y qué es dato

- Kit (rastreado en git): `.claude/`, `.agents/`, `scripts/`, `plantillas/`, `guias/`, `CLAUDE.md`, `AGENTS.md`, `kit.json`, `README.md`, `LEEME.md`, `CREDITOS.md`, `CONTRIBUIR.md`, `LICENSE`, `.claude-plugin/`.
- Datos de la persona (ignorados por git): `perfil/`, `bitacora/`, `decisiones/`, `entrevistas/`, `revisiones/`, `conocimiento/`, `proyectos/`, `clientes/`, `archivo/`, `conexiones.md`, `kit.local.json`. Nacen de `plantillas/datos/` la primera vez que arranca una sesión (hook `SessionStart`), o con `/arranque` y `/retomar` sin Node.
- Creaciones de la persona (ignoradas por git): archivos con prefijo `mi-` en `.claude/skills/`, `.agents/skills/`, `scripts/`, `scripts/pruebas/` y `plantillas/`. Ningún archivo del kit puede empezar por `mi-`.
- Regla: un cambio del kit nunca debe exigir tocar un archivo de datos. Si una plantilla de datos cambia, los usuarios que ya tienen el archivo no lo reciben; documenta el cambio en el README (sección de actualización) y, si hace falta, agrega una migración a `/retomar`.

## Antes de proponer un cambio

1. `node --test "scripts/pruebas/*.test.mjs"` en verde. Cada script de `scripts/` tiene su prueba en `scripts/pruebas/<script>.test.mjs`.
2. `node scripts/sincronizar-skills.mjs` después de tocar una skill o `CLAUDE.md` (regenera `.agents/skills/` y `AGENTS.md`).
3. `node scripts/verificar.mjs` y `claude plugin validate . --strict` en verde. GitHub Actions corre las pruebas, la verificación y una instalación limpia en Ubuntu, macOS y Windows (`.github/workflows/verificar.yml`).
4. Sin rayas largas, sin términos ajenos (ver abajo), español de tú, frases cortas.
5. Nada de datos personales ni secretos en el repositorio: `git ls-files` no debe listar nada de la lista de datos.

## Chequeo de originalidad (solo mantenedor)

Atajo se escribió desde cero. Para comprobar que no se coló texto de otros kits, `scripts/originalidad.mjs` compara cada `.md` del kit contra un corpus de referencia con tejas de 8 palabras y busca términos prohibidos. El corpus no se distribuye con el kit, así que este chequeo no corre en `/auditoria` (allí se marca "no aplica").

```bash
node scripts/originalidad.mjs --corpus <carpeta-del-corpus> --todo --sin-informe
```

Sale con código 0 en verde, 1 si hay una racha de 12 palabras o más compartidas, más de 1 % de tejas compartidas en un archivo largo, o un término prohibido fuera de `CREDITOS.md` o `README.md`. Sin `--sin-informe`, deja `revisiones/originalidad-AAAA-MM-DD.md`. No detecta traducciones: para eso, una revisión por un subagente sin contexto previo.

## Versionado

`kit.json` lleva la versión del kit; `.claude-plugin/marketplace.json` repite la versión en cada plugin. Súbelas juntas. Los datos de la persona no tienen versión: son suyos.

© 2026 David Bajonero · MIT
