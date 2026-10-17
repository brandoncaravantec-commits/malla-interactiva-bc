# Malla interactiva — Administración Pública

## Versión 3.3: prerrequisitos corregidos

Se usa la referencia enviada y confirmada por el cliente el 16/10/2026. Esta tabla reemplaza las relaciones descritas en las versiones anteriores; no constituye una verificación oficial de la universidad.

| Ramo | Debe aprobar primero |
| --- | --- |
| Cálculo I | Precálculo |
| Probabilidad y Estadística | Cálculo I |
| Métodos Aplicados a la Gestión Pública | Probabilidad y Estadística |
| Economía del Sector Público | Fundamentos de Macroeconomía |
| Operaciones de Servicios Públicos | Probabilidad y Estadística |
| Evaluación de Programas Públicos | Métodos Aplicados a la Gestión Pública |
| Política en Gestión y Políticas Públicas | Introducción a la Ciencia Política |
| Administración Financiera del Estado | Introducción a la Microeconomía **y** Fundamentos de Macroeconomía |
| Régimen Jurídico de la Administración del Estado | Instituciones y Garantías del Estado |
| Gestión de Personas en el Sector Público | Comportamiento Organizacional |
| Gestión de Proyectos Públicos (Capstone) | Operaciones de Servicios Públicos |
| Práctica Profesional | Gestión de Proyectos Públicos (Capstone) |

Los otros ramos originales no tienen prerrequisitos registrados. Los ramos personalizados conservan los requisitos elegidos por cada usuario. Se mantienen los identificadores, nombres, créditos y almacenamiento. Al cargar un avance anterior, los estados incompatibles con los nuevos requisitos pasan a pendiente y se avisa en la página; los conflictos de distribución se señalan para corregirlos.

Sube juntos los siete archivos del sitio a GitHub. En el pie debe aparecer **v3.3**. Exporta un respaldo antes de actualizar si quieres conservar una copia de tus estados anteriores.

## Versión 3.2: respetar el orden de prerrequisitos

Ahora cada prerrequisito debe quedar en un semestre estrictamente anterior al ramo dependiente, incluso si ya está aprobado. Al arrastrar o mover desde Detalles, se bloquea tanto adelantar el dependiente como retrasar su prerrequisito a un semestre incompatible. Se explica qué ramo causa el bloqueo y se conserva la posición anterior. Puedes seguir ordenando libremente las tarjetas dentro de un semestre.

Para retrasar una cadena, mueve primero los ramos dependientes hacia semestres posteriores. Esta regla también se revisa al agregar ramos, importar respaldos y restaurar la distribución. Los planes antiguos ya guardados en el navegador se mantienen y se señalan sus conflictos para corregirlos sin perder el avance.

Publicación: reemplaza los siete archivos del sitio juntos. El pie y los enlaces de recursos identifican esta entrega como **v3.2**. Esta regla reemplaza el comportamiento anterior que solo advertía sobre un orden incompatible.

## Versión 3.1: editar créditos

En **Detalles → Créditos del ramo** puedes cambiar los créditos de cualquier ramo, incluidos los originales y los personalizados. Se aceptan enteros entre 0 y 100, igual que al agregar un ramo. Antes de guardar un valor diferente aparece una advertencia con los créditos anteriores y nuevos. Cancelar esa advertencia no guarda ningún cambio del formulario.

El valor se aplica a la tarjeta, al total del semestre, a los créditos aprobados, al total del plan y al porcentaje de avance. Se conserva al recargar y en los respaldos. La ventana muestra también el valor original como referencia. **Reiniciar todo** recupera los valores iniciales; **Restaurar distribución** conserva los créditos personalizados.

Para publicar esta actualización, reemplaza juntos los siete archivos del sitio, incluido `compatibilidad.js`. En el pie debe aparecer **v3.1**. Los enlaces a los archivos usan `?v=3.1` para evitar cargar la entrega anterior. El avance existente se conserva.

## Versión 3.0: orden, temas y compatibilidad

- Arrastra un ramo sobre la mitad superior o inferior de otro: la marca indica si se insertará antes o después. Soltar en el espacio libre del semestre lo ubica al final.
- También puedes usar **↑ / ↓** en cada tarjeta o **Detalles → Posición dentro del semestre** para elegir inicio, medio o final. Esta alternativa funciona con teclado y en celular.
- Se guarda el orden al recargar y dentro de los respaldos. Los respaldos antiguos siguen siendo compatibles.
- En la cabecera, **Tema** permite elegir **Rosado**, **Azul UC** u **Oscuro**. La preferencia se guarda por navegador. Reiniciar la malla conserva el tema.
- Las confirmaciones ahora están dentro de la página. `compatibilidad.js` aporta copia de datos sin `structuredClone` y apertura de ventanas en navegadores sin `showModal`.
- Los archivos se cargan con `?v=3.0` para solicitar esta entrega en lugar de versiones anteriores almacenadas en caché. No borres las claves de almacenamiento del navegador: contienen el avance.

### Actualizar GitHub Pages

Sube juntos, en la raíz del repositorio, estos SIETE archivos: `index.html`, `estilos.css`, `datos.js`, `carreras.js`, `logica.js`, `app.js` y **`compatibilidad.js`** (nuevo). Confirma todos los cambios en una misma publicación. No subas solamente el ZIP ni una carpeta contenedora.

Una vez que GitHub termine de publicar, recarga el sitio. En el pie debe aparecer **v3.0**, y en la cabecera el selector **Tema**. Si aún se muestra la versión anterior, vuelve a abrir el enlace con `?v=3.0` al final. Para futuras entregas cambia la versión de los enlaces de archivos en `index.html`.

