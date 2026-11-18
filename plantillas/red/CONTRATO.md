# Contrato de `red.json`

Un archivo JSON en UTF-8. Con él, `node construir.mjs red.json` escribe `salida/index.html`.

```json
{
  "titulo": "La red de Camila",
  "persona": { "nombre": "Camila Rojas", "rol": "Diseñadora de marca" },
  "nodos": [
    { "id": "p1", "tipo": "prioridad", "nombre": "Conseguir 3 clientes", "frase": "Tres contratos firmados.", "peso": 6 },
    { "id": "portafolio", "tipo": "proyecto", "nombre": "Portafolio nuevo", "frase": "Seis casos con antes y después.",
      "url": "https://ejemplo.co", "ruta": "C:\\trabajo\\portafolio", "imagen": "img/portafolio.png", "peso": 9 }
  ],
  "enlaces": [ { "de": "portafolio", "a": "p1", "tipo": "sirve a" } ]
}
```

| Campo | Obligatorio | Qué es |
|---|---|---|
| `titulo` | no | Título grande de la página. Unas 4 palabras. |
| `persona.nombre`, `persona.rol` | sí | Quién va en el centro. El rol sale debajo del nombre. |
| `nodos[].id` | sí | Texto único, sin espacios. |
| `nodos[].tipo` | sí | `persona`, `prioridad`, `proyecto`, `skill`, `agente`, `decision` o `aprendizaje`. Otro valor frena la construcción. |
| `nodos[].nombre` | sí | Rótulo de la neurona. Hasta 4 palabras en proyectos y prioridades. |
| `nodos[].frase` | no | Una o dos frases para la tarjeta. |
| `nodos[].url` | no | Lo que abre el botón "Abrir". Solo `http://`, `https://` o `file://`. |
| `nodos[].ruta` | no | Archivo o carpeta local. Si no hay `url`, "Abrir" la usa como `file:///`. |
| `nodos[].imagen` | no | Ruta relativa al JSON (png, jpg, webp, svg). Se copia a `salida/img/`. Mejor 16:9. |
| `nodos[].peso` | no | De 1 a 10 (5 si falta). Más peso, neurona más grande. Desde 8 es proyecto estrella. |
| `enlaces[].de`, `enlaces[].a` | sí | Dos `id` que existan. Un enlace roto se ignora con aviso. |
| `enlaces[].tipo` | no | Verbo corto: "sirve a", "construyó", "usa". |
| `nota` | no | Una línea bajo el título. Si falta y la red es pequeña (10 neuronas o menos sin contar skills), sale una que explica qué se ve y cómo crece. Con `""` no sale nada. |
| `recorrido`, `paso` | no | Lista de `id` para la barra espaciadora (si falta: proyectos de mayor a menor peso) y segundos por parada (8 si falta). |

## Reglas para quien genera el archivo
1. La persona puede ir como un nodo de tipo `persona` o no ir. Si no va, se crea sola con el id `yo` y los enlaces pueden apuntar a `yo`.
2. Un nodo sin enlaces se conecta solo a la persona. No hace falta escribir ese enlace.
3. Enlaza cada proyecto con la prioridad a la que sirve y cada agente con lo que hizo: quedan dibujados cerca.
4. Las teclas 1 a 9 van a los 9 proyectos de mayor peso. Deja 3 o 4 estrellas, no todas.
5. Tamaño cómodo: 3 prioridades, 14 proyectos, 24 skills, 8 agentes, 4 decisiones y 4 aprendizajes. Los rótulos de skills solo se leen al filtrar o con el cursor: lo importante va en proyectos y prioridades.
6. Una `url` que apunta a este computador (`127.0.0.1` o `localhost`) es una demo local: la tarjeta revisa si su servidor está encendido y lo dice antes de abrir.
7. Una red pequeña (hasta 8 proyectos) se dibuja compacta y más grande; no hace falta rellenar con neuronas de adorno.
8. Nada de claves, cifras de plata ni datos de clientes: todo lo del JSON queda a la vista en el HTML y la página se proyecta.
