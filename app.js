/**
 * PokéSphere | Pokédex Definitiva
 * Motor JavaScript para exploración, filtros, equipo y minijuego Pokémon.
 */

// ==========================================
// CONFIGURACIÓN Y CONSTANTES
// ==========================================
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 24;
const MAX_POKEMON = 1025;

const TYPE_TRANSLATIONS = {
  normal: { name: 'Normal', color: '#9fa19f' },
  fire: { name: 'Fuego', color: '#e62829' },
  water: { name: 'Agua', color: '#2980ef' },
  grass: { name: 'Planta', color: '#3fa129' },
  electric: { name: 'Eléctrico', color: '#fac000' },
  ice: { name: 'Hielo', color: '#3dcef3' },
  fighting: { name: 'Lucha', color: '#ff8000' },
  poison: { name: 'Veneno', color: '#9141cb' },
  ground: { name: 'Tierra', color: '#915121' },
  flying: { name: 'Volador', color: '#81b9ef' },
  psychic: { name: 'Psíquico', color: '#ef4179' },
  bug: { name: 'Bicho', color: '#91a119' },
  rock: { name: 'Roca', color: '#afa981' },
  ghost: { name: 'Fantasma', color: '#704170' },
  dragon: { name: 'Dragón', color: '#5060e1' },
  steel: { name: 'Acero', color: '#60a1b8' },
  fairy: { name: 'Hada', color: '#ef70ef' },
  dark: { name: 'Siniestro', color: '#50413f' }
};

const STAT_NAMES = {
  'hp': 'PS',
  'attack': 'Ataque',
  'defense': 'Defensa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  'speed': 'Velocidad'
};

const GENERATIONS = {
  all: { start: 1, end: MAX_POKEMON, title: 'Pokédex Nacional' },
  gen1: { start: 1, end: 151, title: 'Región de Kanto (Gen 1)' },
  gen2: { start: 152, end: 251, title: 'Región de Johto (Gen 2)' },
  gen3: { start: 252, end: 386, title: 'Región de Hoenn (Gen 3)' },
  gen4: { start: 387, end: 493, title: 'Región de Sinnoh (Gen 4)' },
  gen5: { start: 494, end: 649, title: 'Región de Teselia (Gen 5)' },
  gen6: { start: 650, end: 721, title: 'Región de Kalos (Gen 6)' },
  gen7: { start: 722, end: 809, title: 'Región de Alola (Gen 7)' },
  gen8: { start: 810, end: 905, title: 'Región de Galar (Gen 8)' },
  gen9: { start: 906, end: 1025, title: 'Región de Paldea (Gen 9)' }
};

