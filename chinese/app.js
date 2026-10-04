/**
 * 中央 Chinese - Clean Character Connection & Reading Practice
 * Mobile-first & laptop optimized.
 */

// Application State
const state = {
  cards: [],            // Array of [english, pinyin, hanzi]
  characters: {},       // Map: char -> { p, d, r, dec, e, f, w, c }
  commonMissing: [],    // Curated slang & missing spoken words
  currentCardIdx: 0,
  cardRevealed: false,
  activeView: 'cards',  // 'cards', 'chars', 'slang'
  selectedChar: null,
  modalOpen: false,
  charFilter: 'freq',   // 'freq', 'least', 'top100', 'top500', 'pinyin'
  charSearchQuery: '',
  renderedCharCount: 180,
  drawerShortestFirst: true,
  activeCompoundFilter: null,
  slangFilter: 'all',
  slangSearchQuery: ''
};

// DOM Cache
const DOM = {};

document.addEventListener('DOMContentLoaded', async () => {
  cacheDOMElements();
  initLocalStorage();
  setupEventListeners();
  setupKeyboardShortcuts();

  try {
    await loadData();
    hideLoading();
    renderCardView();
    renderCharDirectory();
    renderSlangView();
  } catch (err) {
    console.error('Error loading data:', err);
    DOM.loadingText.textContent = 'Error loading dataset: ' + err.message;
  }
});

function cacheDOMElements() {
  DOM.loadingScreen = document.getElementById('loading-screen');
  DOM.loadingText = document.getElementById('loading-text');

  // Views
  DOM.viewCards = document.getElementById('view-cards');
  DOM.viewChars = document.getElementById('view-chars');
  DOM.viewSlang = document.getElementById('view-slang');

  // Navigation
  DOM.desktopNavTabs = document.querySelectorAll('.nav-tab');
  DOM.bottomNavItems = document.querySelectorAll('.bottom-nav-item');

  // Card Study
  DOM.cardHanzi = document.getElementById('card-hanzi');
  DOM.cardPinyin = document.getElementById('card-pinyin');
  DOM.cardEnglish = document.getElementById('card-english');
  DOM.cardCounter = document.getElementById('card-counter');
  DOM.cardProgressBar = document.getElementById('card-progress-bar');
  DOM.revealBtn = document.getElementById('card-reveal-btn');
  DOM.prevCardBtn = document.getElementById('prev-card-btn');
  DOM.nextCardBtn = document.getElementById('next-card-btn');
  DOM.randomCardBtn = document.getElementById('random-card-btn');

  // Character Directory & Search
  DOM.charSearchInput = document.getElementById('char-search-input');
  DOM.charSearchClearBtn = document.getElementById('char-search-clear-btn');
  DOM.charFilterPills = document.querySelectorAll('.filter-pill');
  DOM.charResultInfo = document.getElementById('char-result-info');
  DOM.charGrid = document.getElementById('char-grid');
  DOM.loadMoreCharsBtn = document.getElementById('load-more-chars-btn');

  // Slang View
  DOM.slangSearchInput = document.getElementById('slang-search-input');
  DOM.slangGrid = document.getElementById('slang-grid');
  DOM.slangCount = document.getElementById('slang-count');
  DOM.slangFilterPills = document.querySelectorAll('.slang-filter-pill');

  // Character Centered Modal
  DOM.modalBackdrop = document.getElementById('char-modal-backdrop');
  DOM.modalCloseBtn = document.getElementById('modal-close-btn');
  DOM.heroHz = document.getElementById('hero-hz');
  DOM.heroPy = document.getElementById('hero-py');
  DOM.heroDef = document.getElementById('hero-def');
  DOM.heroFreq = document.getElementById('hero-freq');
  DOM.heroRad = document.getElementById('hero-rad');
  DOM.heroDecomp = document.getElementById('hero-decomp');
  DOM.heroEtym = document.getElementById('hero-etym');
  DOM.compoundPills = document.getElementById('compound-pills');
  DOM.activeFilterBar = document.getElementById('active-filter-bar');
  DOM.activeFilterText = document.getElementById('active-filter-text');
  DOM.resetFilterBtn = document.getElementById('reset-filter-btn');
  DOM.crossCardsList = document.getElementById('cross-cards-list');
  DOM.crossCardsCount = document.getElementById('cross-cards-count');
  DOM.crossSortBtn = document.getElementById('cross-sort-btn');
}

