# Prompt Engineering aplicado al desarrollo

## Objetivo
Recopilar prompts útiles y explicar por qué funcionan bien.

Durante el desarrollo del proyecto TaskFlow se experimentó con diferentes técnicas de prompt engineering para mejorar la calidad de las respuestas generadas por la inteligencia artificial.

Estas técnicas incluyen:

 - definición de roles
 - ejemplos previos (few-shot prompting)
 - razonamiento paso a paso
 - restricciones en la respuesta

## Prompts utilizados
· Prompt 1 — Rol de desarrollador senior

Actúa como un desarrollador senior de JavaScript.
Revisa esta función y sugiere mejoras en rendimiento y legibilidad.

- Por qué funciona bien

Definir un rol hace que la IA genere respuestas más profesionales y centradas en buenas prácticas.

 · Prompt 2 — Generación de función

Genera una función JavaScript que permita filtrar tareas completadas en una lista de tareas.

- Por qué funciona

El prompt es claro y especifica exactamente qué se necesita.

· Prompt 3 — Refactorización

Refactoriza esta función manteniendo exactamente la misma funcionalidad pero mejorando su claridad.

- Por qué funciona

La restricción evita que la IA cambie el comportamiento del código.

· Prompt 4 — Documentación

Genera comentarios JSDoc para esta función.

- Por qué funciona

Indica el formato de documentación deseado.

· Prompt 5 — Razonamiento paso a paso

Explica paso a paso qué hace esta función antes de sugerir mejoras.

- Por qué funciona

Obliga a la IA a analizar el código antes de modificarlo.

· Prompt 6 — Restricción de lenguaje

Explica este código utilizando un lenguaje sencillo para estudiantes de programación.

- Por qué funciona

Controla la complejidad de la respuesta.

· Prompt 7 — Mejora de interfaz

Sugiere mejoras de diseño para que esta tabla sea más usable en dispositivos móviles.

· Prompt 8 — Detección de errores

Analiza este código y detecta posibles bugs o edge cases.

· Prompt 9 — Optimización

Optimiza este código para reducir su complejidad temporal.

· Prompt 10 — Generación de tests

Genera ejemplos de tests unitarios para esta función.