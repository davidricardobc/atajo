---
etiquetas: [ventas, precios, propuesta]
actualizado: 2026-10-06
---

# Guía de precios: cuánto cobrar por un sistema de IA o una automatización

Para quien vende servicios a pymes y se traba en la pregunta "no sé cuánto cobrar". La usa `/propuesta` para pasar de un diagnóstico a tres opciones con precio. También sirve para leerla antes de una reunión donde van a preguntar "¿y eso cuánto vale?".

Lo que dice esta guía tiene dos partes distintas:

- El método es estable. Sirve igual en 2026 que en 2029.
- Los rangos son una foto con fecha. Son referencia, no verdad. Cada cifra trae fuente y fecha; si tienen más de seis meses, verifícalas con `/aprender` antes de usarlas.

Lee primero [[diagnostico]]: sin diagnóstico no hay precio, hay adivinanza.

---

## 1. Cinco ideas que cambian cómo cobras

1. Cobras por la decisión que ayudas a tomar, no por las horas que te sientas. El cliente no compra un bot. Compra dejar de perder pedidos a las 9 de la noche. Si tú cobras por hora, el cliente paga más cuando tú eres más lento. Eso no tiene sentido para nadie.
2. El valor lo calculan los dos, en la reunión, con los números del cliente. Un valor que tú inventaste en tu casa no sirve para negociar. Un valor que el cliente dijo en voz alta ("se nos van unos 50 pedidos al mes") sí.
3. Instalación más mensualidad. La instalación paga la construcción y la puesta en marcha. La mensualidad paga que siga funcionando: monitoreo, ajustes, soporte, mejoras pequeñas. Separadas, con nombres distintos, siempre.
4. Tres opciones con alcances distintos. No la misma cosa a tres precios. Tres tamaños de problema resuelto. Así el cliente decide cuánto problema quiere resolver, no si te contrata o no.
5. Si tú no crees en tu precio, nadie lo hará. El precio se dice con la misma voz con la que dices la hora. Para eso sirve este método: para que llegues a la cifra con un camino que puedas explicar en dos minutos.

---

## 2. El método en siete pasos

### Paso 1. Mide el problema en horas y en plata

Con los datos del diagnóstico, llena esta cuenta. Marca cada dato como confirmado (lo dijo el cliente o lo viste), estimado (lo calculaste con un supuesto razonable) o pendiente (no lo tienes).

Tres fuentes de valor típicas:

- Tiempo de personas. `horas al mes × costo real por hora`. El costo real por hora no es el salario dividido entre las horas. En Colombia el empleador paga entre 48 % y 58 % más que el salario pactado en prestaciones, seguridad social y parafiscales (fuente: Buk y Aleluya, guías de costo laboral 2026). Regla rápida: `salario mensual × 1,5 ÷ 180 horas`. Con el salario mínimo de 2026 (COP 1.750.905, Decretos 1469 y 1470 de 2025) da unos COP 14.600 por hora.
- Ventas perdidas. `casos perdidos al mes × ticket promedio × margen de contribución`. Usa margen, nunca venta bruta. Una venta de COP 45.000 con 35 % de margen vale COP 15.750 para el dueño, no 45.000.
- Errores. `errores al mes × costo de cada error` (reproceso, devolución, cliente perdido).

Reglas:

- No cuentes dos veces. Si ya contaste las horas de la persona que anota pedidos, no sumes además "contratación evitada" de esa misma persona.
- Lo que no puedas sustentar va aparte, en una sección llamada "Escenario favorable". Se menciona, no se cobra.
- Sin cifras del cliente, el valor queda en "pendiente de validar" y la propuesta se entrega con esa marca.

### Paso 2. Calcula el valor conservador del primer año

```
Valor mensual ajustado = suma de (valor mensual de cada fuente × factor de confianza)
   factor de confianza: confirmado 1,0 · estimado 0,6 · supuesto 0,3

Meses efectivos = 12 − meses de implantación − 1 mes de adopción

Valor año 1 (V) = Valor mensual ajustado × meses efectivos
```