function initLocalStorage() {
  const savedCardIdx = localStorage.getItem('cn_last_card_idx');
  if (savedCardIdx !== null) {
    const num = parseInt(savedCardIdx, 10);
    if (!isNaN(num)) state.currentCardIdx = num;
  }
}

// Load data files
async function loadData() {
  DOM.loadingText.textContent = 'Loading 8,140 cards and 2,812 characters...';

  // 1. Check window bundles first (allows zero-server file:/// double-clicking)
  if (window.CARDS_DATA && window.CHARS_DATA) {
    state.cards = window.CARDS_DATA;
    state.characters = window.CHARS_DATA;
    state.commonMissing = window.COMMON_MISSING || [];
    console.log(`Loaded from script bundles: ${state.cards.length} cards, ${Object.keys(state.characters).length} characters.`);
    return;
  }

  // 2. Fallback to fetch for server/GitHub Pages
  const [cardsRes, charsRes, slangRes] = await Promise.all([
    fetch('data/cards.json'),
    fetch('data/characters.json'),
    fetch('data/common_missing.json').catch(() => null)
  ]);

  if (!cardsRes.ok || !charsRes.ok) {
    throw new Error('Failed to fetch data files from /data/');
  }

  state.cards = await cardsRes.json();
  state.characters = await charsRes.json();
  if (slangRes && slangRes.ok) {
    state.commonMissing = await slangRes.json();
  }
}

function hideLoading() {
  if (DOM.loadingScreen) {
    DOM.loadingScreen.classList.add('hidden');
    setTimeout(() => {
      DOM.loadingScreen.style.display = 'none';
    }, 350);
  }
}

// Navigation between views
function switchView(viewName) {
  state.activeView = viewName;

  DOM.viewCards.classList.toggle('active', viewName === 'cards');
  DOM.viewChars.classList.toggle('active', viewName === 'chars');
  DOM.viewSlang.classList.toggle('active', viewName === 'slang');

  DOM.desktopNavTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
  });
  DOM.bottomNavItems.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
  });

  if (viewName === 'cards') renderCardView();
  if (viewName === 'chars') {
    renderCharDirectory();
  }
  if (viewName === 'slang') renderSlangView();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Normalize pinyin for tone-insensitive search: wǔ -> wu, míng -> ming
function normalizePinyin(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ü/g, 'u')
    .replace(/v/g, 'u');
}

// ========================================================
// 1. Card Practice / Reading View
// ========================================================
function renderCardView() {
  if (!state.cards || state.cards.length === 0) return;
  const card = state.cards[state.currentCardIdx];
  const [en, py, hz] = card;

  DOM.cardCounter.textContent = `Card #${(state.currentCardIdx + 1).toLocaleString()} / ${state.cards.length.toLocaleString()}`;
  const pct = (((state.currentCardIdx + 1) / state.cards.length) * 100).toFixed(1);
  DOM.cardProgressBar.style.width = `${pct}%`;

  DOM.cardHanzi.innerHTML = '';
  for (const ch of hz) {
    if (/[\u4e00-\u9fff]/.test(ch)) {
      const span = document.createElement('span');
      span.className = 'hanzi-char' + (state.selectedChar === ch ? ' selected' : '');
      span.textContent = ch;
      span.title = `Tap to inspect '${ch}'`;
      span.onclick = (e) => {
        e.stopPropagation();
        openCharModal(ch);
      };
      DOM.cardHanzi.appendChild(span);
    } else {
      DOM.cardHanzi.appendChild(document.createTextNode(ch));
    }
  }

  DOM.cardPinyin.textContent = py;
  DOM.cardEnglish.textContent = en;

  state.cardRevealed = false;
  DOM.cardPinyin.classList.add('card-blurred');
  DOM.cardEnglish.classList.add('card-blurred');
  DOM.revealBtn.style.display = 'inline-block';
  DOM.revealBtn.textContent = 'Reveal Answer (Space)';

  localStorage.setItem('cn_last_card_idx', state.currentCardIdx);
}

