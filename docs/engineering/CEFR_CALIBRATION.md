# CEFR Pillar Thresholds — Calibration Document

> Base académica para el sistema de clasificación de nivel en MasteryTalk PRO.
> Este documento define los umbrales mínimos por pilar que un usuario debe alcanzar
> consistentemente para ser clasificado en cada nivel CEFR.

---

## Referencias académicas

- **Council of Europe (2020).** *Common European Framework of Reference for Languages:
  Learning, teaching, assessment — Companion Volume.*
  Council of Europe Publishing, Strasbourg.
  [coe.int/en/web/common-european-framework-reference-languages](https://www.coe.int/en/web/common-european-framework-reference-languages)

- **Cambridge Assessment English (2011).** *Cambridge Business English Certificate (BEC)
  — Handbook for Teachers.*
  Cambridge University Press.

- **ETS (2012).** *TOEIC Speaking and Writing — Score Descriptors.*
  Educational Testing Service.

---

## Contexto de aplicación

MasteryTalk PRO evalúa comunicación profesional en inglés en escenarios de negocios
(entrevistas, reuniones, ventas, presentaciones) para profesionales de nearshoring en
Latinoamérica. Los umbrales aquí definidos adaptan los descriptores del Companion Volume
2020 — específicamente las escalas de **Spoken Interaction** y **Spoken Production** —
al contexto de comunicación remota con equipos de EE. UU.

Los 6 pilares evaluados son: **Vocabulary**, **Grammar**, **Fluency**, **Pronunciation**,
**Professional Tone** y **Persuasion**. Cada uno se puntúa en una escala de 0–100
por el modelo de análisis (Gemini / GPT-4o) tras cada sesión de práctica.

---

## Prompt de calibración

El siguiente prompt fue usado para derivar los umbrales con base en los descriptores CEFR:

```
You are calibrating a professional English communication scoring system for nearshoring
professionals (Mexico/Colombia, working with US teams). The system evaluates 6 pillars
on a 0–100 scale. Using the CEFR Companion Volume 2020 descriptors for spoken interaction
and production (B1, B2, C1), and the Cambridge BEC framework for professional business
English, define the minimum score threshold in each pillar that a learner must consistently
reach to be classified at that CEFR level.

Context: remote professional communication — meetings, presentations, sales, interviews.
Pillars: Vocabulary, Grammar, Fluency, Pronunciation, Professional Tone, Persuasion.
```

---

## Tabla de umbrales (escala 0–100)

| Pilar | A2 | B1 | B2 | C1 |
|---|---|---|---|---|
| Vocabulary | < 48 | 48 | 65 | 82 |
| Grammar | < 50 | 50 | 67 | 83 |
| Fluency | < 45 | 45 | 63 | 80 |
| Pronunciation | < 48 | 48 | 65 | 82 |
| Professional Tone | < 45 | 45 | 62 | 80 |
| Persuasion | < 40 | 40 | 60 | 78 |

> **Nota:** Los umbrales representan el mínimo consistente necesario, no el promedio
> esperado de un hablante en ese nivel. Un usuario en B2 puede tener sesiones puntuales
> por debajo del umbral; la clasificación se basa en el promedio ponderado de las
> últimas sesiones.

---

## Razonamiento por pilar

### Vocabulary
Los descriptores del Companion Volume definen B1 como "sufficient vocabulary to express
themselves with some circumlocutions on familiar topics" y B2 como "good range of
vocabulary for matters connected to their field." El umbral de B2 (65) coincide con el
punto donde el BEC Vantage considera al candidato funcional en contextos profesionales
sin gaps frecuentes. C1 (82) es el umbral donde el TOEIC Speaking Score 7 clasifica
al hablante como capaz de hablar "with ease and clarity."

### Grammar
B1 acepta "a repertoire of frequently used routines" con errores que no impiden la
comunicación. B2 marca el punto donde el Companion Volume describe "a good degree of
grammatical control" con errores que son "non-systematic." El salto a C1 (83) refleja
"consistently maintains a high degree of grammatical accuracy."

### Fluency
El pilar más diferencial entre B1 y B2. El Companion Volume describe B1 como capaz
de "keep going comprehensibly, even though pausing for grammatical and lexical planning
is very evident." B2 (63) es el umbral donde "interaction with native speakers is possible
without strain for either party" — crítico para profesionales trabajando con equipos de US.
C1 (80) refleja "express themselves fluently and spontaneously, almost effortlessly."

### Pronunciation
Los descriptores de inteligibilidad del Companion Volume definen tres puntos claros:
B1 = "clearly intelligible even if a foreign accent is sometimes evident" (48),
B2 = "clear, natural pronunciation and intonation" (65),
C1 = "can vary intonation and place sentence stress correctly to express finer shades
of meaning" (82). En contexto remoto (videollamadas, grabaciones), la inteligibilidad
es especialmente crítica, lo que justifica no bajar el umbral de B1.

### Professional Tone
Umbral de B2 (62) deliberadamente más bajo que Grammar o Vocabulary porque en el
contexto nearshoring, un registro profesional funcional es alcanzable con menos
vocabulario general — los profesionales conocen su campo técnico. Sin embargo, C1 (80)
es el nivel donde el ajuste de registro es genuinamente flexible: el hablante puede
calibrar formalidad, directness y cultural register según la audiencia específica
(C-suite vs. peers vs. cliente externo).

### Persuasion
La habilidad más sofisticada y la de umbral más bajo en todos los niveles. El Companion
Volume describe B1 como capaz de "express and respond to opinions on abstract/cultural
topics." B2 (60) corresponde a "can explain a viewpoint on a topical issue giving
advantages and disadvantages." C1 (78) es donde el hablante puede construir argumentos
con matices, manejar objeciones y usar técnicas de influencia de manera estructurada
— habilidad central en ventas y negociación ejecutiva.

---

## Lógica de clasificación

Un usuario alcanza un nivel CEFR cuando cumple el umbral en **al menos 4 de 6 pilares**
usando el promedio ponderado de sus últimas 3 sesiones (o todas las sesiones disponibles
si tiene menos de 3).

**Rationale:** Esta regla permite que una debilidad específica y trabajable (ej:
Pronunciation) no bloquee el nivel completo del usuario, pero impide que 2 pilares
fuertes y 4 débiles den una clasificación inflada. Es coherente con el enfoque del
Companion Volume, que describe el nivel CEFR como un perfil de competencias, no como
el dominio uniforme de todas las dimensiones.

**Pilar de desempate:** si el usuario cumple exactamente 3 de 6, el nivel se asigna
conservadoramente al nivel inferior hasta que cruce el umbral en un cuarto pilar.

---

## Disclaimer de producto

> Los niveles mostrados en MasteryTalk PRO son **aproximaciones** basadas en los
> descriptores del CEFR Companion Volume 2020 (Council of Europe) adaptados al contexto
> de comunicación profesional de negocios en inglés. No constituyen una certificación
> oficial de nivel CEFR. Para certificación oficial, consultar Cambridge Assessment
> English, TOEIC o IELTS.

---

*v1.0 — 2026-05-01*
*Autores: MasteryTalk PRO Product Team*
*Revisión recomendada: cuando el dataset de sesiones supere 500 para calibración empírica*
