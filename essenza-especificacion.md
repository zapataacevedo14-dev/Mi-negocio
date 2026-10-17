# Especificación técnica frontend --- ESSENZA

**Proyecto:** Tienda virtual de lociones premium\
**Enfoque:** UI/UX y frontend\
**Tecnologías permitidas:** HTML5, CSS3 y JavaScript puro\
**Backend:** No incluido

## 1. Objetivo del proyecto

Desarrollar una interfaz web de comercio electrónico especializada en
lociones premium que ofrezca una experiencia de compra intuitiva,
visualmente atractiva, adaptable a dispositivos móviles y orientada a
convertir visitantes en clientes.

La propuesta busca transmitir lujo, elegancia y confianza, facilitar la
búsqueda de fragancias y simplificar el proceso de compra.

## 2. Análisis de referencias de diseño

La dirección visual combina tres ideas generales de tiendas de
perfumería premium:

1.  **Perfumería de lujo editorial:** fotografía protagonista, fondos
    oscuros y acentos dorados para comunicar exclusividad.
2.  **Experiencia minimalista:** catálogo ordenado, jerarquía
    tipográfica clara y navegación sencilla.
3.  **Compra guiada por el aroma:** herramientas que ayudan a elegir
    fragancias por estilo, ocasión y familia olfativa, ya que los
    clientes no pueden oler directamente el producto en una tienda
    online.