function revealCard() {
  state.cardRevealed = true;
  DOM.cardPinyin.classList.remove('card-blurred');
  DOM.cardEnglish.classList.remove('card-blurred');
  DOM.revealBtn.style.display = 'none';
}

function nextCard() {
  state.currentCardIdx = (state.currentCardIdx + 1) % state.cards.length;
  renderCardView();
}

function prevCard() {
  state.currentCardIdx = (state.currentCardIdx - 1 + state.cards.length) % state.cards.length;
  renderCardView();
}

function randomCard() {
  state.currentCardIdx = Math.floor(Math.random() * state.cards.length);
  renderCardView();
}

// ========================================================
// 2. Character Directory & Integrated Search
// ========================================================
function renderCharDirectory(resetCount = true) {
  if (!state.characters || Object.keys(state.characters).length === 0) return;
  if (resetCount) state.renderedCharCount = 180;

  let charList = Object.keys(state.characters);
  const rawQ = state.charSearchQuery.trim();

  // Check if search contains Chinese characters (Sentence pasting / OR logic)
  const hanziMatches = rawQ.match(/[\u4e00-\u9fff]/g);

  if (hanziMatches && hanziMatches.length > 0) {
    // Preserve appearance order and filter to deck characters
    const uniqueInputChars = [...new Set(hanziMatches)];
    charList = uniqueInputChars.filter(ch => !!state.characters[ch]);
    DOM.charResultInfo.textContent = `Showing ${charList.length} character${charList.length === 1 ? '' : 's'} from your text found in deck:`;
  } else if (rawQ) {
    // Sound search (normalized pinyin) OR English definition search
    const normQ = normalizePinyin(rawQ);
    const lowerQ = rawQ.toLowerCase();

    charList = charList.filter(ch => {
      const info = state.characters[ch];
      if (!info) return false;

      // Pinyin search (tone-insensitive, handles "wu", "de", "ming" perfectly)
      const pystrs = (info.p || []).map(p => normalizePinyin(p));
      const pyMatches = pystrs.some(p => p.includes(normQ));

      // English meaning search
      const defMatches = (info.d || '').toLowerCase().includes(lowerQ);

      return pyMatches || defMatches;
    });

    // Apply sorting to search results
    applyCharSorting(charList);
    DOM.charResultInfo.textContent = `Found ${charList.length} character${charList.length === 1 ? '' : 's'} matching "${rawQ}":`;
  } else {
    // Empty search: apply selected filter & sorting
    applyCharSorting(charList);

    if (state.charFilter === 'top100') {
      charList = charList.slice(0, 100);
      DOM.charResultInfo.textContent = `Top 100 most frequent characters in deck:`;
    } else if (state.charFilter === 'top500') {
      charList = charList.slice(0, 500);
      DOM.charResultInfo.textContent = `Top 500 most frequent characters in deck:`;
    } else if (state.charFilter === 'least') {
      DOM.charResultInfo.textContent = `All 2,812 characters ordered by LEAST frequent first:`;
    } else {
      DOM.charResultInfo.textContent = `All 2,812 characters ordered by MOST frequent first:`;
    }
  }

  // Slice for responsive rendering
  const totalMatches = charList.length;
  const toRender = charList.slice(0, state.renderedCharCount);

  DOM.charGrid.innerHTML = '';
  if (toRender.length === 0) {
    DOM.charGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.9rem;">
        No characters found. Try searching pinyin sounds (e.g. "wu", "de") or paste a sentence!
      </div>
    `;
    DOM.loadMoreCharsBtn.style.display = 'none';
    return;
  }

  toRender.forEach(ch => {
    const info = state.characters[ch];
    const tile = document.createElement('div');
    tile.className = 'char-tile';

    const py = info.p && info.p.length > 0 ? info.p[0] : '';

    tile.innerHTML = `
      <div class="tile-hz">${ch}</div>
      <div class="tile-py">${py}</div>
      <div class="tile-freq">${info.f} cards</div>
    `;

    tile.onclick = () => openCharModal(ch);
    DOM.charGrid.appendChild(tile);
  });

  // Load more button visibility
  if (state.renderedCharCount < totalMatches) {
    DOM.loadMoreCharsBtn.style.display = 'block';
    DOM.loadMoreCharsBtn.textContent = `Load More (${(totalMatches - state.renderedCharCount).toLocaleString()} remaining)`;
  } else {
    DOM.loadMoreCharsBtn.style.display = 'none';
  }
}

function applyCharSorting(list) {
  if (state.charFilter === 'least') {
    list.sort((a, b) => state.characters[a].f - state.characters[b].f);
  } else if (state.charFilter === 'pinyin') {
    list.sort((a, b) => {
      const pyA = (state.characters[a].p || [''])[0];
      const pyB = (state.characters[b].p || [''])[0];
      return pyA.localeCompare(pyB);
    });
  } else {
    // Default: most frequent first
    list.sort((a, b) => state.characters[b].f - state.characters[a].f);
  }
}

function setCharFilter(filterType) {
  state.charFilter = filterType;
  DOM.charFilterPills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.filter === filterType);
  });
  renderCharDirectory(true);
}

function loadMoreChars() {
  state.renderedCharCount += 240;
  renderCharDirectory(false);
}

// ========================================================
// 3. Common Words & Modern Slang View
// ========================================================
function renderSlangView() {
  let list = [...(state.commonMissing || [])];

  // Category filter
  if (state.slangFilter !== 'all') {
    list = list.filter(item => item.category.toLowerCase().includes(state.slangFilter.toLowerCase()));
  }

  // Search filter
  const q = state.slangSearchQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(item => 
      item.word.includes(q) ||
      (item.alt && item.alt.includes(q)) ||
      normalizePinyin(item.pinyin).includes(normalizePinyin(q)) ||
      item.meaning.toLowerCase().includes(q) ||
      (item.note && item.note.toLowerCase().includes(q))
    );
  }

  DOM.slangCount.textContent = `${list.length} words & phrases`;
  DOM.slangGrid.innerHTML = '';

  if (list.length === 0) {
    DOM.slangGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
        No slang or common words found matching "${state.slangSearchQuery}".
      </div>
    `;
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'slang-card';

    // Build interactive example sentence Hanzi
    const exHzEl = document.createElement('div');
    exHzEl.className = 'slang-ex-hz';
    for (const ch of item.example_hz) {
      if (/[\u4e00-\u9fff]/.test(ch)) {
        const span = document.createElement('span');
        span.className = 'hanzi-char';
        span.textContent = ch;
        span.onclick = (e) => {
          e.stopPropagation();
          openCharModal(ch);
        };
        exHzEl.appendChild(span);
      } else {
        exHzEl.appendChild(document.createTextNode(ch));
      }
    }

    card.innerHTML = `
      <div>
        <div class="slang-header">
          <div style="display: flex; align-items: baseline; gap: 0.65rem;">
            <span class="slang-word">${item.word}</span>
            <span class="slang-py">${item.pinyin}</span>
          </div>
          <span class="slang-badge">${item.category}</span>
        </div>
        <div class="slang-meaning" style="margin-top: 0.35rem;">${item.meaning}</div>
        <div class="slang-note" style="margin-top: 0.6rem;">💡 ${item.note}</div>
      </div>
      <div class="slang-example">
        <div class="ex-hz-container"></div>
        <div class="slang-ex-py">${item.example_py}</div>
        <div class="slang-ex-en">${item.example_en}</div>
      </div>
    `;

    card.querySelector('.ex-hz-container').replaceWith(exHzEl);
    DOM.slangGrid.appendChild(card);
  });
}