El factor de confianza es deliberadamente duro. Es mejor que el cliente descubra que ganó más de lo que le prometiste que lo contrario.

### Paso 3. Calcula tu piso

El piso es lo mínimo que puedes cobrar sin perder plata ni ganas.

```
Piso = (horas estimadas de trabajo × tu tarifa objetivo) × 1,2 + costos de terceros durante la entrega
```

- Tu tarifa objetivo ya incluye tu utilidad. Referencia para Latinoamérica en 2026: USD 30 a 50 por hora en nivel inicial, USD 50 a 90 en nivel medio (ver sección 3). Si estás empezando y necesitas casos, puedes bajar la tarifa, pero nunca el piso por debajo de tus costos.
- El 1,2 es la reserva: en automatización siempre aparece una integración que no se portó como prometía la documentación.
- Costos de terceros durante la entrega: números de prueba de WhatsApp, servidor de pruebas, tokens de modelos. Después del lanzamiento esos costos van a nombre del cliente (paso 5).

### Paso 4. Encuentra el corredor de precio

```
Corredor de instalación = entre el 10 % y el 20 % de V
```

Esta proporción viene de la práctica de consultoría por valor: el cliente debe sentir que recibe unas cinco a diez veces lo que paga (fuentes: Orb, "Value-based pricing formula", y Demand Curve, "Set a price, defend value", consultadas el 2026-10-06; Alan Weiss, "Value-Based Fees", sobre dejar de cobrar por tiempo).

Cuatro casos:

- El piso cae dentro del corredor: perfecto. Cotiza en la mitad superior del corredor si el cliente tiene urgencia o el riesgo es tuyo.
- El piso está por debajo del corredor: cotiza dentro del corredor, no en el piso. Cobrar el piso cuando el valor es alto es regalar trabajo y, peor, hace que el cliente desconfíe (sección 5).
- El piso está por encima del 20 % de V: reduce el alcance hasta que quepa, o parte el proyecto en módulos y empieza por el de más valor. Si ni así cabe, di "esto no es para ti todavía" y explica por qué. Eso vende más que forzar.
- No tienes V porque faltan datos: cotiza un diagnóstico pagado corto, o entrega la propuesta con "pendiente de validar" y una fecha para conseguir los datos.

Chequeo final: `V ÷ inversión total del año 1` (instalación más 11 mensualidades más terceros). Si da menos de 3, al cliente le va a costar decidir. Si da 5 o más, la decisión es fácil.

### Paso 5. Separa instalación, mensualidad y terceros

- Instalación (pago único, por hitos): construcción, integraciones, pruebas, capacitación, puesta en marcha.
- Mensualidad de mantenimiento: que siga funcionando como se acordó. Monitoreo, correcciones, ajustes pequeños de prompts o reglas, soporte por un canal y horario definidos, respaldos. Referencia: entre el 5 % y el 15 % de la instalación por mes; en el mercado de 2026 los planes gestionados en Colombia se mueven entre COP 390.000 y 1.350.000 al mes (sección 3). Si vendes un producto propio (un CRM tuyo, por ejemplo), la mensualidad incluye la licencia.
- Costos de terceros: API de WhatsApp (Meta), tokens de modelos, servidor, correo transaccional. Van a nombre del cliente y en sus cuentas. Tú los estimas con rango (bajo, esperado, alto) y pones un límite de gasto con aviso. Nunca los escondas dentro de tu mensualidad: si el consumo sube, te comes el margen.
- Nuevas funciones: fuera de la mensualidad. Se cotizan aparte cuando aparecen.

### Paso 6. Arma tres opciones con alcances distintos

| Opción | Qué resuelve | Para quién |
|---|---|---|
| Arranque | El dolor principal, sin integraciones complejas. Lo mínimo que ya se nota. | Clientes que dudan o con poco presupuesto. |
| Recomendada | El dolor principal más lo que lo hace sostenible (integración, excepciones, reportes). | La mayoría. Es la que recomiendas con razones del diagnóstico. |
| Completa | Lo anterior más la fuente de valor del "escenario favorable", como piloto medible. | Clientes con urgencia y datos claros. |

