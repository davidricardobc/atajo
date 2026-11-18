---
name: red
description: Usa esta skill cuando la persona diga "muéstrame mi red", "abre mi red", "quiero ver mi sistema", "muéstrales lo que hemos construido" o termine /arranque. Lee sus archivos (perfil, prioridades, proyectos, decisiones, bitácora y skills), arma su red como neuronas conectadas en una página local y la abre en el navegador.
---

# Red

Convierte lo que Atajo sabe de la persona en una imagen: ella al centro, sus 3 prioridades cerca, sus proyectos y frentes abiertos alrededor y, en las esquinas, sus skills, decisiones y aprendizajes. Todo sale de los archivos; nada se inventa. La página es un solo HTML local, sin internet.

Raíz del kit: la carpeta con `kit.json` hacia arriba. Si no existe, avisa que falta el kit.

## Pasos

1. Corre `node scripts/red.mjs` (un solo comando, sin `cd` ni `&&`). Escribe `red/red.json` y `red/index.html` y abre la página.
2. Responde en tres líneas cortas:
   - Qué está viendo: "Tú al centro, tus prioridades cerca y tus proyectos alrededor. Son N neuronas" (el número lo dice el script).
   - Una cosa que se ve en ella, por ejemplo la prioridad con más proyectos o la que no tiene ninguno.
   - Cómo crece: "Cada proyecto que conectes con `/conectar`, cada decisión y cada aprendizaje que guardes suma una neurona. Vuelve a escribir `/red` y aparece."
3. Una red recién instalada es pequeña y eso está bien: la página la dibuja compacta y trae esa misma explicación bajo el título. No la rellenes con nada inventado.
4. Si el perfil está sin llenar, la red sale casi vacía: dilo y ofrece `/arranque` (4 preguntas).
5. Si la persona va a mostrarla en público: Espacio hace el recorrido y cierra en la red completa, `P` agranda la letra para proyector y `?` muestra las teclas.
6. Sin Node: explica que la red necesita Node y deja el enlace https://nodejs.org. No la armes a mano.

## Qué guarda y dónde

- `red/red.json` y `red/index.html`. La carpeta `red/` está fuera de git: es de la persona, como `perfil/` y `bitacora/`.

## Qué requiere un sí

- Nada para armarla y abrirla en el computador. Compartir la página o publicarla pasa por `/publicar`: lleva prioridades, proyectos y decisiones.

> Atajo · © 2026 David Bajonero · MIT
