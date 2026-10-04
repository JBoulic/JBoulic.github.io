/**
 * 中央 Chinese — Card Practice, Character Explorer & Spoken Slang
 */

// Standard Mandarin pinyin syllables for query validation
const VALID_SYLLABLES = new Set([
  "a","ai","an","ang","ao","ba","bai","ban","bang","bao","bei","ben","beng","bi","bian","biao","bie","bin","bing","bo","bu",
  "ca","cai","can","cang","cao","ce","cen","ceng","cha","chai","chan","chang","chao","che","chen","cheng","chi","chong","chou","chu","chua","chuai","chuan","chuang","chui","chun","chuo","ci","cong","cou","cu","cuan","cui","cun","cuo",
  "da","dai","dan","dang","dao","de","dei","den","deng","di","dia","dian","diao","die","ding","diu","dong","dou","du","duan","dui","dun","duo",
  "e","ei","en","eng","er",
  "fa","fan","fang","fei","fen","feng","fo","fou","fu",
  "ga","gai","gan","gang","gao","ge","gei","gen","geng","gong","gou","gu","gua","guai","guan","guang","gui","gun","guo",
  "ha","hai","han","hang","hao","he","hei","hen","heng","hong","hou","hu","hua","huai","huan","huang","hui","hun","huo",
  "ji","jia","jian","jiang","jiao","jie","jin","jing","jiong","jiu","ju","juan","jue","jun",
  "ka","kai","kan","kang","kao","ke","kei","ken","keng","kong","kou","ku","kua","kuai","kuan","kuang","kui","kun","kuo",
  "la","lai","lan","lang","lao","le","lei","leng","li","lia","lian","liang","liao","lie","lin","ling","liu","lo","long","lou","lu","luan","lun","luo","lv","lve",
  "ma","mai","man","mang","mao","me","mei","men","meng","mi","mian","miao","mie","min","ming","miu","mo","mou","mu",
  "na","nai","nan","nang","nao","ne","nei","nen","neng","ni","nian","niang","niao","nie","nin","ning","niu","nong","nou","nu","nuan","nun","nuo","nv","nve",
  "o","ou",
  "pa","pai","pan","pang","pao","pei","pen","peng","pi","pian","piao","pie","pin","ping","po","pou","pu",
  "qi","qia","qian","qiang","qiao","qie","qin","qing","qiong","qiu","qu","quan","que","qun",
  "ran","rang","rao","re","ren","reng","ri","rong","rou","ru","rua","ruan","rui","run","ruo",
  "sa","sai","san","sang","sao","se","sen","seng","sha","shai","shan","shang","shao","she","shei","shen","sheng","shi","shou","shu","shua","shuai","shuan","shuang","shui","shun","shuo","si","song","sou","su","suan","sui","sun","suo",
  "ta","tai","tan","tang","tao","te","tei","teng","ti","tian","tiao","tie","ting","tong","tou","tu","tuan","tui","tun","tuo",
  "wa","wai","wan","wang","wei","wen","weng","wo","wu",
  "xi","xia","xian","xiang","xiao","xie","xin","xing","xiong","xiu","xu","xuan","xue","xun",
  "ya","yan","yang","yao","ye","yi","yin","ying","yo","yong","you","yu","yuan","yue","yun",
  "za","zai","zan","zang","zao","ze","zei","zen","zeng","zha","zhai","zhan","zhang","zhao","zhe","zhei","zhen","zheng","zhi","zhong","zhou","zhu","zhua","zhuai","zhuan","zhuang","zhui","zhun","zhuo","zi","zong","zou","zu","zuan","zui","zun","zuo"
]);

// Segment a bare pinyin string (no tones) into valid syllables greedily longest-first
function segmentPinyin(word) {
  word = word.toLowerCase().replace(/ü/g,'v').replace(/u:/g,'v');
  const n = word.length;
  function helper(i) {
    if (i === n) return [];
    for (let len = Math.min(6, n - i); len >= 1; len--) {
      const sub = word.slice(i, i + len);
      if (VALID_SYLLABLES.has(sub)) {
        const rest = helper(i + len);
        if (rest !== null) return [sub, ...rest];
      }
    }
    return null;
  }
  return helper(0);
}

// Parse user query — spaces separate groups, each group must fully segment
function parsePinyinQuery(q) {
  const parts = q.trim().split(/\s+/);
  const all = [];
  for (const p of parts) {
    const seg = segmentPinyin(p);
    if (!seg) return null;
    all.push(...seg);
  }
  return all.length ? all : null;
}