Cada opción lleva: resultado medible, alcance, "no incluye", supuestos, instalación, mensualidad, terceros estimados, plazo y cómo se mide. La recomendación se escribe con una frase del cliente: "porque me dijiste que lo que más te duele es…".

### Paso 7. Hitos con aceptación objetiva y pago por hito

Un hito se acepta cuando algo se puede ver y probar, no cuando "está casi". Formato de cada hito:

- Artefacto: qué existe al terminar (un bot respondiendo en un número de prueba, un tablero con datos reales).
- Prueba: qué hace alguien del cliente, con qué entrada, y qué debe pasar (umbral: "responde en menos de 10 segundos en 20 de 20 mensajes de prueba").
- Aprobador: nombre de la persona del cliente que dice "sí".
- Pago: qué porcentaje de la instalación se cobra al aceptar.

Reparto típico: 30 % al aprobar el alcance y entregar accesos, 40 % al aceptar la demostración en ambiente de prueba, 30 % al aceptar en producción. El silencio no es aceptación: pon una fecha límite de revisión (5 días hábiles) tras la cual el hito se da por aceptado si no hay observaciones escritas.

---

## 3. Rangos de referencia con fecha (foto del 2026-10-06)

Conversión usada: TRM del 2 de octubre de 2026, COP 3.307,73 por dólar (fuente: dolarhoy.co). Redondeado a COP 3.300. Los rangos son lo que cobran otros, no lo que debes cobrar tú: tu precio sale del método de la sección 2 y se compara contra esto para ver si estás fuera de la cancha.

### Instalación por tipo de solución

| Solución | USD | COP aproximados | Fuente y fecha |
|---|---|---|---|
| Bot de WhatsApp con respuestas fijas | 300 a 800 (pago único) | 1,0 a 2,6 millones | Consolidación Digital (Colombia), abr-2026 |
| Bot de WhatsApp con IA conversacional | 1.500 a 4.000 | 5 a 13 millones | Consolidación Digital (Colombia), abr-2026 |
| Agente de IA para WhatsApp Business | 2.000 a 3.500 | 6,6 a 11,5 millones | Bithaus (Colombia), may-2026 |
| Agente autónomo con integraciones (CRM, pagos) | 5.000 a 15.000 o más | 16 a 50 millones | Consolidación Digital (Colombia), abr-2026 |
| Asistente interno sobre documentos | 2.800 a 5.000 | 9 a 16,5 millones | Bithaus (Colombia), may-2026 |
| Automatización de documentos con OCR | 3.500 a 8.000 | 11,5 a 26 millones | Bithaus (Colombia), may-2026 |
| Suite de 3 a 5 procesos administrativos | 10.000 a 18.000 | 33 a 60 millones | Bithaus (Colombia), may-2026 |
| Chatbot de WhatsApp con IA (México) | 3.000 a 15.000 | 10 a 50 millones | Duotach (México), abr-2026 |
| Agente de ventas con IA (México) | 4.000 a 15.000 | 13 a 50 millones | Duotach (México), abr-2026 |
| Un caso de uso de IA en una pyme (Perú) | 3.000 a 15.000 soles (unos 800 a 4.000 USD) | 2,6 a 13 millones | kom.pe (Perú), 2026 |
| Setup de agencia de automatización, pyme (EE. UU.) | 1.500 a 5.000 | 5 a 16,5 millones | Taskip, ago-2026 |
| Setup de chatbot con IA (EE. UU.) | 2.000 a 5.000 | 6,6 a 16,5 millones | HummingAgent, 2026 |
| Primer agente de IA (España) | 3.000 a 15.000 € | 11 a 55 millones | Tenea, 2026 |

### Mensualidades