// ==========================================
// ESTADO DE LA APLICACIÓN
// ==========================================
const state = {
  currentView: 'pokedex', // 'pokedex', 'favorites', 'team', 'quiz'
  loadedPokemons: [],     // Pokémon data objects currently loaded
  pokemonCache: new Map(),// ID/Name -> Pokemon Data
  speciesCache: new Map(),// ID -> Species Data
  favorites: new Set(JSON.parse(localStorage.getItem('pokesphere_favorites') || '[]')),
  team: JSON.parse(localStorage.getItem('pokesphere_team') || '[]'),
  currentOffset: 0,
  activeGen: 'all',
  activeType: 'all',
  searchQuery: '',
  sortBy: 'id-asc',
  isLoading: false,
  audioMuted: localStorage.getItem('pokesphere_audio_muted') === 'true',
  modalPokemon: null,
  isModalShiny: false,
  quizCurrentPokemon: null,
  quizStreak: 0,
  quizHighScore: parseInt(localStorage.getItem('pokesphere_quiz_high') || '0', 10),
  quizAnswered: false
};

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const DOM = {
  // Nav
  btnLogo: document.getElementById('btnLogo'),
  navTabs: document.querySelectorAll('.nav-tab'),
  favCount: document.getElementById('favCount'),
  teamCount: document.getElementById('teamCount'),
  btnRandom: document.getElementById('btnRandom'),
  btnAudioToggle: document.getElementById('btnAudioToggle'),
  audioIconOn: document.getElementById('audioIconOn'),
  audioIconOff: document.getElementById('audioIconOff'),

  // Views
  views: {
    pokedex: document.getElementById('viewPokedex'),
    team: document.getElementById('viewTeam'),
    quiz: document.getElementById('viewQuiz')
  },

  // Pokédex View
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  selectGen: document.getElementById('selectGeneration'),
  selectSort: document.getElementById('selectSort'),
  typeFilters: document.getElementById('typeFilters'),
  currentViewTitle: document.getElementById('currentViewTitle'),
  resultCount: document.getElementById('resultCount'),
  pokemonGrid: document.getElementById('pokemonGrid'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  emptyState: document.getElementById('emptyState'),
  btnResetFilters: document.getElementById('btnResetFilters'),
  btnLoadMore: document.getElementById('btnLoadMore'),
  loadMoreContainer: document.getElementById('loadMoreContainer'),

  // Team View
  teamGrid: document.getElementById('teamGrid'),
  teamAnalysis: document.getElementById('teamAnalysis'),
  btnClearTeam: document.getElementById('btnClearTeam'),
  teamAvgHp: document.getElementById('teamAvgHp'),
  teamAvgAtk: document.getElementById('teamAvgAtk'),
  teamAvgDef: document.getElementById('teamAvgDef'),
  teamAvgSpeed: document.getElementById('teamAvgSpeed'),
  teamTypeBadges: document.getElementById('teamTypeBadges'),

  // Quiz View
  quizSilhouetteWrapper: document.getElementById('quizSilhouetteWrapper'),
  quizPokemonImg: document.getElementById('quizPokemonImg'),
  quizRevealName: document.getElementById('quizRevealName'),
  quizOptions: document.getElementById('quizOptions'),
  quizStreak: document.getElementById('quizStreak'),
  quizHighScore: document.getElementById('quizHighScore'),
  btnNextQuiz: document.getElementById('btnNextQuiz'),

  // Modal
  pokemonModal: document.getElementById('pokemonModal'),
  modalCard: document.getElementById('modalCard'),
  btnModalClose: document.getElementById('btnModalClose'),
  modalPokemonId: document.getElementById('modalPokemonId'),
  modalPokemonImg: document.getElementById('modalPokemonImg'),
  modalPokemonName: document.getElementById('modalPokemonName'),
  modalPokemonGenera: document.getElementById('modalPokemonGenera'),
  modalTypes: document.getElementById('modalTypes'),
  modalFlavorText: document.getElementById('modalFlavorText'),
  modalHeight: document.getElementById('modalHeight'),
  modalWeight: document.getElementById('modalWeight'),
  modalExp: document.getElementById('modalExp'),
  modalAbilities: document.getElementById('modalAbilities'),
  modalStatsTotal: document.getElementById('modalStatsTotal'),
  modalStatsList: document.getElementById('modalStatsList'),
  btnModalCry: document.getElementById('btnModalCry'),
  btnModalShiny: document.getElementById('btnModalShiny'),
  btnModalFav: document.getElementById('btnModalFav'),
  btnModalTeam: document.getElementById('btnModalTeam'),
  shinyIndicator: document.getElementById('shinyIndicator'),
  modalVisual: document.getElementById('modalVisual'),

  // Misc
  cryAudioPlayer: document.getElementById('cryAudioPlayer'),
  toast: document.getElementById('toastNotification')
};

// ==========================================
// EFECTOS DE SONIDO SINTETIZADOS (Web Audio API)
// ==========================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSynthTone(freq, type = 'sine', duration = 0.15) {
  if (state.audioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.debug('Audio error', e);
  }
}

function playSound(name) {
  if (state.audioMuted) return;
  if (name === 'click') {
    playSynthTone(587.33, 'triangle', 0.08); // D5
  } else if (name === 'success') {
    playSynthTone(523.25, 'triangle', 0.1); // C5
    setTimeout(() => playSynthTone(659.25, 'triangle', 0.15), 100); // E5
    setTimeout(() => playSynthTone(783.99, 'triangle', 0.25), 200); // G5
  } else if (name === 'error') {
    playSynthTone(220, 'sawtooth', 0.2);
  } else if (name === 'open') {
    playSynthTone(440, 'sine', 0.1);
    setTimeout(() => playSynthTone(880, 'sine', 0.15), 80);
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupTypeFilterPills();
  setupEventListeners();
  updateCounters();
  updateAudioIcon();
  loadInitialPokemons();
});

// Render dynamic type pills in filter bar
function setupTypeFilterPills() {
  const fragment = document.createDocumentFragment();
  Object.entries(TYPE_TRANSLATIONS).forEach(([typeKey, typeData]) => {
    const pill = document.createElement('button');
    pill.className = 'type-pill';
    pill.dataset.type = typeKey;
    pill.textContent = typeData.name;
    pill.style.setProperty('--pill-color', typeData.color);
    fragment.appendChild(pill);
  });
  DOM.typeFilters.appendChild(fragment);
}