Verificación realizada: creación de un ramo, movimiento a posición intermedia, flechas, persistencia tras recarga, cancelar/confirmar reinicio y cambio de temas en navegador; pruebas de lógica para orden, respaldos y compatibilidad. La causa exacta del fallo del equipo del cliente no se pudo reproducir: la página publicada sí abrió Agregar ramo en el navegador de revisión.

## Identidad visual BC y futuras carreras

La interfaz usa una paleta rosada y pastel. Cambia las variables al inicio de `estilos.css` para ajustar la identidad visual. La marca visible es **malla interactiva bc** y el encabezado toma el nombre de la carrera activa.

El catálogo está en `carreras.js`. Actualmente contiene solo Administración Pública. Para agregar otra carrera:

1. Crea un archivo de datos con una constante distinta, por ejemplo `RAMOS_OTRA`, siguiendo los campos de `datos.js`: `id`, `name`, `code`, `credits`, `cat`, `sem`, `requires` y `editable`.
2. Carga ese archivo mediante una etiqueta `script` en `index.html`, después de `datos.js` y antes de `carreras.js`.
3. Agrega una entrada a `CARRERAS` con un `id` único y permanente, `name`, `university`, `semesters` (entre 1 y 30) y `courses: RAMOS_OTRA`.
4. El selector mostrará la carrera automáticamente. Los créditos y los semestres iniciales se calculan con sus datos. Cada carrera mantiene su propio almacenamiento y los respaldos nuevos identifican la carrera a la que pertenecen.

El avance previo de Administración Pública conserva su clave de almacenamiento. Abre la página desde la misma dirección y navegador para recuperarlo; si cambias de carpeta, exporta antes tu respaldo e impórtalo en la nueva ubicación. No cambies los identificadores de los ramos existentes.

## Abrir en Visual Studio Code

1. Descomprime el ZIP.
2. En VS Code, elige **Archivo → Abrir carpeta** y selecciona `malla-vscode`.
3. Abre `index.html` en tu navegador haciendo doble clic desde el explorador de archivos.
4. Edita los archivos en VS Code, guarda y recarga el navegador para ver los cambios.

No necesitas instalar paquetes ni usar un servidor. Si ya usas Live Server, también puedes abrir `index.html` con él. El almacenamiento pertenece al navegador y a la dirección desde donde abres la página; exporta un respaldo antes de cambiar de dirección o equipo.

## Archivos

- `index.html`: estructura de la página y ventana de detalles.
- `estilos.css`: colores, tamaños y diseño adaptable.
- `datos.js`: los 52 ramos/requisitos y todas las dependencias indicadas por el cliente.
- `logica.js`: reglas de aprobación, movimientos y validación de respaldos.
- `app.js`: tarjetas, arrastrar y soltar, formularios y guardado local.
- `pruebas.cjs`: comprobaciones de las reglas. Opcional: ejecutar `node pruebas.cjs` si tienes Node instalado.

## Cómo usarlo

- **+ Agregar ramo** abre un formulario de nombre, sigla opcional, créditos (entero entre 0 y 100), semestre, categoría y prerrequisitos. Puedes agregar hasta 200 ramos personalizados por carrera. Se incluyen en tus créditos totales, búsquedas, movimientos, aprobaciones y respaldos.
- **Reiniciar todo** solicita confirmación y devuelve únicamente la carrera activa a su estado inicial: elimina estados, nombres personalizados, movimientos, semestres adicionales y ramos agregados. Cancela y guarda un respaldo antes si quieres conservar tu plan.
- Los respaldos anteriores de esta versión siguen funcionando aunque no contengan ramos personalizados.

- Arrastra un ramo hacia otro semestre. También puedes usar **Detalles → Ubicar en semestre**, con teclado o desde el teléfono.
- Pulsa **Aprobar** para habilitar los siguientes ramos. Deben estar aprobados TODOS sus prerrequisitos.
- En **Detalles** puedes marcar un ramo **En curso**. Esto no habilita los ramos siguientes hasta aprobarlo.
- Si desmarcas una aprobación necesaria para otros ramos, se pide confirmar el cambio de esos dependientes a pendiente.
- Personaliza los OFG, minors y optativos desde **Detalles**. El nombre de la categoría original se conserva debajo del nombre elegido.
- **+ Semestre** agrega espacio para extender tu plan, hasta 30 semestres.
- Puedes mover incluso ramos bloqueados para planificar el futuro. Una advertencia indica si quedaron antes o en el mismo semestre que un prerrequisito pendiente.
- **Restaurar distribución** conserva nombres y estados, pero devuelve todos los ramos a su semestre original.
- **Guardar respaldo** exporta nombres, estados y distribución. **Cargar respaldo** recupera un respaldo de esta versión. Los respaldos de la primera página no son compatibles.

## Editar prerrequisitos

En `datos.js`, cada ramo tiene un `id` permanente y una lista `requires`. Los identificadores no cambian al mover un ramo.

```js
// Métodos requiere Probabilidad y Estadística.
"requires": ["s3r1"]

// Capstone requiere Operaciones de Servicios Públicos.
"requires": ["s6r1"]
```

Para cambiar una dependencia, agrega o quita el identificador correspondiente en `requires`. No uses el nombre del ramo como identificador. No crees dependencias circulares. Ejecuta las pruebas después de editar.

Las dependencias corresponden a la lista proporcionada por el cliente, no a una verificación académica oficial. La frase “Administración Financiera abre dos ramos” no identifica un segundo ramo en esa lista: solamente se configuró su relación con Capstone. No se inventaron restricciones para práctica, titulación u oferta semestral.

Esta versión es local y no modifica el sitio publicado anteriormente. No tiene cuentas ni sincronización entre dispositivos. Los datos se guardan en `localStorage`; usa respaldos para conservarlos si limpias el navegador.