| Concepto | Rango | Fuente y fecha |
|---|---|---|
| Agente de IA gestionado en WhatsApp, Colombia | COP 390.000 a 1.350.000 al mes; setup COP 420.000 a 1.400.000 | Ventiva.ia, actualizado 5-oct-2026 |
| Planes de chatbot con IA por conversaciones, Colombia | COP 399.000 a 1.590.000 al mes; setup COP 500.000 a 2.500.000 | Botiffy, 2026 |
| Plataformas con IA e integración CRM o ERP, Colombia | COP 700.000 a 1.500.000 al mes | Botiffy, 2026 |
| Mantenimiento de chatbot o agente, México | USD 100 a 750 al mes según tipo | Duotach, abr-2026 |
| Retainer de consultoría técnica, México | MXN 14.000 a 40.000 al mes (unos USD 750 a 2.150) | Duotach, abr-2026 |
| Retainer de agencia para pyme, EE. UU. | USD 500 a 1.500 al mes | Taskip, ago-2026 |
| Gestión mensual de chatbot, EE. UU. | USD 500 a 1.500 al mes | HummingAgent, 2026 |
| Mantenimiento de automatizaciones, España | 300 a 2.000 € al mes | IA sin código, 2026 |

### Costos de terceros que paga el cliente

| Concepto | Rango | Fuente y fecha |
|---|---|---|
| API de WhatsApp (Meta), Colombia | marketing USD 0,0125 por mensaje de plantilla (unos COP 46); utilidad o autenticación USD 0,0008 (unos COP 3); respuestas dentro de las 24 horas sin costo | Guías colombianas (Dinolabs, Botiffy), tarifas desde jul-2026. Confirma en la página oficial de Meta |
| Modelos de IA para un bot de WhatsApp de pyme | USD 20 a 80 al mes | Bithaus, may-2026 |
| Modelos de IA con mil interacciones diarias | USD 250 a 400 al mes | kom.pe, 2026 |
| Servidor en la nube para un bot | USD 10 a 30 al mes | Bithaus, may-2026 |

### Tarifas por hora (para calcular tu piso)

| Perfil | USD por hora | Fuente y fecha |
|---|---|---|
| Freelancer de automatización empezando (n8n, Make, Zapier) | 15 a 30 | Vacantes Remotas, 2026 |
| Automatización con IA, nivel inicial, Latinoamérica | 30 a 50 | Vacantes Remotas, 2026 |
| Automatización con IA, nivel medio (agentes, integraciones), Latinoamérica | 50 a 90 | Vacantes Remotas, 2026 |
| Desarrollador de integración de IA en plataformas freelance | 30 a 60; más de 100 en proyectos empresariales | Quartz en español, 2026 |
| Por flujo de n8n o Make, pago único | 150 a 800 | Trabajo Freelance (Argentina), 2026 |

### Datos de Colombia para el cálculo de valor

| Dato | Valor | Fuente y fecha |
|---|---|---|
| Salario mínimo mensual 2026 | COP 1.750.905 | Decretos 1469 y 1470 del 29-dic-2025 |
| Auxilio de transporte 2026 | COP 249.095 | Mismos decretos |
| Costo adicional para el empleador | 48 % a 58 % sobre el salario pactado | Buk y Aleluya, guías 2026 |
| Costo real de un empleado con salario mínimo | cerca de COP 2,7 millones al mes | Aleluya, 2026 |
| Salario promedio de recepcionista | COP 1.735.545 al mes | Magneto, 2026 |
| Horas al mes de un empleado de tiempo completo | unas 180 (jornada de 42 horas desde jul-2026, Ley 2101 de 2021) | Sin verificar en esta sesión |

---

## 4. Ejemplos trabajados

### Ejemplo A. Restaurante que quiere "un CRM" (caso corrido con `/diagnostico` y `/propuesta`)

Cliente ficticio: "Donde Chava", restaurante de una sede en Bogotá, almuerzos y domicilios. El dueño escribe: "necesito un CRM porque no sé quiénes son mis clientes".

Diagnóstico (`/diagnostico`, una pregunta a la vez; lo que pide frente a lo que necesita):

