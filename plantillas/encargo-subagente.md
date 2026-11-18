# Encargo para subagente

Copia esta ficha, llénala y pégala completa en el prompt del subagente o de Codex. El subagente no ve tu conversación: todo lo que necesita va aquí. Sin secretos.

## Objetivo

- En una frase:
- Sirve a la prioridad: (1, 2 o 3 de `perfil/prioridades.md`, o "excepción: emergencia")

## Contexto confirmado

- Hechos (no suposiciones):
- Rutas absolutas de los archivos que debe leer:
- Decisiones ya tomadas que debe respetar:

## Alcance

- Archivos o carpeta que puede crear o editar:
- Archivos prohibidos (de otros encargos, generados, de clientes):
- Otros agentes trabajando al mismo tiempo y sobre qué:

## Criterio de terminado

- Debe existir:
- Se verifica con (comando, prueba, lectura):

## Lo que no puede hacer

- Publicar (push, deploy, preview, DNS), pagar, borrar, leer o mostrar secretos (`.env`, `*.pem`, `credentials*`), escribir a terceros, instalar paquetes globales, hacer commits salvo que se diga lo contrario.

## Informe de vuelta (máximo 20 líneas)

- Qué cambió y dónde (rutas absolutas).
- Cómo se probó (comando y resultado).
- Qué quedó pendiente o supuesto.
- Tokens aproximados.

## Modelo y nivel sugeridos

- Nivel de dificultad (rutina, medio, difícil) y modelo según `guias/orquestacion.md`:

Hecho con Atajo · github.com/davidricardobc/atajo
