
Contexto del bug (lo que está pasando)
- El carrusel se renderiza, pero:
  1) No se puede “arrastrar” (drag/swipe) entre estilos.
  2) Solo aparece la flecha izquierda; la flecha derecha no se ve o queda fuera/cubierta.
- En la UI actual, los videos (elemento <video>) suelen “capturar” el gesto del mouse/touch y Embla no recibe el drag. Esto es un caso típico: el usuario intenta deslizar sobre el video y no se mueve el carrusel.
- La flecha derecha puede estar:
  - quedando recortada por un contenedor con overflow/espaciados, o
  - quedando tapada por el contenido del carrusel/video en ciertas resoluciones (z-index/área clicable), o
  - quedando fuera del área visible por padding/márgenes y “overflow-hidden” del layout general.

Objetivo (lo que vas a obtener)
- Drag/Swipe real y fluido: podrás mover el carrusel arrastrando el video (mouse) o deslizando (móvil).
- Flecha derecha visible y clicable en el extremo derecho del panel (sin tapar el video).
- Flechas con buen contraste y área de click grande, sin interferir con el contenido.

Cambios propuestos (sin romper el diseño actual)

1) Arreglar el “drag” del carrusel (causa principal)
Archivo: src/components/video/StyleCarousel.tsx
Acciones:
- Evitar que el <video> intercepte el gesto de arrastre:
  - Poner el <video> con pointer-events-none (solo para el video).
  - Mantener el click Play/Pause funcionando moviéndolo a un overlay con pointer-events-auto (ya existe overlay; lo reforzamos para que sea el único elemento clicable sobre el video).
- Habilitar clases Tailwind para gestos/selección en el área del carrusel:
  - Agregar a <CarouselContent> y/o al contenedor de cada slide:
    - "select-none" (evita selección de texto)
    - "touch-pan-y" (mejor comportamiento touch; deja que Embla maneje el gesto horizontal)
    - "cursor-grab active:cursor-grabbing" (feedback visual)
Resultado:
- El drag funciona incluso si el usuario arrastra “sobre el video”.

2) Hacer que la flecha derecha siempre se vea y no tape el video
Archivo: src/components/video/StyleCarousel.tsx
Problema actual:
- Las flechas están con absolute left-0/right-0 dentro del contenedor del carrusel, pero el carrusel tiene padding interno (px-20) y el layout general tiene overflow-hidden en la página. En ciertas anchuras, la flecha derecha puede quedar recortada o tapada.
Acciones:
- Reestructurar el layout del carrusel para reservar espacio real para las flechas sin superponerlas al video:
  - Crear un wrapper de 3 columnas:
    - Columna izquierda: botón Prev (fijo)
    - Columna central: el carrusel (videos)
    - Columna derecha: botón Next (fijo, extremo derecho del panel)
  - Ejemplo de estructura (conceptual):
    - <div className="w-full grid grid-cols-[72px_1fr_72px] items-center gap-4">
        [PrevButton] [Carousel] [NextButton]
      </div>
- Esto garantiza:
  - la flecha derecha queda en el extremo derecho,
  - no se monta encima del video,
  - no depende de z-index para “ganar” sobre el video,
  - no se recorta por padding/overflow.
- Ajustar tamaños/estética:
  - Botones redondos con degradado sutil y blur (como ya tienes), pero con fondo un poco más sólido para que siempre se vean.
  - Mantener hover/scale.

3) Mantener click para seleccionar estilo y Play/Pause sin pelear con el swipe
Archivo: src/components/video/StyleCarousel.tsx
Acciones:
- Click para centrar/seleccionar estilo:
  - Mantener onClick={() => scrollTo(index)} en el contenedor de cada item.
- Play/Pause:
  - El overlay (solo en el activo) seguirá recibiendo el click.
  - Como el video estará pointer-events-none, el overlay será el punto de interacción; no romperá el drag.

4) Pequeños ajustes de Embla para “snap” consistente
Archivo: src/components/video/StyleCarousel.tsx
Acciones:
- Mantener:
  - align: "center"
  - loop: true
  - skipSnaps: false
- Quitar containScroll cuando loop=true (Embla a veces se comporta raro con containScroll + loop). Propuesta:
  - eliminar containScroll o dejarlo solo si loop=false.
Resultado:
- Flechas y swipe avanzan al siguiente estilo de forma estable.

5) Validación rápida post-cambio (QA)
- En desktop:
  - Arrastrar sobre el video activo: debe moverse al siguiente/anterior.
  - Click en flecha derecha: debe avanzar.
  - Click en flecha izquierda: debe retroceder.
  - Click en un estilo lateral: debe centrarlo (scrollTo).
- En móvil:
  - Swipe horizontal sobre el video: debe navegar estilos.
- Confirmar que:
  - el nombre del estilo arriba del video se mantiene,
  - el panel izquierdo se actualiza con el activeIndex,
  - no se tapa el video con botones.

Archivos a modificar
- src/components/video/StyleCarousel.tsx
  - (drag/swipe, flecha derecha visible en extremo derecho, layout de flechas sin tapar video, ajustes Embla)

Notas técnicas (por qué esto arregla el problema)
- El <video> suele capturar el pointer/touch y evita que Embla “enganche” el drag. Al poner pointer-events-none en el video, el gesto llega al contenedor del carrusel (embla viewport), y el swipe funciona.
- Al sacar las flechas del overlay del carrusel y ponerlas en columnas laterales, eliminamos problemas de recorte y superposición. Siempre estarán visibles y clicables, “tipo carrusel”, sin tapar el video.
