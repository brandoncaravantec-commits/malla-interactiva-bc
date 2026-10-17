// Prerrequisitos según las capturas y confirmación del cliente (16/10/2026).
// Conserva los id: se usan para recuperar el avance existente.
const RAMOS = [
  {
    "id": "s1r1",
    "name": "Precálculo",
    "code": "MAT1000",
    "credits": 10,
    "cat": "base",
    "sem": 1,
    "requires": [],
    "editable": false
  },
  {
    "id": "s1r2",
    "name": "Introducción a la Ciencia Política",
    "code": "ICP0101",
    "credits": 10,
    "cat": "base",
    "sem": 1,
    "requires": [],
    "editable": false
  },
  {
    "id": "s1r3",
    "name": "Gestión Pública I",
    "code": "ADP002G",
    "credits": 10,
    "cat": "base",
    "sem": 1,
    "requires": [],
    "editable": false
  },
  {
    "id": "s1r4",
    "name": "Justicia y Bien Común",
    "code": "ADP001G",
    "credits": 10,
    "cat": "base",
    "sem": 1,
    "requires": [],
    "editable": false
  },
  {
    "id": "s1r5",
    "name": "Filosofía: ¿Para qué?",
    "code": "FIL2001",
    "credits": 10,
    "cat": "fg",
    "sem": 1,
    "requires": [],
    "editable": true
  },
  {
    "id": "s1r6",
    "name": "Español",
    "code": "VRA100C",
    "credits": 0,
    "cat": "base",
    "sem": 1,
    "requires": [],
    "editable": false
  },
  {
    "id": "s1r7",
    "name": "English Test",
    "code": "VRA2000",
    "credits": 0,
    "cat": "base",
    "sem": 1,
    "requires": [],
    "editable": false
  },
  {
    "id": "s1r8",
    "name": "Integridad Académica en la UC",
    "code": "VRA4000",
    "credits": 0,
    "cat": "base",
    "sem": 1,
    "requires": [],
    "editable": false
  },
  {
    "id": "s2r1",
    "name": "Cálculo I",
    "code": "MAT1100",
    "credits": 10,
    "cat": "base",
    "sem": 2,
    "requires": [
      "s1r1"
    ],
    "editable": false
  },
  {
    "id": "s2r2",
    "name": "Introducción a la Microeconomía",
    "code": "EAE110A",
    "credits": 10,
    "cat": "base",
    "sem": 2,
    "requires": [],
    "editable": false
  },
  {
    "id": "s2r3",
    "name": "Comportamiento Organizacional",
    "code": "ADP001S",
    "credits": 10,
    "cat": "base",
    "sem": 2,
    "requires": [],
    "editable": false
  },
  {
    "id": "s2r4",
    "name": "Introducción al Derecho",
    "code": "ADP001D",
    "credits": 10,
    "cat": "base",
    "sem": 2,
    "requires": [],
    "editable": false
  },
  {
    "id": "s2r5",
    "name": "Formación Teológica",
    "code": "TTF",
    "credits": 10,
    "cat": "fg",
    "sem": 2,
    "requires": [],
    "editable": true
  },
  {
    "id": "s3r1",
    "name": "Probabilidad y Estadística",
    "code": "EYP1010",
    "credits": 10,
    "cat": "base",
    "sem": 3,
    "requires": [
      "s2r1"
    ],
    "editable": false
  },
  {
    "id": "s3r2",
    "name": "Fundamentos de Macroeconomía",
    "code": "ADP001E",
    "credits": 10,
    "cat": "base",
    "sem": 3,
    "requires": [],
    "editable": false
  },
  {
    "id": "s3r3",
    "name": "Gestión Pública II",
    "code": "ADP003G",
    "credits": 10,
    "cat": "base",
    "sem": 3,
    "requires": [],
    "editable": false
  },
  {
    "id": "s3r4",
    "name": "Introducción a las Políticas Públicas",
    "code": "GOB1001",
    "credits": 10,
    "cat": "base",
    "sem": 3,
    "requires": [],
    "editable": false
  },
  {
    "id": "s3r5",
    "name": "Formación General · Artes",
    "code": "",
    "credits": 10,
    "cat": "fg",
    "sem": 3,
    "requires": [],
    "editable": true
  },
  {
    "id": "s4r1",
    "name": "Métodos Aplicados a la Gestión Pública",
    "code": "ADP004G",
    "credits": 10,
    "cat": "base",
    "sem": 4,
    "requires": [
      "s3r1"
    ],
    "editable": false
  },
  {
    "id": "s4r2",
    "name": "Economía del Sector Público",
    "code": "ADP002E",
    "credits": 10,
    "cat": "base",
    "sem": 4,
    "requires": [
      "s3r2"
    ],
    "editable": false
  },
  {
    "id": "s4r3",
    "name": "Introducción a la Política Comparada",
    "code": "ICP0103",
    "credits": 10,
    "cat": "base",
    "sem": 4,
    "requires": [],
    "editable": false
  },
  {
    "id": "s4r4",
    "name": "Instituciones y Garantías del Estado",
    "code": "ADP002D",
    "credits": 10,
    "cat": "base",
    "sem": 4,
    "requires": [],
    "editable": false
  },
  {
    "id": "s4r5",
    "name": "Formación General · Ciencia y Tecnología",
    "code": "",
    "credits": 10,
    "cat": "fg",
    "sem": 4,
    "requires": [],
    "editable": true
  },
  {
    "id": "s5r1",
    "name": "Evidencia para la Gestión Pública",
    "code": "ADP005G",
    "credits": 10,
    "cat": "base",
    "sem": 5,
    "requires": [],
    "editable": false
  },
  {
    "id": "s5r2",
    "name": "Contabilidad",
    "code": "EAA110A",
    "credits": 10,
    "cat": "prof",
    "sem": 5,
    "requires": [],
    "editable": false
  },
  {
    "id": "s5r3",
    "name": "Política en Gestión y Políticas Públicas",
    "code": "ADP201C",
    "credits": 10,
    "cat": "prof",
    "sem": 5,
    "requires": [
      "s1r2"
    ],
    "editable": false
  },
  {
    "id": "s5r4",
    "name": "Régimen Jurídico de la Administración del Estado",
    "code": "ADP201D",
    "credits": 10,
    "cat": "prof",
    "sem": 5,
    "requires": [
      "s4r4"
    ],
    "editable": false
  },
  {
    "id": "s5r5",
    "name": "Formación General · Ecología Integral y Sustentabilidad",
    "code": "",
    "credits": 10,
    "cat": "fg",
    "sem": 5,
    "requires": [],
    "editable": true
  },
  {
    "id": "s6r1",
    "name": "Operaciones de Servicios Públicos",
    "code": "ADP201I",
    "credits": 10,
    "cat": "prof",
    "sem": 6,
    "requires": [
      "s3r1"
    ],
    "editable": false
  },
  {
    "id": "s6r2",
    "name": "Evaluación de Programas Públicos",
    "code": "ADP201G",
    "credits": 10,
    "cat": "prof",
    "sem": 6,
    "requires": [
      "s4r1"
    ],
    "editable": false
  },
  {
    "id": "s6r3",
    "name": "Administración Financiera del Estado",
    "code": "ADP202G",
    "credits": 10,
    "cat": "prof",
    "sem": 6,
    "requires": [
      "s2r2",
      "s3r2"
    ],
    "editable": false
  },
  {
    "id": "s6r4",
    "name": "Minor",
    "code": "",
    "credits": 10,
    "cat": "minor",
    "sem": 6,
    "requires": [],
    "editable": true
  },
  {
    "id": "s6r5",
    "name": "Formación General · Humanidades",
    "code": "",
    "credits": 10,
    "cat": "fg",
    "sem": 6,
    "requires": [],
    "editable": true
  },
  {
    "id": "s7r1",
    "name": "Gestión de Innovación y Tecnología",
    "code": "ADP202I",
    "credits": 10,
    "cat": "prof",
    "sem": 7,
    "requires": [],
    "editable": false
  },
  {
    "id": "s7r2",
    "name": "Gestión de Personas en el Sector Público",
    "code": "ADP201E",
    "credits": 10,
    "cat": "prof",
    "sem": 7,
    "requires": [
      "s2r3"
    ],
    "editable": false
  },
  {
    "id": "s7r3",
    "name": "Minor",
    "code": "",
    "credits": 10,
    "cat": "minor",
    "sem": 7,
    "requires": [],
    "editable": true
  },
  {
    "id": "s7r4",
    "name": "Minor",
    "code": "",
    "credits": 10,
    "cat": "minor",
    "sem": 7,
    "requires": [],
    "editable": true
  },
  {
    "id": "s7r5",
    "name": "Formación General · Salud y Bienestar",
    "code": "",
    "credits": 10,
    "cat": "fg",
    "sem": 7,
    "requires": [],
    "editable": true
  },
  {
    "id": "s8r1",
    "name": "Transformación Digital",
    "code": "ADP203I",
    "credits": 10,
    "cat": "prof",
    "sem": 8,
    "requires": [],
    "editable": false
  },
  {
    "id": "s8r2",
    "name": "Gestión de Proyectos Públicos (Capstone)",
    "code": "ADP203G",
    "credits": 10,
    "cat": "prof",
    "sem": 8,
    "requires": [
      "s6r1"
    ],
    "editable": false
  },
  {
    "id": "s8r3",
    "name": "Minor",
    "code": "",
    "credits": 10,
    "cat": "minor",
    "sem": 8,
    "requires": [],
    "editable": true
  },
  {
    "id": "s8r4",
    "name": "Minor",
    "code": "",
    "credits": 10,
    "cat": "minor",
    "sem": 8,
    "requires": [],
    "editable": true
  },
  {
    "id": "s8r5",
    "name": "Formación General Libre",
    "code": "",
    "credits": 10,
    "cat": "fg",
    "sem": 8,
    "requires": [],
    "editable": true
  },
  {
    "id": "s9r1",
    "name": "Ética y Políticas Públicas",
    "code": "ADP301G",
    "credits": 5,
    "cat": "base",
    "sem": 9,
    "requires": [],
    "editable": false
  },
  {
    "id": "s9r2",
    "name": "Probidad y Transparencia",
    "code": "ADP302G",
    "credits": 5,
    "cat": "base",
    "sem": 9,
    "requires": [],
    "editable": false
  },
  {
    "id": "s9r3",
    "name": "Habilidades Directivas",
    "code": "ADP301E",
    "credits": 10,
    "cat": "base",
    "sem": 9,
    "requires": [],
    "editable": false
  },
  {
    "id": "s9r4",
    "name": "Auditoría Gubernamental",
    "code": "ADP303G",
    "credits": 10,
    "cat": "base",
    "sem": 9,
    "requires": [],
    "editable": false
  },
  {
    "id": "s9r5",
    "name": "Optativo",
    "code": "",
    "credits": 10,
    "cat": "base",
    "sem": 9,
    "requires": [],
    "editable": true
  },
  {
    "id": "s9r6",
    "name": "Optativo",
    "code": "",
    "credits": 10,
    "cat": "base",
    "sem": 9,
    "requires": [],
    "editable": true
  },
  {
    "id": "s10r1",
    "name": "Práctica Profesional",
    "code": "ADP306G",
    "credits": 35,
    "cat": "base",
    "sem": 10,
    "requires": [
      "s8r2"
    ],
    "editable": false
  },
  {
    "id": "s10r2",
    "name": "Entorno y Relación con el Medio",
    "code": "ADP305G",
    "credits": 10,
    "cat": "base",
    "sem": 10,
    "requires": [],
    "editable": false
  },
  {
    "id": "s10r3",
    "name": "Ética Profesional",
    "code": "ADP304G",
    "credits": 5,
    "cat": "base",
    "sem": 10,
    "requires": [],
    "editable": false
  }
];