// ==========================================
// GESTIÓN DE EVENTOS
// ==========================================
function setupEventListeners() {
  // Navigation Tabs
  DOM.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playSound('click');
      switchView(tab.dataset.view);
    });
  });

  DOM.btnLogo.addEventListener('click', () => {
    switchView('pokedex');
    resetFilters();
  });

  // Search Input
  let searchTimeout = null;
  DOM.searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    DOM.btnClearSearch.classList.toggle('hidden', val.length === 0);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      state.searchQuery = val.toLowerCase();
      
      // If query looks like a specific pokemon name or id and not yet in loadedPokemons
      if (state.searchQuery.length >= 2) {
        const alreadyLoaded = state.loadedPokemons.some(p => 
          p.name.toLowerCase().includes(state.searchQuery) || 
          p.id.toString() === state.searchQuery
        );
        
        if (!alreadyLoaded) {
          DOM.loadingIndicator.classList.remove('hidden');
          const directMatch = await fetchPokemonData(state.searchQuery);
          DOM.loadingIndicator.classList.add('hidden');
          if (directMatch && !state.loadedPokemons.some(p => p.id === directMatch.id)) {
            state.loadedPokemons.push(directMatch);
          }
        }
      }
      
      handleFilterChange();
    }, 350);
  });

  DOM.btnClearSearch.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.btnClearSearch.classList.add('hidden');
    state.searchQuery = '';
    handleFilterChange();
  });

  // Generation Select
  DOM.selectGen.addEventListener('change', (e) => {
    playSound('click');
    state.activeGen = e.target.value;
    handleGenChange();
  });

  // Sort Select
  DOM.selectSort.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderPokemonGrid();
  });

  // Type Filter Badges
  DOM.typeFilters.addEventListener('click', (e) => {
    const pill = e.target.closest('.type-pill');
    if (!pill) return;
    playSound('click');

    document.querySelectorAll('.type-pill').forEach(p => {
      p.classList.remove('active');
      p.style.backgroundColor = '';
    });

    pill.classList.add('active');
    const type = pill.dataset.type;
    if (type !== 'all') {
      pill.style.backgroundColor = TYPE_TRANSLATIONS[type]?.color || '#ef4444';
    }

    state.activeType = type;
    handleFilterChange();
  });

  // Reset Filters Button
  DOM.btnResetFilters.addEventListener('click', () => {
    resetFilters();
  });

  // Load More Button
  DOM.btnLoadMore.addEventListener('click', () => {
    playSound('click');
    loadMorePokemons();
  });

  // Random Pokémon Button
  DOM.btnRandom.addEventListener('click', () => {
    openRandomPokemon();
  });

  // Audio Toggle
  DOM.btnAudioToggle.addEventListener('click', () => {
    state.audioMuted = !state.audioMuted;
    localStorage.setItem('pokesphere_audio_muted', state.audioMuted);
    updateAudioIcon();
    showToast(state.audioMuted ? '🔇 Audio silenciado' : '🔊 Audio activado');
  });

  // Modal actions
  DOM.btnModalClose.addEventListener('click', closeModal);
  DOM.pokemonModal.addEventListener('click', (e) => {
    if (e.target === DOM.pokemonModal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !DOM.pokemonModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Modal Cry
  DOM.btnModalCry.addEventListener('click', () => {
    playCurrentPokemonCry();
  });

  // Modal Shiny Toggle
  DOM.btnModalShiny.addEventListener('click', () => {
    toggleModalShiny();
  });

  // Modal Fav Toggle
  DOM.btnModalFav.addEventListener('click', () => {
    if (state.modalPokemon) {
      toggleFavorite(state.modalPokemon);
      updateModalFavButton();
    }
  });

  // Modal Team Toggle
  DOM.btnModalTeam.addEventListener('click', () => {
    if (state.modalPokemon) {
      toggleTeamMember(state.modalPokemon);
      updateModalTeamButton();
    }
  });

  // Team View actions
  DOM.btnClearTeam.addEventListener('click', () => {
    if (state.team.length === 0) return;
    if (confirm('¿Estás seguro de que quieres vaciar tu equipo Pokémon?')) {
      state.team = [];
      saveTeam();
      renderTeamView();
      renderPokemonGrid();
      showToast('Equipo vaciado');
    }
  });

  // Quiz View actions
  DOM.btnNextQuiz.addEventListener('click', () => {
    playSound('click');
    loadNextQuiz();
  });
}

function updateAudioIcon() {
  DOM.audioIconOn.classList.toggle('hidden', state.audioMuted);
  DOM.audioIconOff.classList.toggle('hidden', !state.audioMuted);
}

// ==========================================
// VISTAS Y NAVEGACIÓN
// ==========================================
function switchView(viewName) {
  state.currentView = viewName;

  // Update tabs
  DOM.navTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
  });

  // Toggle view containers
  DOM.views.pokedex.classList.toggle('active', viewName === 'pokedex' || viewName === 'favorites');
  DOM.views.team.classList.toggle('active', viewName === 'team');
  DOM.views.quiz.classList.toggle('active', viewName === 'quiz');

  if (viewName === 'pokedex') {
    DOM.currentViewTitle.textContent = GENERATIONS[state.activeGen].title;
    renderPokemonGrid();
  } else if (viewName === 'favorites') {
    DOM.currentViewTitle.textContent = 'Mis Pokémon Favoritos';
    renderPokemonGrid();
  } else if (viewName === 'team') {
    renderTeamView();
  } else if (viewName === 'quiz') {
    if (!state.quizCurrentPokemon) {
      loadNextQuiz();
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// CARGA DE DATOS DESDE POKEAPI
// ==========================================
async function fetchPokemonData(idOrName) {
  const key = idOrName.toString().toLowerCase();
  if (state.pokemonCache.has(key)) {
    return state.pokemonCache.get(key);
  }

  try {
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${key}`);
    if (!res.ok) throw new Error(`Pokemon no encontrado: ${key}`);
    const data = await res.json();

    // Normalizar objeto simplificado
    const normalized = {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      artwork: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || '',
      shinyArtwork: data.sprites.other?.['official-artwork']?.front_shiny || data.sprites.front_shiny || '',
      height: (data.height / 10).toFixed(1), // m
      weight: (data.weight / 10).toFixed(1), // kg
      baseExp: data.base_experience,
      abilities: data.abilities.map(a => a.ability.name.replace('-', ' ')),
      stats: data.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      cry: data.cries?.latest || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`
    };

    state.pokemonCache.set(data.id, normalized);
    state.pokemonCache.set(data.name.toLowerCase(), normalized);
    return normalized;
  } catch (err) {
    console.error('Error fetching pokemon:', err);
    return null;
  }
}

async function fetchPokemonSpecies(id) {
  if (state.speciesCache.has(id)) {
    return state.speciesCache.get(id);
  }

  try {
    const res = await fetch(`${POKEAPI_BASE}/pokemon-species/${id}`);
    if (!res.ok) throw new Error('Species data not available');
    const data = await res.json();

    // Obtener texto en español o en inglés si no hay español
    const flavorEs = data.flavor_text_entries.find(f => f.language.name === 'es');
    const flavorEn = data.flavor_text_entries.find(f => f.language.name === 'en');
    const cleanFlavor = (flavorEs?.flavor_text || flavorEn?.flavor_text || 'Sin descripción registrada.')
      .replace(/[\f\n\r\t]/gm, ' ');

    const generaEs = data.genera.find(g => g.language.name === 'es')?.genus || 'Pokémon';

    const species = {
      flavorText: cleanFlavor,
      genera: generaEs
    };

    state.speciesCache.set(id, species);
    return species;
  } catch (err) {
    console.warn('Error fetching species info:', err);
    return {
      flavorText: 'Un misterioso Pokémon que habita en las diversas regiones del mundo Pokémon.',
      genera: 'Pokémon'
    };
  }
}

// Carga el lote inicial de Pokémon según la generación
async function loadInitialPokemons() {
  const genConfig = GENERATIONS[state.activeGen];
  state.currentOffset = genConfig.start;
  state.loadedPokemons = [];
  await loadMorePokemons();
}

async function loadMorePokemons() {
  if (state.isLoading) return;
  state.isLoading = true;
  DOM.loadingIndicator.classList.remove('hidden');
  DOM.btnLoadMore.disabled = true;

  const genConfig = GENERATIONS[state.activeGen];
  const startId = state.currentOffset;
  const countToLoad = Math.min(PAGE_SIZE, genConfig.end - startId + 1);

  if (countToLoad <= 0) {
    state.isLoading = false;
    DOM.loadingIndicator.classList.add('hidden');
    DOM.loadMoreContainer.classList.add('hidden');
    return;
  }

  const idsToFetch = [];
  for (let i = 0; i < countToLoad; i++) {
    idsToFetch.push(startId + i);
  }

  try {
    const fetched = await Promise.all(idsToFetch.map(id => fetchPokemonData(id)));
    const validPokemons = fetched.filter(p => p !== null);

    state.loadedPokemons.push(...validPokemons);
    state.currentOffset += countToLoad;

    renderPokemonGrid();

    // Check if reached end of generation
    const reachedEnd = state.currentOffset > genConfig.end;
    DOM.loadMoreContainer.classList.toggle('hidden', reachedEnd || state.currentView === 'favorites');
  } catch (err) {
    console.error('Error in batch load:', err);
    showToast('Error al conectar con la PokéAPI');
  } finally {
    state.isLoading = false;
    DOM.loadingIndicator.classList.add('hidden');
    DOM.btnLoadMore.disabled = false;
  }
}

function handleGenChange() {
  DOM.currentViewTitle.textContent = GENERATIONS[state.activeGen].title;
  loadInitialPokemons();
}

function handleFilterChange() {
  renderPokemonGrid();
}

function resetFilters() {
  DOM.searchInput.value = '';
  DOM.btnClearSearch.classList.add('hidden');
  state.searchQuery = '';
  state.activeType = 'all';
  state.activeGen = 'all';
  DOM.selectGen.value = 'all';
  DOM.selectSort.value = 'id-asc';
  state.sortBy = 'id-asc';

  document.querySelectorAll('.type-pill').forEach(p => {
    p.classList.remove('active');
    p.style.backgroundColor = '';
  });
  const allPill = document.querySelector('.type-pill[data-type="all"]');
  if (allPill) allPill.classList.add('active');

  loadInitialPokemons();
}

// ==========================================
// RENDERIZADO DE LA CUADRÍCULA POKÉMON
// ==========================================
function renderPokemonGrid() {
  let list = [...state.loadedPokemons];

  // Si estamos en vista Favoritos
  if (state.currentView === 'favorites') {
    list = list.filter(p => state.favorites.has(p.id));
    DOM.loadMoreContainer.classList.add('hidden');
  }

  // Filtrado por Tipo
  if (state.activeType !== 'all') {
    list = list.filter(p => p.types.includes(state.activeType));
  }

  // Filtrado por Búsqueda (Nombre o Número)
  if (state.searchQuery) {
    list = list.filter(p => {
      const matchName = p.name.toLowerCase().includes(state.searchQuery);
      const matchId = p.id.toString() === state.searchQuery || `#${p.id}`.includes(state.searchQuery);
      return matchName || matchId;
    });
  }

  // Ordenamiento
  list.sort((a, b) => {
    if (state.sortBy === 'id-asc') return a.id - b.id;
    if (state.sortBy === 'id-desc') return b.id - a.id;
    if (state.sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (state.sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  // Mostrar conteo
  const countText = list.length === 1 ? '1 Pokémon mostrado' : `${list.length} Pokémon mostrados`;
  DOM.resultCount.textContent = countText;

  // Manejo de estado vacío
  if (list.length === 0) {
    DOM.pokemonGrid.innerHTML = '';
    DOM.emptyState.classList.remove('hidden');
    return;
  }

  DOM.emptyState.classList.add('hidden');
  DOM.pokemonGrid.innerHTML = '';

  const fragment = document.createDocumentFragment();
  list.forEach(pokemon => {
    const card = createPokemonCardElement(pokemon);
    fragment.appendChild(card);
  });

  DOM.pokemonGrid.appendChild(fragment);
}

// Crea la tarjeta visual de un Pokémon
function createPokemonCardElement(pokemon) {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  const primaryType = pokemon.types[0];
  const primaryColor = TYPE_TRANSLATIONS[primaryType]?.color || '#3b82f6';

  card.style.setProperty('--card-accent', primaryColor);
  card.style.setProperty('--card-border-color', primaryColor + '66');
  card.style.setProperty('--card-glow', primaryColor + '40');

  const isFav = state.favorites.has(pokemon.id);
  const isInTeam = state.team.some(member => member.id === pokemon.id);
  const formattedId = `#${String(pokemon.id).padStart(3, '0')}`;

  const typesHtml = pokemon.types.map(t => {
    const tData = TYPE_TRANSLATIONS[t] || { name: t, color: '#64748b' };
    return `<span class="type-tag" style="background-color: ${tData.color};">${tData.name}</span>`;
  }).join('');

  card.innerHTML = `
    <div class="card-ambient"></div>
    <svg class="card-pokeball-bg" viewBox="0 0 100 100" fill="currentColor">
      <path d="M50 0 A50 50 0 0 0 0 50 A50 50 0 0 0 50 100 A50 50 0 0 0 100 50 A50 50 0 0 0 50 0 Z M50 90 A40 40 0 0 1 14 55 L35 55 A15 15 0 0 0 65 55 L86 55 A40 40 0 0 1 50 90 Z M50 10 A40 40 0 0 1 86 45 L65 45 A15 15 0 0 0 35 45 L14 45 A40 40 0 0 1 50 10 Z"/>
    </svg>
    <div class="card-top">
      <span class="card-number">${formattedId}</span>
      <div class="card-quick-actions">
        <button class="btn-icon-card ${isFav ? 'favorited' : ''}" data-action="favorite" title="Marcar como favorito">
          ♥
        </button>
        <button class="btn-icon-card ${isInTeam ? 'in-team' : ''}" data-action="team" title="Agregar a mi equipo">
          ${isInTeam ? '✓' : '+'}
        </button>
      </div>
    </div>
    <div class="card-image-wrapper">
      <img src="${pokemon.artwork}" alt="${pokemon.name}" class="card-pokemon-img" loading="lazy">
    </div>
    <div class="card-details">
      <h3 class="card-title">${pokemon.name}</h3>
      <div class="card-types">${typesHtml}</div>
    </div>
  `;

  // Interacción en la tarjeta
  card.addEventListener('click', (e) => {
    const favBtn = e.target.closest('[data-action="favorite"]');
    const teamBtn = e.target.closest('[data-action="team"]');

    if (favBtn) {
      e.stopPropagation();
      toggleFavorite(pokemon);
      favBtn.classList.toggle('favorited', state.favorites.has(pokemon.id));
      return;
    }

    if (teamBtn) {
      e.stopPropagation();
      toggleTeamMember(pokemon);
      const nowInTeam = state.team.some(m => m.id === pokemon.id);
      teamBtn.classList.toggle('in-team', nowInTeam);
      teamBtn.textContent = nowInTeam ? '✓' : '+';
      return;
    }

    playSound('open');
    openPokemonModal(pokemon);
  });

  return card;
}

// ==========================================
// MODAL DE DETALLES DEL POKÉMON
// ==========================================
async function openPokemonModal(pokemon) {
  state.modalPokemon = pokemon;
  state.isModalShiny = false;

  const primaryType = pokemon.types[0];
  const primaryColor = TYPE_TRANSLATIONS[primaryType]?.color || '#3b82f6';
  DOM.modalVisual.style.setProperty('--modal-accent', primaryColor);

  DOM.modalPokemonId.textContent = `#${String(pokemon.id).padStart(3, '0')}`;
  DOM.modalPokemonName.textContent = pokemon.name;
  DOM.modalPokemonImg.src = pokemon.artwork;
  DOM.shinyIndicator.classList.add('hidden');
  DOM.btnModalShiny.classList.remove('active-shiny');

  // Types
  DOM.modalTypes.innerHTML = pokemon.types.map(t => {
    const tData = TYPE_TRANSLATIONS[t] || { name: t, color: '#64748b' };
    return `<span class="type-tag" style="background-color: ${tData.color};">${tData.name}</span>`;
  }).join('');

  // Physical stats
  DOM.modalHeight.textContent = `${pokemon.height} m`;
  DOM.modalWeight.textContent = `${pokemon.weight} kg`;
  DOM.modalExp.textContent = pokemon.baseExp || '---';
  DOM.modalAbilities.textContent = pokemon.abilities.join(', ') || 'Desconocida';

  // Base Stats calculation
  let totalStats = 0;
  DOM.modalStatsList.innerHTML = pokemon.stats.map(s => {
    totalStats += s.value;
    const statLabel = STAT_NAMES[s.name] || s.name;
    const maxVal = 200; // Benchmark max stat
    const percent = Math.min(100, Math.round((s.value / maxVal) * 100));

    // Dynamic bar color based on stat strength
    let barColor = 'var(--accent-blue)';
    if (s.value >= 120) barColor = 'var(--accent-green)';
    else if (s.value >= 80) barColor = 'var(--accent-yellow)';
    else if (s.value < 50) barColor = 'var(--accent-red)';

    return `
      <div class="stat-item">
        <span class="stat-name">${statLabel}</span>
        <span class="stat-num">${s.value}</span>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width: ${percent}%; background-color: ${barColor};"></div>
        </div>
      </div>
    `;
  }).join('');
  DOM.modalStatsTotal.textContent = `Total: ${totalStats}`;

  // Fav and Team buttons state
  updateModalFavButton();
  updateModalTeamButton();

  // Show modal
  DOM.pokemonModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Fetch species flavor text asynchronously
  DOM.modalPokemonGenera.textContent = 'Buscando datos...';
  DOM.modalFlavorText.textContent = 'Consultando los archivos de la Pokédex...';
  const species = await fetchPokemonSpecies(pokemon.id);
  if (state.modalPokemon?.id === pokemon.id) {
    DOM.modalPokemonGenera.textContent = species.genera;
    DOM.modalFlavorText.textContent = species.flavorText;
  }
}

function closeModal() {
  DOM.pokemonModal.classList.add('hidden');
  document.body.style.overflow = '';
  state.modalPokemon = null;
  DOM.cryAudioPlayer.pause();
}

function toggleModalShiny() {
  if (!state.modalPokemon) return;
  playSound('click');
  state.isModalShiny = !state.isModalShiny;

  if (state.isModalShiny && state.modalPokemon.shinyArtwork) {
    DOM.modalPokemonImg.src = state.modalPokemon.shinyArtwork;
    DOM.btnModalShiny.classList.add('active-shiny');
    DOM.shinyIndicator.classList.remove('hidden');
  } else {
    DOM.modalPokemonImg.src = state.modalPokemon.artwork;
    DOM.btnModalShiny.classList.remove('active-shiny');
    DOM.shinyIndicator.classList.add('hidden');
  }
}

function playCurrentPokemonCry() {
  if (!state.modalPokemon) return;
  const cryUrl = state.modalPokemon.cry;
  if (!cryUrl) return;

  DOM.cryAudioPlayer.src = cryUrl;
  DOM.cryAudioPlayer.volume = state.audioMuted ? 0 : 0.6;
  DOM.cryAudioPlayer.play().catch(e => console.log('Audio playback prevented', e));

  // Pulse animation on cry button
  DOM.btnModalCry.style.transform = 'scale(1.25)';
  setTimeout(() => DOM.btnModalCry.style.transform = '', 300);
}

function updateModalFavButton() {
  if (!state.modalPokemon) return;
  const isFav = state.favorites.has(state.modalPokemon.id);
  DOM.btnModalFav.classList.toggle('active-fav', isFav);
}

function updateModalTeamButton() {
  if (!state.modalPokemon) return;
  const inTeam = state.team.some(m => m.id === state.modalPokemon.id);
  DOM.btnModalTeam.classList.toggle('in-team', inTeam);
  DOM.btnModalTeam.querySelector('span').textContent = inTeam ? 'En tu Equipo (Remover)' : 'Agregar al Equipo';
}

// ==========================================
// SISTEMA DE FAVORITOS
// ==========================================
function toggleFavorite(pokemon) {
  playSound('click');
  if (state.favorites.has(pokemon.id)) {
    state.favorites.delete(pokemon.id);
    showToast(`💔 ${pokemon.name} removido de favoritos`);
  } else {
    state.favorites.add(pokemon.id);
    playSound('success');
    showToast(`❤️ ¡${pokemon.name} agregado a favoritos!`);
  }
  saveFavorites();
  updateCounters();

  if (state.currentView === 'favorites') {
    renderPokemonGrid();
  }
}

function saveFavorites() {
  localStorage.setItem('pokesphere_favorites', JSON.stringify([...state.favorites]));
}

// ==========================================
// ARMAR EQUIPO (TEAM BUILDER)
// ==========================================
function toggleTeamMember(pokemon) {
  const index = state.team.findIndex(m => m.id === pokemon.id);

  if (index >= 0) {
    state.team.splice(index, 1);
    playSound('click');
    showToast(`Eliminado de tu equipo: ${pokemon.name}`);
  } else {
    if (state.team.length >= 6) {
      playSound('error');
      showToast('⚠️ Tu equipo ya tiene 6 Pokémon (máximo alcanzado)');
      return;
    }
    state.team.push(pokemon);
    playSound('success');
    showToast(`⚔️ ¡${pokemon.name} se unió a tu equipo!`);
  }

  saveTeam();
  updateCounters();
  if (state.currentView === 'team') {
    renderTeamView();
  }
}

function saveTeam() {
  localStorage.setItem('pokesphere_team', JSON.stringify(state.team));
}

function renderTeamView() {
  DOM.teamGrid.innerHTML = '';
  const totalSlots = 6;

  for (let i = 0; i < totalSlots; i++) {
    const member = state.team[i];
    const slotCard = document.createElement('div');

    if (member) {
      slotCard.className = 'team-slot filled';
      const typesHtml = member.types.map(t => {
        const tData = TYPE_TRANSLATIONS[t] || { name: t, color: '#64748b' };
        return `<span class="type-tag" style="background-color: ${tData.color};">${tData.name}</span>`;
      }).join('');

      slotCard.innerHTML = `
        <button class="team-slot-remove" data-id="${member.id}" title="Quitar del equipo">✕</button>
        <img src="${member.artwork}" alt="${member.name}" class="team-slot-img">
        <h4 class="team-slot-name">${member.name}</h4>
        <div class="team-slot-types">${typesHtml}</div>
      `;

      slotCard.querySelector('.team-slot-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTeamMember(member);
        renderTeamView();
      });

      slotCard.addEventListener('click', () => {
        playSound('open');
        openPokemonModal(member);
      });
    } else {
      slotCard.className = 'team-slot empty';
      slotCard.innerHTML = `
        <div class="team-slot-empty-content">
          <div class="team-slot-empty-icon">➕</div>
          <p class="team-slot-empty-text">Espacio Disponible</p>
        </div>
      `;
      slotCard.addEventListener('click', () => {
        switchView('pokedex');
        showToast('Elige un Pokémon y haz clic en "+" para agregarlo.');
      });
    }

    DOM.teamGrid.appendChild(slotCard);
  }

  // Render stats summary if team has members
  if (state.team.length > 0) {
    DOM.teamAnalysis.classList.remove('hidden');

    let totalHp = 0, totalAtk = 0, totalDef = 0, totalSpeed = 0;
    const coverageTypes = new Set();

    state.team.forEach(m => {
      m.types.forEach(t => coverageTypes.add(t));
      m.stats.forEach(s => {
        if (s.name === 'hp') totalHp += s.value;
        if (s.name === 'attack') totalAtk += s.value;
        if (s.name === 'defense') totalDef += s.value;
        if (s.name === 'speed') totalSpeed += s.value;
      });
    });

    const len = state.team.length;
    DOM.teamAvgHp.textContent = Math.round(totalHp / len);
    DOM.teamAvgAtk.textContent = Math.round(totalAtk / len);
    DOM.teamAvgDef.textContent = Math.round(totalDef / len);
    DOM.teamAvgSpeed.textContent = Math.round(totalSpeed / len);

    // Coverage badges
    DOM.teamTypeBadges.innerHTML = Array.from(coverageTypes).map(t => {
      const tData = TYPE_TRANSLATIONS[t] || { name: t, color: '#64748b' };
      return `<span class="type-tag" style="background-color: ${tData.color};">${tData.name}</span>`;
    }).join('');
  } else {
    DOM.teamAnalysis.classList.add('hidden');
  }
}

// ==========================================
// MINIJUEGO: ¿QUIÉN ES ESE POKÉMON?
// ==========================================
async function loadNextQuiz() {
  state.quizAnswered = false;
  DOM.quizStreak.textContent = state.quizStreak;
  DOM.quizHighScore.textContent = state.quizHighScore;
  DOM.quizRevealName.classList.add('hidden');
  DOM.quizPokemonImg.classList.add('silhouette');
  DOM.quizPokemonImg.classList.remove('revealed');
  DOM.quizOptions.innerHTML = '<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Preparando desafío...</p>';

  // Pick random target from popular range (1-386) for classic fun
  const targetId = Math.floor(Math.random() * 386) + 1;
  const targetPokemon = await fetchPokemonData(targetId);

  if (!targetPokemon) {
    DOM.quizOptions.innerHTML = '<p>Error al cargar el Pokémon. Intenta de nuevo.</p>';
    return;
  }

  state.quizCurrentPokemon = targetPokemon;
  DOM.quizPokemonImg.src = targetPokemon.artwork;

  // Pick 3 random distractors
  const distractors = [];
  while (distractors.length < 3) {
    const randId = Math.floor(Math.random() * 386) + 1;
    if (randId !== targetId && !distractors.includes(randId)) {
      distractors.push(randId);
    }
  }

  const distractorData = await Promise.all(distractors.map(id => fetchPokemonData(id)));
  const allChoices = [targetPokemon, ...distractorData.filter(d => d !== null)];

  // Shuffle choices
  allChoices.sort(() => Math.random() - 0.5);

  DOM.quizOptions.innerHTML = '';
  allChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = choice.name;
    btn.addEventListener('click', () => handleQuizGuess(choice.id, btn));
    DOM.quizOptions.appendChild(btn);
  });
}

function handleQuizGuess(chosenId, btnElement) {
  if (state.quizAnswered) return;
  state.quizAnswered = true;

  // Reveal artwork
  DOM.quizPokemonImg.classList.remove('silhouette');
  DOM.quizPokemonImg.classList.add('revealed');
  DOM.quizRevealName.textContent = `¡Es ${state.quizCurrentPokemon.name.toUpperCase()}!`;
  DOM.quizRevealName.classList.remove('hidden');

  // Play target pokemon cry
  if (state.quizCurrentPokemon.cry) {
    DOM.cryAudioPlayer.src = state.quizCurrentPokemon.cry;
    DOM.cryAudioPlayer.volume = state.audioMuted ? 0 : 0.6;
    DOM.cryAudioPlayer.play().catch(e => console.log('Audio playback prevented', e));
  }

  const isCorrect = chosenId === state.quizCurrentPokemon.id;

  if (isCorrect) {
    playSound('success');
    btnElement.classList.add('correct');
    state.quizStreak++;
    if (state.quizStreak > state.quizHighScore) {
      state.quizHighScore = state.quizStreak;
      localStorage.setItem('pokesphere_quiz_high', state.quizHighScore);
    }
    showToast(`🎉 ¡Correcto! Racha: ${state.quizStreak}`);
  } else {
    playSound('error');
    btnElement.classList.add('wrong');
    // Highlight correct button
    document.querySelectorAll('.quiz-option-btn').forEach(btn => {
      if (btn.textContent.toLowerCase() === state.quizCurrentPokemon.name.toLowerCase()) {
        btn.classList.add('correct');
      }
    });
    showToast(`❌ ¡Fallaste! Era ${state.quizCurrentPokemon.name}`);
    state.quizStreak = 0;
  }

  DOM.quizStreak.textContent = state.quizStreak;
  DOM.quizHighScore.textContent = state.quizHighScore;

  // Disable buttons
  document.querySelectorAll('.quiz-option-btn').forEach(b => b.disabled = true);
}

// ==========================================
// UTILIDADES ADICIONALES
// ==========================================
async function openRandomPokemon() {
  playSound('click');
  const randomId = Math.floor(Math.random() * MAX_POKEMON) + 1;
  showToast(`🎲 Buscando Pokémon aleatorio #${randomId}...`);
  const pokemon = await fetchPokemonData(randomId);
  if (pokemon) {
    playSound('open');
    openPokemonModal(pokemon);
  }
}

function updateCounters() {
  DOM.favCount.textContent = state.favorites.size;
  DOM.teamCount.textContent = `${state.team.length}/6`;
}

let toastTimer = null;
function showToast(message) {
  DOM.toast.textContent = message;
  DOM.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    DOM.toast.classList.add('hidden');
  }, 2500);
}