// Strip tone marks: wǒ → wo, nǐ → ni
function stripTones(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ü/g,'v');
}

// App State
const state = {
  cards: [],
  characters: {},
  commonMissing: [],
  currentCardIdx: 0,
  cardRevealed: false,
  activeView: 'cards',
  selectedChar: null,
  modalOpen: false,
  charFilter: 'freq',    // 'freq' | 'least'
  charSearchQuery: '',
  charPage: 1,
  charPageSize: 120,
  activeCompoundFilter: null,
  slangSearchQuery: '',
  slangFilter: 'all',
};

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
    console.error(err);
    DOM.loadingText.textContent = 'Error: ' + err.message;
  }
});

function cacheDOMElements() {
  DOM.loadingScreen = document.getElementById('loading-screen');
  DOM.loadingText   = document.getElementById('loading-text');

  DOM.viewCards = document.getElementById('view-cards');
  DOM.viewChars = document.getElementById('view-chars');
  DOM.viewSlang = document.getElementById('view-slang');

  DOM.desktopNavTabs  = document.querySelectorAll('.nav-tab');
  DOM.bottomNavItems  = document.querySelectorAll('.bottom-nav-item');

  // Cards
  DOM.cardHanzi       = document.getElementById('card-hanzi');
  DOM.cardPinyin      = document.getElementById('card-pinyin');
  DOM.cardEnglish     = document.getElementById('card-english');
  DOM.cardCounter     = document.getElementById('card-counter');
  DOM.cardProgressBar = document.getElementById('card-progress-bar');
  DOM.revealBtn       = document.getElementById('card-reveal-btn');
  DOM.prevCardBtn     = document.getElementById('prev-card-btn');
  DOM.nextCardBtn     = document.getElementById('next-card-btn');
  DOM.randomCardBtn   = document.getElementById('random-card-btn');

  // Chars
  DOM.charSearchInput    = document.getElementById('char-search-input');
  DOM.charSearchClearBtn = document.getElementById('char-search-clear-btn');
  DOM.charSearchFeedback = document.getElementById('char-search-feedback');
  DOM.freqToggleBtn      = document.getElementById('freq-toggle-btn');
  DOM.charResultInfo     = document.getElementById('char-result-info');
  DOM.charGrid           = document.getElementById('char-grid');
  DOM.charPagination     = document.getElementById('char-pagination');

  // Modal
  DOM.modalBackdrop    = document.getElementById('char-modal-backdrop');
  DOM.modalCloseBtn    = document.getElementById('modal-close-btn');
  DOM.heroHz           = document.getElementById('hero-hz');
  DOM.heroPy           = document.getElementById('hero-py');
  DOM.heroDef          = document.getElementById('hero-def');
  DOM.heroFreq         = document.getElementById('hero-freq');
  DOM.heroRad          = document.getElementById('hero-rad');
  DOM.heroDecomp       = document.getElementById('hero-decomp');
  DOM.heroEtym         = document.getElementById('hero-etym');
  DOM.compoundPills    = document.getElementById('compound-pills');
  DOM.activeFilterBar  = document.getElementById('active-filter-bar');
  DOM.activeFilterText = document.getElementById('active-filter-text');
  DOM.resetFilterBtn   = document.getElementById('reset-filter-btn');
  DOM.crossCardsList   = document.getElementById('cross-cards-list');
  DOM.crossCardsCount  = document.getElementById('cross-cards-count');

  // Slang
  DOM.slangSearchInput  = document.getElementById('slang-search-input');
  DOM.slangGrid         = document.getElementById('slang-grid');
  DOM.slangCount        = document.getElementById('slang-count');
  DOM.slangFilterPills  = document.querySelectorAll('.slang-filter-pill');
}

function initLocalStorage() {
  const idx = localStorage.getItem('cn_last_card_idx');
  if (idx !== null) {
    const n = parseInt(idx, 10);
    if (!isNaN(n)) state.currentCardIdx = n;
  }
}

async function loadData() {
  DOM.loadingText.textContent = 'Loading dataset…';
  if (window.CARDS_DATA && window.CHARS_DATA) {
    state.cards        = window.CARDS_DATA;
    state.characters   = window.CHARS_DATA;
    state.commonMissing = window.COMMON_MISSING || [];
    return;
  }
  const [cr, chr, sr] = await Promise.all([
    fetch('data/cards.json'),
    fetch('data/characters.json'),
    fetch('data/common_missing.json').catch(() => null),
  ]);
  if (!cr.ok || !chr.ok) throw new Error('Failed to fetch data files');
  state.cards        = await cr.json();
  state.characters   = await chr.json();
  if (sr && sr.ok) state.commonMissing = await sr.json();
}