function setSlangFilter(cat) {
  state.slangFilter = cat;
  DOM.slangFilterPills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.filter === cat);
  });
  renderSlangView();
}

// ========================================================
// 4. Centered Full-Screen Character Overlay Modal
// ========================================================
function openCharModal(ch) {
  state.selectedChar = ch;
  state.activeCompoundFilter = null; // Reset compound filter when opening character

  const info = state.characters[ch] || {
    p: ['?'],
    d: 'Character found in deck',
    r: '一',
    dec: ch,
    e: 'Component breakdown available in compiled dataset.',
    f: 1,
    w: [],
    c: []
  };

  DOM.heroHz.textContent = ch;
  DOM.heroPy.textContent = (info.p || []).join(', ');
  DOM.heroDef.textContent = info.d || 'No definition available.';
  DOM.heroFreq.textContent = `${info.f} cards in deck`;
  DOM.heroRad.textContent = `Radical: ${info.r || '部首'}`;
  DOM.heroDecomp.textContent = info.dec || '';
  DOM.heroEtym.textContent = info.e || 'Standard pictographic or ideographic component.';

  // Hide active filter bar initially
  DOM.activeFilterBar.style.display = 'none';

  // Render compound word pills
  renderCompoundPills(info.w || [], ch);

  // Render cross-deck cards
  renderModalCrossCards(info.c || [], ch);

  // Open modal
  state.modalOpen = true;
  DOM.modalBackdrop.classList.add('open');
}