Referencias para estudiar: - [Misk --- concepto de tienda de perfumería
premium](https://dribbble.com/shots/27627139-Luxury-Perfume-E-Commerce-Website-Design) -
[Maison Parfum --- catálogo y recorrido de
compra](https://www.nextnext-gen.com/en/projects/maison-parfum) -
[Lunafase --- experiencia de descubrimiento de
fragancias](https://www.charlottefrost.design/work/lunafase) - [Zarla
--- ejemplos de páginas de
perfumería](https://www.zarla.com/inspiration/perfume)

La implementación propuesta debe ser original e inspirarse en principios
generales de diseño, no copiar exactamente otros sitios.

## 3. Descripción general

-   **Nombre provisional:** ESSENZA --- Perfumería premium.
-   **Tipo de proyecto:** tienda virtual de lociones y fragancias.
-   **Público objetivo:** personas interesadas en fragancias de gama
    premium, regalos y experiencias de compra elegantes.
-   **Enfoque visual:** editorial, minimalista y sofisticado.
-   **Tecnologías:** HTML5 para la estructura, CSS3 para el diseño y
    JavaScript para las interacciones.
-   **Alcance:** frontend exclusivamente.

## 4. Objetivos específicos

-   Diseñar una identidad visual que comunique lujo, elegancia y
    confianza.
-   Facilitar la búsqueda de lociones por familia olfativa, precio y
    nombre.
-   Presentar cada producto con información clara y sus notas
    aromáticas.
-   Implementar un carrito de compras interactivo.
-   Ayudar al cliente a descubrir fragancias según sus preferencias.
-   Garantizar una experiencia coherente en computadores, tabletas y
    celulares.
-   Aplicar buenas prácticas de accesibilidad, organización del código y
    diseño responsive.

## 5. Estructura de la interfaz

### 5.1 Inicio

-   Presentación de la marca.
-   Mensaje principal y propuesta de valor.
-   Llamadas a la acción.
-   Productos destacados y novedades.

### 5.2 Catálogo de productos

-   Tarjetas con nombre, precio en pesos colombianos y familia olfativa.
-   Búsqueda por nombre.
-   Filtros por familia aromática.
-   Ordenamiento por precio.

### 5.3 Detalle del producto

-   Nombre y descripción de la fragancia.
-   Precio y tamaño.
-   Notas aromáticas y características.
-   Botón para añadir al carrito.

### 5.4 Carrito de compras

-   Lista de productos seleccionados.
-   Modificación de cantidades.
-   Eliminación de productos.
-   Cálculo dinámico del subtotal.

### 5.5 Identidad y fidelización

-   Historia de la marca.
-   Recomendador de aromas.
-   Formulario visual de suscripción a novedades.
-   Información de contacto.

## 6. Sistema visual UI/UX

### 6.1 Paleta de colores

  Color          Código      Uso sugerido
  -------------- ----------- -------------------------------------
  Negro cálido   `#211D19`   Textos principales y fondos oscuros
  Dorado         `#B28A56`   Acentos y detalles premium
  Marfil         `#F7F4EF`   Fondo principal
  Arena          `#E7E0D7`   Superficies secundarias
  Gris cálido    `#77716A`   Textos secundarios

### 6.2 Tipografía

-   **Playfair Display:** títulos y elementos editoriales.
-   **DM Sans:** navegación, botones, precios y textos funcionales.

Estas fuentes pueden cargarse desde Google Fonts. Si no hay conexión,
deben existir fuentes alternativas del sistema.

### 6.3 Principios UX

-   Jerarquía visual clara.
-   Navegación sencilla y consistente.
-   Botones con estados visuales al interactuar.
-   Mensajes de confirmación al añadir productos.
-   Filtros y búsqueda fáciles de localizar.
-   Cuestionario de preferencias para facilitar la elección.
-   Diseño adaptable a diferentes pantallas.
-   Respeto por la preferencia del dispositivo de reducir movimiento.
-   Contraste legible, etiquetas claras y controles utilizables con
    teclado.

## 7. Estructura técnica del proyecto

``` text
essenza-perfumeria/
├── index.html
├── styles.css
└── app.js
```

### `index.html`

Contiene la estructura semántica de la página, secciones, navegación,
catálogo, paneles y formularios.

### `styles.css`

Define la paleta visual, tipografías, espaciados, tarjetas, botones,
animaciones y reglas responsive.

### `app.js`

Controla la búsqueda, filtros, ordenamiento, detalle de producto,
favoritos, carrito, subtotal y recomendador de aromas.

## 8. Funcionalidades frontend

  Funcionalidad                  Alcance
  ------------------------------ ----------------------------------------
  Página de inicio premium       Presentación visual de la marca
  Catálogo de productos          Ocho productos de ejemplo
  Filtros por familia olfativa   Actualización del catálogo
  Búsqueda                       Búsqueda por nombre
  Ordenamiento por precio        Orden ascendente o descendente
  Detalle de fragancia           Información ampliada del producto
  Carrito                        Añadir, retirar y modificar cantidades
  Subtotal                       Cálculo dinámico en el navegador
  Favoritos                      Selección visual de productos
  Recomendador de aromas         Orientación según preferencias
  Formulario de suscripción      Interacción demostrativa
  Diseño responsive              Adaptación a escritorio y móvil

Los productos, precios y características deben considerarse ilustrativos
hasta que se sustituyan por información real del negocio. Las botellas
de la primera versión pueden ser ilustraciones CSS y no fotografías de
productos comerciales.

## 9. Alcance y limitaciones

### Incluido

-   Presentación visual.
-   Navegación e interacciones.
-   Búsqueda y filtros.
-   Carrito temporal y cálculo de subtotal.
-   Recomendaciones ejecutadas en JavaScript.

### No incluido

-   Servidor o backend.
-   Base de datos.
-   Cuentas de usuario.
-   Persistencia del carrito entre dispositivos o sesiones, salvo que se
    programe explícitamente almacenamiento local.
-   Pagos electrónicos.
-   Inventario real.
-   Cálculo real de envíos.
-   Procesamiento de pedidos.
-   Envío real de correos desde el formulario de suscripción.

El carrito y las interacciones son una demostración frontend; no
constituyen todavía un sistema de ventas real. Para recibir pedidos
posteriormente se podrá integrar un proveedor de pagos, un sistema de
pedidos o un canal de WhatsApp.

## 10. Criterios de aceptación

-   [ ] La página abre sin errores en el navegador.
-   [ ] El menú funciona en escritorio y móvil.
-   [ ] Los filtros, la búsqueda y el ordenamiento actualizan el
    catálogo.
-   [ ] Se puede consultar un producto y añadirlo al carrito.
-   [ ] Las cantidades y el subtotal se actualizan correctamente.
-   [ ] Se pueden retirar productos del carrito.
-   [ ] La interfaz se adapta a pantallas pequeñas sin desbordamientos.
-   [ ] Los botones y formularios ofrecen una respuesta comprensible.
-   [ ] Los controles principales son accesibles mediante teclado.
-   [ ] Los textos y precios son legibles y coherentes.

Estos son criterios propuestos para probar el proyecto; no constituyen
una certificación de pruebas en todos los navegadores.

## 11. Próximas mejoras recomendadas

1.  Sustituir las ilustraciones por fotografías reales y de buena
    calidad de los productos.
2.  Definir el nombre definitivo, el logotipo y la identidad de marca.
3.  Confirmar los nombres, tamaños, notas aromáticas y precios reales.
4.  Probar el diseño en dispositivos móviles y diferentes navegadores.
5.  Revisar accesibilidad, contraste, etiquetas y navegación con
    teclado.
6.  Cuando el negocio esté listo para vender, evaluar una integración de
    pedidos y pagos seguros.

## 12. Resultado esperado

Una tienda frontend de lociones premium, elegante y responsive, que
permita explorar fragancias, consultar productos, filtrar el catálogo,
marcar favoritos y simular una compra mediante un carrito interactivo,
utilizando únicamente HTML, CSS y JavaScript.