- Pide: un CRM.
- Necesita (confirmado en la conversación): dejar de perder pedidos por WhatsApp cuando las dos personas de caja están ocupadas, y saber quién repite para hacerlo volver.
- Proceso actual: dos personas contestan WhatsApp y anotan pedidos en un cuaderno; cada una gasta unas 3 horas al día en eso, 26 días al mes. Confirmado.
- Volumen: unos 250 pedidos a la semana por WhatsApp, ticket promedio COP 45.000, margen de contribución 35 %. Confirmado por el dueño, sin extracto.
- Pedidos perdidos: "como el 5 %" por no contestar a tiempo. Estimado.
- Errores: unos 3 pedidos mal tomados a la semana, cada uno cuesta unos COP 30.000 entre reposición y domicilio. Estimado.
- Quién decide: el dueño. Urgencia: temporada de diciembre. Ya intentaron un bot de menú fijo y lo apagaron porque los clientes se enredaban.
- Mapa de capacidades (porque el pedido trae varias cosas): módulo 1, base de clientes y pedidos; módulo 2, toma de pedidos por WhatsApp con humano para excepciones (depende del módulo 1); módulo 3, campañas de recompra (depende de 1 y de tres meses de datos). Orden: 1, 2, 3.
- Veredicto: sí hay valor. Decisiones que tomará el cliente: cuánto automatizar la toma de pedidos, si cambia el número de WhatsApp a la API oficial, quién revisa las excepciones.

Paso 1, medir:

- Tiempo: 6 horas al día × 26 días = 156 horas al mes. Costo por hora = 1.750.905 × 1,5 ÷ 180 = COP 14.590. Costo mensual = COP 2.276.000. Se recupera el 60 % con el módulo 2 (el humano sigue en las excepciones). Valor mensual bruto: COP 1.366.000. Confianza: la cifra de horas es confirmada pero el 60 % es estimado, factor 0,6 → COP 820.000.
- Ventas perdidas: 250 × 4,3 = 1.080 pedidos al mes; 5 % = 54 pedidos × 45.000 × 35 % = COP 850.000. Estimado, factor 0,6 → COP 510.000.
- Errores: 13 al mes × 30.000 = COP 390.000. Estimado, factor 0,6 → COP 234.000.
- Escenario favorable (no se cobra): recompra por campañas. Se mide en la opción Completa como piloto.

Paso 2, valor del año 1: valor mensual ajustado COP 1.564.000. Meses efectivos: 12 − 1 de implantación − 1 de adopción = 10. V = COP 15,6 millones (unos USD 4.700).

Paso 3, piso. El vendedor ya tiene un CRM propio, así que es configuración, no construcción: 16 horas de configuración e integración de WhatsApp, 6 horas de pruebas y capacitación. 22 horas × COP 100.000 (USD 30) × 1,2 = COP 2.640.000, más COP 150.000 de número y servidor de prueba. Piso: COP 2,8 millones.

Paso 4, corredor: 10 % a 20 % de V = COP 1,56 a 3,12 millones. El piso cae en la mitad superior. Instalación de la opción Recomendada: COP 3,0 millones. Chequeo: inversión del año 1 = 3,0 + 11 × 0,35 = COP 6,85 millones; V ÷ inversión = 2,3. Es bajo. Se dice así al cliente: "el primer año se paga más de dos veces; a partir del segundo, el sistema sale casi gratis frente a lo que recupera". Si el dueño confirma el extracto de ventas y los pedidos perdidos resultan ser el 8 %, V sube a unos 20 millones y la cuenta mejora. Por eso la propuesta pide ese dato antes de firmar.

Pasos 5 y 6, las tres opciones:

| | Arranque | Recomendada | Completa |
|---|---|---|---|
| Qué resuelve | Base de clientes y pedidos (módulo 1), registro rápido desde WhatsApp Web, sin bot | Módulos 1 y 2: el bot toma pedidos y reservas y los registra; una persona atiende excepciones | Módulos 1, 2 y 3: lo anterior más campañas de recompra y reporte semanal, como piloto de 90 días |
| No incluye | Bot, API oficial de Meta, campañas | Campañas, pagos en línea, más de una sede | Pagos en línea, más de una sede |
| Instalación | COP 1,8 millones | COP 3,0 millones | COP 4,5 millones |
| Mensualidad (licencia del CRM más mantenimiento) | COP 200.000 | COP 350.000 | COP 500.000 |
| Terceros estimados al mes (a nombre del cliente) | COP 0 | COP 60.000 a 150.000 (Meta y modelo) | COP 100.000 a 250.000 |
| Plazo | 1 semana | 3 semanas | 5 semanas |
| Cómo se mide | pedidos registrados al día | pedidos tomados por el bot sin intervención; tiempo de respuesta; pedidos perdidos a los 30 y 90 días | lo anterior más tasa de recompra a 90 días |

Recomendación: la del medio, "porque lo que más te duele son los pedidos que se pierden cuando la caja está llena, y eso solo lo arregla el módulo 2".

Paso 7, hitos de la Recomendada: 30 % (COP 900.000) al aprobar alcance y entregar accesos de WhatsApp; 40 % (COP 1,2 millones) cuando el bot tome 20 de 20 pedidos de prueba y queden en el CRM, aprobado por el dueño; 30 % (COP 900.000) tras una semana en producción con menos de 5 % de pedidos escalados por error.

Revisión adversarial (subagente nuevo, solo con el diagnóstico y el borrador): señaló que la mensualidad no decía quién paga si Meta cambia tarifas, que faltaba "no incluye: cambios de menú más de una vez al mes" y que el 60 % de recuperación de horas era optimista para el primer mes. Se agregó una cláusula de terceros, el "no incluye" y una nota de que el 60 % se mide a los 60 días. Versión 2 del borrador.

### Ejemplo B. Firma de contadores que quiere "cinco agentes de IA"

Cliente ficticio: firma de cuatro contadores, dos socios y dos auxiliares. El socio escribe: "queremos cinco agentes de IA".

Diagnóstico corto:

- Pide: cinco agentes.
- Necesita (confirmado): no perder consultas que entran por WhatsApp fuera de horario y dejar de gastar tiempo de los auxiliares en documentos repetidos (certificados, cartas de cobro, informes mensuales tipo).
- Volumen: unas 20 consultas nuevas al mes fuera de horario; el socio cree que se pierde el 30 % porque se responde al día siguiente. Convierte 1 de cada 4. Valor promedio del primer año de un cliente nuevo COP 4 millones, margen 50 %. Todo estimado.
- Tiempo: cada auxiliar gasta unas 8 horas a la semana en documentos repetidos. Costo con cargas de un auxiliar: COP 60.000 la hora. Confirmado por el socio.
- Mapa de capacidades: módulo 1, recepción y clasificación de consultas con agenda; módulo 2, redacción asistida de documentos recurrentes a partir de plantillas y datos del cliente (depende de tener las plantillas limpias); módulo 3, alertas de vencimientos de cada cliente (depende de una base de clientes con fechas que hoy no existe). Los otros dos "agentes" que pidió no tienen un dolor detrás: se anotan como ideas, sin precio.
- Punto de seguridad: datos personales y financieros de terceros. Antes de firmar, pasa por `/seguridad` con la Ley 1581.

Valor del año 1:

- Consultas: 20 × 30 % = 6 perdidas × 25 % = 1,5 casos × 4 millones × 50 % = COP 3 millones al mes. Estimado, factor 0,6 → COP 1,8 millones.
- Tiempo: 16 horas a la semana × 4,3 = 69 horas × 60.000 = COP 4,1 millones; se recupera el 50 % → COP 2,07 millones. Estimado, factor 0,6 → COP 1,24 millones.
- Valor mensual ajustado: COP 3,04 millones. Meses efectivos: 9 (implantación de 2 meses). V = COP 27,4 millones (unos USD 8.300).

Corredor: COP 2,7 a 5,5 millones. Piso de los módulos 1 y 2: 36 horas × 100.000 × 1,2 = COP 4,3 millones. Cabe, con utilidad justa.

