# PokéSphere 🔴⚪ | Pokédex Definitiva

[![GitHub Pages](https://img.shields.io/badge/Demo-Online%20(GitHub%20Pages)-success?style=for-the-badge&logo=github)](https://isabrimer.github.io/pokesphere/)

**🔗 Enlace en vivo para jugar y explorar:** [https://isabrimer.github.io/pokesphere/](https://isabrimer.github.io/pokesphere/)  
**📁 Repositorio en GitHub:** [https://github.com/isabrimer/pokesphere](https://github.com/isabrimer/pokesphere)

Una aplicación web moderna, interactiva y completa inspirada en el universo Pokémon, construida con HTML5, CSS3 moderno y Vanilla JavaScript. Adaptable a smartphones, tablets y PC.

## 🌟 Características Principales

1. **Pokédex Nacional y por Regiones**:
   - Más de 1000 Pokémon con arte oficial en alta definición.
   - Filtro por **Región / Generación** (Kanto, Johto, Hoenn, Sinnoh, Teselia, Kalos, Alola, Galar, Paldea).
   - Filtro por **Tipos elementales** con colores característicos (Fuego, Agua, Planta, Eléctrico, Dragón, etc.).
   - Buscador en tiempo real por nombre o número (ej: *Pikachu* o *#25*), con búsqueda directa a la PokéAPI.
   - Ordenamiento por ID ascendente/descendente y orden alfabético A-Z.

2. **Ficha Detallada de Pokémon**:
   - Visualización de modelo oficial y alternador para versión **Variocolor (Shiny ✨)**.
   - **Rugido / Grito oficial (Cry)** de cada Pokémon con reproductor de audio integrado.
   - Descripción oficial y clasificación en español extraída de la Pokédex.
   - Estadísticas de combate (PS, Ataque, Defensa, Atq. Especial, Def. Especial, Velocidad) con barras visuales animadas.
   - Datos físicos (Altura en metros, Peso en kilogramos, Habilidades y Experiencia base).

3. **Constructor de Equipo (Mi Equipo - 6 Slots)**:
   - Añade y gestiona tu alineación de hasta 6 Pokémon.
   - Panel de **Análisis Táctico**: calcula automáticamente los promedios de PS, Ataque, Defensa y Velocidad de tu equipo.
   - Cobertura de tipos elementales del equipo para planificar tus batallas.

4. **Minijuego: ¿Quién es ese Pokémon?**:
   - Juego de adivinanza con siluetas clásicas al estilo del anime.
   - Sistema de racha de aciertos y mejor puntuación guardada localmente.
   - Revelación animada con sonido del rugido del Pokémon.

5. **Sistema de Favoritos**:
   - Marca con un corazón tus Pokémon favoritos para acceder a ellos rápidamente en su propia pestaña.
   - Persistencia automática en el navegador con `localStorage`.

6. **PWA Instalable (Progressive Web App)**:
   - Se puede instalar como una aplicación nativa en Android, iOS, Windows y macOS directamente desde el navegador.
   - Funciona sin conexión (Offline) para la interfaz y recursos guardados en caché mediante Service Worker (`sw.js`).
   - Botón directo de instalación integrado en la barra superior.

7. **Audio y Efectos**:
   - Sonidos retro sintetizados mediante la Web Audio API (sin dependencias externas).
   - Botón de silenciar/activar audio en la barra superior.

---

## 🚀 Cómo abrir la aplicación

No requiere instalar ningún programa ni servidor complejo:

1. Simplemente haz **doble clic en `index.html`** para abrirlo en cualquier navegador moderno (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari, etc.).
2. Requiere conexión a internet para cargar las imágenes y datos de la [PokéAPI](https://pokeapi.co/).

---

## 📁 Estructura del Proyecto

```
mi pagina web/
│
├── index.html     # Estructura semántica, pestañas, modales y vistas
├── style.css      # Diseño gaming oscuro, efectos de neón, glassmorphism y responsive
├── app.js         # Lógica interactiva, consumo de PokéAPI, caché y Web Audio
└── README.md      # Documentación del proyecto
```