function hideLoading() {
  DOM.loadingScreen.classList.add('hidden');
  setTimeout(() => { DOM.loadingScreen.style.display = 'none'; }, 350);
}

function switchView(v) {
  state.activeView = v;
  DOM.viewCards.classList.toggle('active', v === 'cards');
  DOM.viewChars.classList.toggle('active', v === 'chars');
  DOM.viewSlang.classList.toggle('active', v === 'slang');
  DOM.desktopNavTabs.forEach(t => t.classList.toggle('active', t.dataset.view === v));
  DOM.bottomNavItems.forEach(t => t.classList.toggle('active', t.dataset.view === v));
  if (v === 'cards') renderCardView();
  if (v === 'chars') { state.charPage = 1; renderCharDirectory(); }
  if (v === 'slang') renderSlangView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── CARDS ─────────────────────────────────────────────────────────────────────
function renderCardView() {
  if (!state.cards.length) return;
  const [en, py, hz] = state.cards[state.currentCardIdx];

  DOM.cardCounter.textContent =
    `${(state.currentCardIdx + 1).toLocaleString()} / ${state.cards.length.toLocaleString()}`;
  DOM.cardProgressBar.style.width =
    `${((state.currentCardIdx + 1) / state.cards.length * 100).toFixed(2)}%`;

  DOM.cardHanzi.innerHTML = '';
  for (const ch of hz) {
    if (/[\u4e00-\u9fff]/.test(ch)) {
      const s = document.createElement('span');
      s.className = 'hanzi-char';
      s.textContent = ch;
      s.onclick = e => { e.stopPropagation(); openCharModal(ch); };
      DOM.cardHanzi.appendChild(s);
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
  DOM.revealBtn.textContent = 'Reveal';
  localStorage.setItem('cn_last_card_idx', state.currentCardIdx);
}

function revealCard() {
  state.cardRevealed = true;
  DOM.cardPinyin.classList.remove('card-blurred');
  DOM.cardEnglish.classList.remove('card-blurred');
  DOM.revealBtn.style.display = 'none';
}
function nextCard()   { state.currentCardIdx = (state.currentCardIdx + 1) % state.cards.length; renderCardView(); }
function prevCard()   { state.currentCardIdx = (state.currentCardIdx - 1 + state.cards.length) % state.cards.length; renderCardView(); }
function randomCard() { state.currentCardIdx = Math.floor(Math.random() * state.cards.length); renderCardView(); }

// ── CHAR DIRECTORY ────────────────────────────────────────────────────────────
function getFilteredCharList() {
  const allChars = Object.keys(state.characters);
  const rawQ = state.charSearchQuery.trim();

  // 1. Chinese characters pasted/typed → show those chars in order they appear
  const hanziInQ = rawQ.match(/[\u4e00-\u9fff]/g);
  if (hanziInQ) {
    return [...new Set(hanziInQ)].filter(ch => state.characters[ch]);
  }

  // 2. Pure latin query
  if (rawQ) {
    const normQ = stripTones(rawQ);
    const lowerQ = rawQ.toLowerCase();

    // Try as pinyin if it parses cleanly
    const syllables = parsePinyinQuery(rawQ);

    let matched;
    if (syllables) {
      // Match any character whose pinyin, when stripped of tones, contains all typed syllables
      const sylStr = syllables.join('');
      matched = allChars.filter(ch => {
        const info = state.characters[ch];
        return (info.p || []).some(p => stripTones(p).includes(sylStr));
      });
    } else {
      // English/meaning search (only if not a broken pinyin attempt)
      // "wde" → nothing; "water" → 水 etc.
      const looksLikePinyin = /^[a-z\s]+$/i.test(rawQ);
      if (looksLikePinyin) {
        // Looks like they tried pinyin but it's invalid — show nothing
        return [];
      }
      matched = allChars.filter(ch => {
        const info = state.characters[ch];
        return (info.d || '').toLowerCase().includes(lowerQ);
      });
    }

    // Sort the matches
    return sortChars(matched);
  }

  // 3. No query — sort all
  return sortChars(allChars);
}

function sortChars(list) {
  if (state.charFilter === 'least') {
    return [...list].sort((a, b) => state.characters[a].f - state.characters[b].f);
  }
  return [...list].sort((a, b) => state.characters[b].f - state.characters[a].f);
}

function renderCharDirectory() {
  const list = getFilteredCharList();
  const total = list.length;
  const ps = state.charPageSize;
  const totalPages = Math.max(1, Math.ceil(total / ps));
  state.charPage = Math.min(state.charPage, totalPages);
  const page = state.charPage;
  const slice = list.slice((page - 1) * ps, page * ps);

  // Info label
  const rawQ = state.charSearchQuery.trim();
  if (!rawQ) {
    DOM.charResultInfo.textContent =
      state.charFilter === 'least' ? 'Rarest first' : 'Most frequent first';
  } else if (total === 0) {
    DOM.charResultInfo.textContent = 'No match — invalid pinyin or not in deck';
  } else {
    DOM.charResultInfo.textContent = `${total} character${total === 1 ? '' : 's'} found`;
  }

  // Feedback on query validity
  const onlyLatin = rawQ && /^[a-z\s]+$/i.test(rawQ);
  if (onlyLatin && total === 0) {
    DOM.charSearchFeedback.textContent = '✕ Invalid — not valid pinyin syllables';
    DOM.charSearchFeedback.style.color = 'var(--danger)';
  } else if (onlyLatin && parsePinyinQuery(rawQ)) {
    const syls = parsePinyinQuery(rawQ);
    DOM.charSearchFeedback.textContent = '✓ ' + syls.join(' · ');
    DOM.charSearchFeedback.style.color = 'var(--accent-emerald)';
  } else {
    DOM.charSearchFeedback.textContent = '';
  }

  // Grid
  DOM.charGrid.innerHTML = '';
  if (slice.length === 0) {
    DOM.charGrid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:2.5rem;color:var(--text-muted);font-size:0.9rem;">No characters match.</div>';
  } else {
    slice.forEach(ch => {
      const info = state.characters[ch];
      const py   = (info.p || [])[0] || '';
      const tile = document.createElement('div');
      tile.className = 'char-tile';
      tile.innerHTML = `<div class="tile-hz">${ch}</div><div class="tile-py">${py}</div><div class="tile-freq">${info.f}</div>`;
      tile.onclick = () => openCharModal(ch);
      DOM.charGrid.appendChild(tile);
    });
  }

  // Pagination
  renderPagination(page, totalPages);
}

function renderPagination(current, total) {
  DOM.charPagination.innerHTML = '';
  if (total <= 1) return;

  const btn = (label, page, disabled = false, active = false) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.disabled = disabled;
    b.className = 'page-btn' + (active ? ' active' : '');
    b.onclick = () => { state.charPage = page; renderCharDirectory(); window.scrollTo({top:0}); };
    return b;
  };

  // Prev
  DOM.charPagination.appendChild(btn('‹', current - 1, current === 1));

  // Page numbers with ellipsis
  const pages = [];
  if (total <= 9) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('…');
    pages.push(total);
  }

  pages.forEach(p => {
    if (p === '…') {
      const ell = document.createElement('span');
      ell.textContent = '…';
      ell.style.cssText = 'padding:0 0.35rem;color:var(--text-muted);';
      DOM.charPagination.appendChild(ell);
    } else {
      DOM.charPagination.appendChild(btn(p, p, false, p === current));
    }
  });

  // Next
  DOM.charPagination.appendChild(btn('›', current + 1, current === total));
}

// ── CHARACTER MODAL ────────────────────────────────────────────────────────────
function openCharModal(ch) {
  state.selectedChar = ch;
  state.activeCompoundFilter = null;

  const info = state.characters[ch] || { p:['?'], d:'', r:'', dec:'', e:'', f:0, w:[], c:[] };

  DOM.heroHz.textContent    = ch;
  DOM.heroPy.textContent    = (info.p || []).join(', ');
  DOM.heroDef.textContent   = info.d || '';
  DOM.heroFreq.textContent  = `${info.f} cards`;
  DOM.heroRad.textContent   = `Radical: ${info.r || '?'}`;
  DOM.heroDecomp.textContent = info.dec || '';
  DOM.heroEtym.textContent  = info.e || 'No etymology note available.';

  DOM.activeFilterBar.style.display = 'none';
  renderCompoundPills(info.w || [], ch);
  renderModalCards(info.c || [], ch);

  state.modalOpen = true;
  DOM.modalBackdrop.classList.add('open');
}

function closeCharModal() {
  state.modalOpen = false;
  DOM.modalBackdrop.classList.remove('open');
}

function renderCompoundPills(words, ch) {
  DOM.compoundPills.innerHTML = '';
  if (!words.length) {
    DOM.compoundPills.innerHTML = '<span style="font-size:.85rem;color:var(--text-muted)">No compounds found in deck.</span>';
    return;
  }
  words.forEach(([word, count]) => {
    const pill = document.createElement('button');
    pill.className = 'compound-pill' + (state.activeCompoundFilter === word ? ' active' : '');
    pill.innerHTML = `<span>${word}</span><span class="count">(${count})</span>`;
    pill.onclick = () => {
      state.activeCompoundFilter = state.activeCompoundFilter === word ? null : word;
      if (state.activeCompoundFilter) {
        DOM.activeFilterText.textContent = `Filtering: "${word}"`;
        DOM.activeFilterBar.style.display = 'flex';
      } else {
        DOM.activeFilterBar.style.display = 'none';
      }
      renderCompoundPills(words, ch);
      renderModalCards(state.characters[ch]?.c || [], ch);
    };
    DOM.compoundPills.appendChild(pill);
  });
}

function renderModalCards(cardIndices, targetChar) {
  let list = [...cardIndices];

  // Filter by compound if active
  if (state.activeCompoundFilter) {
    const fw = state.activeCompoundFilter;
    list = list.filter(idx => state.cards[idx][2].includes(fw));
  }

  // Original deck order (by index ascending)
  list.sort((a, b) => a - b);

  const suffix = state.activeCompoundFilter ? ` with "${state.activeCompoundFilter}"` : '';
  DOM.crossCardsCount.textContent = `Cards${suffix} (${list.length})`;
  DOM.crossCardsList.innerHTML = '';

  if (!list.length) {
    DOM.crossCardsList.innerHTML = '<div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:.85rem">No cards match this filter.</div>';
    return;
  }

  list.slice(0, 80).forEach(idx => {
    const [en, py, hz] = state.cards[idx];
    const item = document.createElement('div');
    item.className = 'cross-card-item';

    const hzEl = document.createElement('div');
    hzEl.className = 'cross-card-hz';
    for (const c of hz) {
      if (/[\u4e00-\u9fff]/.test(c)) {
        const span = document.createElement('span');
        const isTarget   = c === targetChar;
        const isCompound = state.activeCompoundFilter && state.activeCompoundFilter.includes(c) && !isTarget;
        span.className = 'hanzi-char' +
          (isTarget ? ' match-highlight' : '') +
          (isCompound ? ' compound-highlight' : '');
        span.textContent = c;
        span.onclick = e => { e.stopPropagation(); openCharModal(c); };
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

    item.append(hzEl, pyEl, enEl);
    item.onclick = e => {
      if (e.target.classList.contains('hanzi-char')) return;
      closeCharModal();
      state.currentCardIdx = idx;
      switchView('cards');
    };
    DOM.crossCardsList.appendChild(item);
  });
}

function resetCompoundFilter() {
  state.activeCompoundFilter = null;
  DOM.activeFilterBar.style.display = 'none';
  const info = state.characters[state.selectedChar];
  if (info) { renderCompoundPills(info.w || [], state.selectedChar); renderModalCards(info.c || [], state.selectedChar); }
}

// ── SLANG VIEW ────────────────────────────────────────────────────────────────
function renderSlangView() {
  let list = [...(state.commonMissing || [])];

  if (state.slangFilter !== 'all') {
    list = list.filter(item => item.category.toLowerCase().includes(state.slangFilter));
  }

  const q = state.slangSearchQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(item =>
      item.word.includes(q) ||
      (item.alt || '').toLowerCase().includes(q) ||
      stripTones(item.pinyin).includes(stripTones(q)) ||
      item.meaning.toLowerCase().includes(q) ||
      (item.note || '').toLowerCase().includes(q)
    );
  }

  DOM.slangCount.textContent = `${list.length} entries`;
  DOM.slangGrid.innerHTML = '';

  if (!list.length) {
    DOM.slangGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:2.5rem;color:var(--text-muted);">Nothing found.</div>';
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'slang-card';

    const exHzEl = document.createElement('div');
    exHzEl.className = 'slang-ex-hz';
    for (const ch of item.example_hz) {
      if (/[\u4e00-\u9fff]/.test(ch)) {
        const s = document.createElement('span');
        s.className = 'hanzi-char';
        s.textContent = ch;
        s.onclick = e => { e.stopPropagation(); openCharModal(ch); };
        exHzEl.appendChild(s);
      } else {
        exHzEl.appendChild(document.createTextNode(ch));
      }
    }

    const altHtml = item.alt ? `<span style="font-size:.78rem;color:var(--text-muted)"> / ${item.alt}</span>` : '';
    card.innerHTML = `
      <div>
        <div class="slang-header">
          <div style="display:flex;align-items:baseline;gap:.65rem;flex-wrap:wrap">
            <span class="slang-word">${item.word}</span>
            <span class="slang-py">${item.pinyin}</span>${altHtml}
          </div>
          <span class="slang-badge">${item.category}</span>
        </div>
        <div class="slang-meaning">${item.meaning}</div>
        <div class="slang-note">💡 ${item.note}</div>
      </div>
      <div class="slang-example">
        <div id="ex-hz-${item.word.charCodeAt(0)}"></div>
        <div class="slang-ex-py">${item.example_py}</div>
        <div class="slang-ex-en">${item.example_en}</div>
      </div>
    `;
    card.querySelector(`#ex-hz-${item.word.charCodeAt(0)}`).replaceWith(exHzEl);
    DOM.slangGrid.appendChild(card);
  });
}

function setSlangFilter(cat) {
  state.slangFilter = cat;
  DOM.slangFilterPills.forEach(p => p.classList.toggle('active', p.dataset.filter === cat));
  renderSlangView();
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
function setupEventListeners() {
  DOM.desktopNavTabs.forEach(t => { t.onclick = () => switchView(t.dataset.view); });
  DOM.bottomNavItems.forEach(t => { t.onclick = () => switchView(t.dataset.view); });

  DOM.revealBtn.onclick    = revealCard;
  DOM.prevCardBtn.onclick  = prevCard;
  DOM.nextCardBtn.onclick  = nextCard;
  DOM.randomCardBtn.onclick = randomCard;
  // Tap card body to reveal
  document.getElementById('flashcard-body').onclick = () => { if (!state.cardRevealed) revealCard(); };

  // Freq toggle
  DOM.freqToggleBtn.onclick = () => {
    state.charFilter = state.charFilter === 'freq' ? 'least' : 'freq';
    DOM.freqToggleBtn.textContent = state.charFilter === 'freq' ? '↓ Most frequent' : '↑ Least frequent';
    state.charPage = 1;
    renderCharDirectory();
  };

  // Char search
  DOM.charSearchInput.addEventListener('input', e => {
    state.charSearchQuery = e.target.value;
    DOM.charSearchClearBtn.style.display = e.target.value ? 'block' : 'none';
    state.charPage = 1;
    renderCharDirectory();
  });
  DOM.charSearchClearBtn.onclick = () => {
    DOM.charSearchInput.value = '';
    state.charSearchQuery = '';
    DOM.charSearchClearBtn.style.display = 'none';
    state.charPage = 1;
    renderCharDirectory();
    DOM.charSearchInput.focus();
  };

  // Modal
  DOM.modalCloseBtn.onclick = closeCharModal;
  DOM.modalBackdrop.onclick = e => { if (e.target === DOM.modalBackdrop) closeCharModal(); };
  DOM.resetFilterBtn.onclick = resetCompoundFilter;

  // Slang
  DOM.slangFilterPills.forEach(p => { p.onclick = () => setSlangFilter(p.dataset.filter); });
  DOM.slangSearchInput.addEventListener('input', e => { state.slangSearchQuery = e.target.value; renderSlangView(); });
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA'].includes(e.target.tagName)) {
      if (e.key === 'Escape') { e.target.blur(); closeCharModal(); }
      return;
    }
    if (e.key === 'Escape' && state.modalOpen) closeCharModal();
    if (e.key === ' ' && state.activeView === 'cards') {
      e.preventDefault();
      state.cardRevealed ? nextCard() : revealCard();
    }
    if (e.key === 'ArrowRight' && state.activeView === 'cards') nextCard();
    if (e.key === 'ArrowLeft'  && state.activeView === 'cards') prevCard();
    if (e.key === '/' ) { e.preventDefault(); switchView('chars'); DOM.charSearchInput.focus(); }
  });
}