Opciones: Arranque (módulo 1) COP 3,2 millones más COP 400.000 al mes; Recomendada (módulos 1 y 2) COP 4,8 millones más COP 550.000 al mes; Completa (1, 2 y 3) COP 7,5 millones más COP 800.000 al mes, con el módulo 3 como fase separada que arranca cuando exista la base de clientes con fechas. Los cinco agentes no caben en el valor del primer año y se dice con esas palabras: "hoy el valor está en dos cosas; las otras tres las vemos cuando estas dos lleven tres meses andando".

---

## 5. Cuándo no cobrar barato (y qué pasa si lo haces)

- Cuando el valor es alto y tu piso es bajo. Si cobras el piso, el cliente piensa "¿qué me está dejando por fuera?". Los clientes que menos pagan son los que más cuestionan cada decisión y te tratan como proveedor, no como asesor (fuentes: MBO Partners, "3 reasons you're undercharging"; 6 Figure Creative, 2026).
- Cuando el descuento sale de tu margen. Si bajas el precio 20 % y tus costos siguen iguales, puedes perder la mitad de tu utilidad. Mejor baja alcance que precio.
- Cuando el cliente pide descuento sin dar nada a cambio. Intercambia: menos alcance, pago por adelantado, un caso de estudio con su nombre, una referencia. Nunca el mismo trabajo por menos.
- Cuando estás empezando, sí puedes cobrar menos, pero con regla: precio de lanzamiento explícito ("este es un precio de primeros clientes, vence el día X"), a cambio de un testimonio y datos para el caso de estudio. Así el precio bajo es una decisión, no una inseguridad.
- Cuando tienes miedo. El miedo se nota y el cliente lo lee como duda sobre el resultado. Si el método te dio una cifra, dila y cierra la boca. La venta empieza ahí.

---

## 6. Errores comunes

1. Cobrar por hora. El cliente paga tu lentitud y tú castigas tu propia eficiencia.
2. Inflar el valor para justificar el precio. Se descubre a los 90 días y pierdes el cliente y la referencia.
3. Una sola opción. El cliente decide sí o no, en vez de cuánto.
4. Tres opciones iguales con precios distintos. Huele a truco.
5. Esconder los costos de terceros en tu mensualidad. El día que Meta o el modelo suban, pagas tú.
6. Hitos sin prueba objetiva. "Está listo" y "no me gusta" se vuelven una pelea.
7. Anticipo por firma sin hito. Mejor 30 % al aprobar el alcance y entregar accesos: es trabajo real.
8. Vender nuevas funciones dentro del mantenimiento. La mensualidad se come en una semana.
9. Cotizar sin diagnóstico. Toda cifra sin fuente es una adivinanza con membrete.
10. Prometer "ahorro" en lugar de "capacidad recuperada". Si el restaurante no despide a nadie, no ahorra plata; recupera horas para vender más. Dilo así.
11. Copiar los rangos de esta guía como si fueran tu precio. Son la cancha, no la jugada.
12. Olvidar los datos personales. Un bot que guarda nombres y teléfonos tiene obligaciones (ver [[ley-1581]]); cotiza el tiempo de hacerlo bien.

---

## 7. Cómo decir el precio

- Primero el valor en palabras del cliente: "me dijiste que se pierden unos 50 pedidos al mes".
- Después el resultado medible: "el sistema toma los pedidos aunque la caja esté llena, y a los 30 días medimos cuántos se perdieron".
- Después las tres opciones, en una tabla, de la más pequeña a la más grande.
- Después la recomendación con su razón.
- Después el precio de la recomendada, con instalación y mensualidad separadas. Y silencio.
- Si pide descuento: "¿qué quitamos?" o "¿qué me das a cambio?". Nunca "déjame ver qué puedo hacer".
- Si dice que es caro: "comparado con qué". Casi siempre lo compara con el bot gratis que apagó, no con los pedidos que pierde.
- Si no hay valor suficiente: "esto no es para ti todavía, y te digo por qué". Esa frase trae clientes de vuelta a los seis meses.

---

## 8. Fuentes consultadas (2026-10-06)

Colombia y Latinoamérica:

- Bithaus (Colombia), "Cuánto cuesta automatizar un proceso con IA en 2026", 2-may-2026: https://www.bithaus.co/blog/cuanto-cuesta-automatizar-con-ia-2026/
- Ventiva.ia (Colombia), "Cuánto cuesta un chatbot para WhatsApp en Colombia en 2026", actualizado 5-oct-2026: https://ventivaia.com/cuanto-cuesta-chatbot-whatsapp-colombia/
- Consolidación Digital (Colombia), "Chatbot WhatsApp Colombia: precios reales 2026", 5-abr-2026: https://www.consolidaciondigital.com/blog/inteligencia-artificial/cuanto-cuesta-chatbot-whatsapp-colombia
- Botiffy (Colombia), "Cuánto cuesta un chatbot de WhatsApp en Colombia (2026)": https://botiffy.com/blog-costo-chatbot-whatsapp-colombia.html
- Dinolabs (Colombia), "WhatsApp Business API en Colombia: precios": https://www.dinolabs.dev/blog/whatsapp-business-api-colombia-precios-como-obtenerla
- Duotach (México), "Cuánto cuesta automatizar con IA en México 2026", 12-abr-2026: https://duotach.com/blog/cuanto-cuesta-automatizar-ia-mexico
- kom.pe (Perú), "Cuánto cuesta implementar IA en una pyme peruana", 2026: https://kom.pe/cuanto-cuesta-implementar-ia-en-una-pyme-peruana/
- Vacantes Remotas, "Cuánto cobrar como freelancer en Latinoamérica en 2026": https://www.vacantesremotas.com/blog/cuanto-cobrar-como-freelancer-en-latinoamerica-en-2026
- Trabajo Freelance (Argentina), "Automatización de procesos con IA: freelancers y cuánto cuesta": https://www.trabajofreelance.com.ar/automatizacion-de-procesos-con-ia-freelancers-que-pueden-hacerlo-y-cuanto-cuesta/
- Quartz en español, "10 habilidades freelance en demanda y sus pagos en 2026": https://es.qz.com/habilidades-freelance-ms-demandadas-remuneracin
- Salario mínimo 2026 (Decretos 1469 y 1470 de 2025): https://consultorsalud.com/aumento-del-salario-minimo-en-colombia-2026/
- Costo real de un empleado en Colombia 2026: https://www.buk.co/blog/costo-real-de-un-empleado-en-colombia-2026 y https://aleluya.com/blog/nomina/costo-de-un-empleado-en-colombia-2026/
- Salario de recepcionista en Colombia: https://www.magneto365.com/co/preguntas-frecuentes/recepcionista/cual-es-salario-de-un-recepcionista-en-colombia
- TRM del 2-oct-2026: https://www.dolarhoy.co/2026-10-02

Estados Unidos y Europa (para comparar):

- Taskip, "AI Automation Agency Pricing: $500–$20K+, 6 Models (2026)", actualizado 18-ago-2026: https://taskip.net/ai-automation-agency-pricing/
- HummingAgent, "AI Automation Pricing 2026": https://hummingagent.ai/blog/ai-automation-cost-pricing-guide-2026
- Tenea (España), "Cuánto cuesta la IA agéntica. Precios 2026": https://blog.tenea.com/cuanto-cuesta-ia-agentica/
- IA sin código (España), "Agencia de automatización con IA: servicios, tarifas": https://iasincodigo.com/agencia-automatizacion-ia/

Método de precio por valor:

- Orb, "Value-based pricing formula explained": https://www.withorb.com/blog/value-based-pricing-formula
- Demand Curve, "Set a price, defend value": https://www.demandcurve.com/lessons/set-a-price-defend-value
- Resumen de "Value-Based Fees" de Alan Weiss: https://scottburleson.substack.com/p/book-summary-value-based-fees
- MBO Partners, "3 most common reasons you're undercharging": https://www.mbopartners.com/?p=26279

Notas relacionadas: [[diagnostico]], [[aprendizajes]], [[ley-1581]].

> Atajo · © 2026 David Bajonero · MIT