function closeCharModal() {
  state.modalOpen = false;
  DOM.modalBackdrop.classList.remove('open');
}

function renderCompoundPills(words, targetChar) {
  DOM.compoundPills.innerHTML = '';
  if (!words || words.length === 0) {
    DOM.compoundPills.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">No common compounds extracted in deck.</span>';
    return;
  }

  words.forEach(([word, count]) => {
    const pill = document.createElement('button');
    pill.className = 'compound-pill' + (state.activeCompoundFilter === word ? ' active' : '');
    pill.innerHTML = `<span>${word}</span><span class="count">(${count})</span>`;
    pill.title = `Click to filter cards to only "${word}"`;

    pill.onclick = () => {
      if (state.activeCompoundFilter === word) {
        // Toggle off
        state.activeCompoundFilter = null;
        DOM.activeFilterBar.style.display = 'none';
      } else {
        // Filter to this compound
        state.activeCompoundFilter = word;
        DOM.activeFilterText.textContent = `Showing cards containing: "${word}"`;
        DOM.activeFilterBar.style.display = 'flex';
      }

      // Re-render pills and cards
      renderCompoundPills(words, targetChar);
      const info = state.characters[targetChar];
      renderModalCrossCards(info ? info.c : [], targetChar);
    };

    DOM.compoundPills.appendChild(pill);
  });
}

function renderModalCrossCards(cardIndices, targetChar) {
  let list = [...cardIndices];

  // Filter by active compound word if selected
  if (state.activeCompoundFilter) {
    const filterWord = state.activeCompoundFilter;
    list = list.filter(idx => state.cards[idx][2].includes(filterWord));
  }

  // Sort
  if (state.drawerShortestFirst) {
    list.sort((a, b) => state.cards[a][2].length - state.cards[b][2].length);
  }

  const titleSuffix = state.activeCompoundFilter ? ` with "${state.activeCompoundFilter}"` : '';
  DOM.crossCardsCount.textContent = `Cards${titleSuffix} (${list.length})`;
  DOM.crossCardsList.innerHTML = '';

  if (list.length === 0) {
    DOM.crossCardsList.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No cards found matching this filter.</div>';
    return;
  }

  // Render cards (up to 80 for instant performance)
  list.slice(0, 80).forEach(idx => {
    const [en, py, hz] = state.cards[idx];
    const item = document.createElement('div');
    item.className = 'cross-card-item';

    const hzEl = document.createElement('div');
    hzEl.className = 'cross-card-hz';

    for (const c of hz) {
      if (/[\u4e00-\u9fff]/.test(c)) {
        const span = document.createElement('span');
        const isTarget = (c === targetChar);
        const isCompound = state.activeCompoundFilter && state.activeCompoundFilter.includes(c);

        span.className = 'hanzi-char' + 
          (isTarget ? ' match-highlight' : '') + 
          (isCompound && !isTarget ? ' compound-highlight' : '');
        span.textContent = c;
        span.title = `Tap to inspect '${c}'`;

        span.onclick = (e) => {
          e.stopPropagation();
          // Recursive navigation to other character!
          openCharModal(c);
        };
        hzEl.appendChild(span);
      } else {
        hzEl.appendChild(document.createTextNode(c));
      }
    }

    const pyEl = document.createElement('div');
    pyEl.className = 'cross-card-py';
    pyEl.textContent = py;

    const enEl = document.createElement('div');
    enEl.className = 'cross-card-en';
    enEl.textContent = en;

    item.appendChild(hzEl);
    item.appendChild(pyEl);
    item.appendChild(enEl);

    // Clicking card opens it in study mode
    item.onclick = (e) => {
      if (e.target.classList.contains('hanzi-char')) return;
      closeCharModal();
      state.currentCardIdx = idx;
      switchView('cards');
    };

    DOM.crossCardsList.appendChild(item);
  });
}

function toggleModalSort() {
  state.drawerShortestFirst = !state.drawerShortestFirst;
  DOM.crossSortBtn.textContent = state.drawerShortestFirst ? 'Shortest first ↕' : 'Original order ↕';
  if (state.selectedChar && state.characters[state.selectedChar]) {
    renderModalCrossCards(state.characters[state.selectedChar].c || [], state.selectedChar);
  }
}

function resetCompoundFilter() {
  state.activeCompoundFilter = null;
  DOM.activeFilterBar.style.display = 'none';
  if (state.selectedChar && state.characters[state.selectedChar]) {
    const info = state.characters[state.selectedChar];
    renderCompoundPills(info.w || [], state.selectedChar);
    renderModalCrossCards(info.c || [], state.selectedChar);
  }
}

// ========================================================
// Event Listeners & Keyboard Shortcuts
// ========================================================
function setupEventListeners() {
  // Navigation
  DOM.desktopNavTabs.forEach(tab => {
    tab.onclick = () => switchView(tab.dataset.view);
  });
  DOM.bottomNavItems.forEach(item => {
    item.onclick = () => switchView(item.dataset.view);
  });

  // Card Study controls
  DOM.revealBtn.onclick = revealCard;
  DOM.prevCardBtn.onclick = prevCard;
  DOM.nextCardBtn.onclick = nextCard;
  DOM.randomCardBtn.onclick = randomCard;

  // Character Search & Filters
  DOM.charSearchInput.addEventListener('input', (e) => {
    state.charSearchQuery = e.target.value;
    DOM.charSearchClearBtn.style.display = e.target.value ? 'block' : 'none';
    renderCharDirectory(true);
  });

  DOM.charSearchClearBtn.onclick = () => {
    DOM.charSearchInput.value = '';
    state.charSearchQuery = '';
    DOM.charSearchClearBtn.style.display = 'none';
    renderCharDirectory(true);
    DOM.charSearchInput.focus();
  };

  DOM.charFilterPills.forEach(pill => {
    pill.onclick = () => setCharFilter(pill.dataset.filter);
  });

  DOM.loadMoreCharsBtn.onclick = loadMoreChars;

  // Slang View Filters
  DOM.slangFilterPills.forEach(pill => {
    pill.onclick = () => setSlangFilter(pill.dataset.filter);
  });

  DOM.slangSearchInput.addEventListener('input', (e) => {
    state.slangSearchQuery = e.target.value;
    renderSlangView();
  });

  // Centered Modal controls
  DOM.modalCloseBtn.onclick = closeCharModal;
  DOM.modalBackdrop.onclick = (e) => {
    if (e.target === DOM.modalBackdrop) closeCharModal();
  };
  DOM.crossSortBtn.onclick = toggleModalSort;
  DOM.resetFilterBtn.onclick = resetCompoundFilter;
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      if (e.key === 'Escape') {
        e.target.blur();
        closeCharModal();
      }
      return;
    }

    if (e.key === 'Escape') {
      if (state.modalOpen) closeCharModal();
    } else if (e.key === ' ') {
      e.preventDefault();
      if (state.activeView === 'cards') {
        if (!state.cardRevealed) revealCard();
        else nextCard();
      }
    } else if (e.key === 'ArrowRight') {
      if (state.activeView === 'cards') nextCard();
    } else if (e.key === 'ArrowLeft') {
      if (state.activeView === 'cards') prevCard();
    } else if (e.key === '/') {
      e.preventDefault();
      switchView('chars');
      DOM.charSearchInput.focus();
    }
  });
}
