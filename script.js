// CPS Battle - polished single-page browser game
const STORAGE_KEY = 'cps-battle-save-v1';

const THEMES = {
  neon: {
    name: 'Neon Plasma',
    accent: '#00f5ff',
    accent2: '#ff4fd8',
    bg: '#04070f',
    panel: 'rgba(10, 16, 28, 0.86)',
    panel2: 'rgba(16, 24, 40, 0.95)',
  },
  cyber: {
    name: 'Cyber Glow',
    accent: '#6bffb8',
    accent2: '#3f7dff',
    bg: '#030711',
    panel: 'rgba(10, 14, 28, 0.86)',
    panel2: 'rgba(17, 23, 40, 0.95)',
  },
  solar: {
    name: 'Solar Burst',
    accent: '#ffb703',
    accent2: '#fb5607',
    bg: '#110803',
    panel: 'rgba(28, 16, 10, 0.86)',
    panel2: 'rgba(41, 23, 10, 0.95)',
  },
  void: {
    name: 'Midnight Void',
    accent: '#8b5cf6',
    accent2: '#14b8a6',
    bg: '#02050b',
    panel: 'rgba(10, 8, 22, 0.86)',
    panel2: 'rgba(16, 14, 33, 0.95)',
  },
};

const MODES = [1, 5, 10, 30, 60];
const ACHIEVEMENTS = [
  { id: 'first', title: 'First Spark', desc: 'Reach 1 total click', goal: 1 },
  { id: 'hundred', title: 'Century Click', desc: 'Reach 100 total clicks', goal: 100 },
  { id: 'thousand', title: 'Clickstorm', desc: 'Reach 1000 total clicks', goal: 1000 },
  { id: 'level5', title: 'Rising Star', desc: 'Reach level 5', goal: 5 },
  { id: 'combo', title: 'Combo Breaker', desc: 'Hit a combo of 20', goal: 20 },
  { id: 'legend', title: 'Legendary Pace', desc: 'Reach 20 CPS', goal: 20 },
];

const SHOP_ITEMS = [
  { id: 'boost', name: 'Click Boost', desc: '+1 click power', cost: 250, type: 'boost' },
  { id: 'xp', name: 'XP Booster', desc: '+25% XP gain', cost: 320, type: 'xp' },
  { id: 'cyber', name: 'Cyber Glow', desc: 'Unlock theme', cost: 700, type: 'theme', theme: 'cyber' },
  { id: 'solar', name: 'Solar Burst', desc: 'Unlock theme', cost: 900, type: 'theme', theme: 'solar' },
  { id: 'void', name: 'Midnight Void', desc: 'Unlock theme', cost: 1200, type: 'theme', theme: 'void' },
];

const shopItems = [
  'Blue Theme',
  'Purple Theme',
  'Rainbow Cursor',
  'Fire Button',
  'XP Booster',
  'Coin Booster',
  'Galaxy Background',
  'Golden Click',
];

const DAILY_SHOP_ITEM_DETAILS = {
  'Blue Theme': { cost: 180, desc: 'Bonus color pack' },
  'Purple Theme': { cost: 220, desc: 'Glowing purple palette' },
  'Rainbow Cursor': { cost: 260, desc: 'Animated cosmic cursor' },
  'Fire Button': { cost: 300, desc: 'Button effect upgrade' },
  'XP Booster': { cost: 280, desc: 'Small XP bonus' },
  'Coin Booster': { cost: 310, desc: 'Small coin bonus' },
  'Galaxy Background': { cost: 340, desc: 'Dynamic star field' },
  'Golden Click': { cost: 380, desc: 'Premium click effect' },
};

const defaultState = {
  clicks: 0,
  totalClicks: 0,
  highScore: 0,
  bestCps: 0,
  xp: 0,
  level: 1,
  coins: 0,
  combo: 0,
  bestCombo: 0,
  selectedMode: 5,
  currentScore: 0,
  clickPower: 1,
  xpMultiplier: 1,
  coinMultiplier: 1,
  activeTheme: 'neon',
  unlockedThemes: ['neon'],
  sound: true,
  animations: true,
  achievements: [],
  sessions: [],
  gameActive: false,
  timeRemaining: 0,
  lastDailyClaim: null,
  dailyStreak: 0,
  totalGames: 0,
  totalTime: 0,
  lastRoundCps: 0,
  lastRoundScore: 0,
  purchasedBoosts: 0,
  purchasedXpBoosts: 0,
  ownedDailyUpgrades: [],
};

let state = loadState();
let gameTimer = null;
let comboDecayTimer = null;
let currentRoundClicks = 0;
let roundStartTime = 0;
let roundDuration = state.selectedMode;

const elements = {
  clickButton: document.getElementById('clickButton'),
  timeLeftValue: document.getElementById('timeLeftValue'),
  modeLabel: document.getElementById('modeLabel'),
  comboValue: document.getElementById('comboValue'),
  clickCountValue: document.getElementById('clickCountValue'),
  cpsValue: document.getElementById('cpsValue'),
  scoreValue: document.getElementById('scoreValue'),
  levelValue: document.getElementById('levelValue'),
  xpValue: document.getElementById('xpValue'),
  coinValue: document.getElementById('coinValue'),
  highScoreValue: document.getElementById('highScoreValue'),
  bestCpsValue: document.getElementById('bestCpsValue'),
  rankBadge: document.getElementById('rankBadge'),
  levelProgressFill: document.getElementById('levelProgressFill'),
  levelProgressText: document.getElementById('levelProgressText'),
  dailyRewardBtn: document.getElementById('dailyRewardBtn'),
  claimDailyBtn: document.getElementById('claimDailyBtn'),
  dailyRewardText: document.getElementById('dailyRewardText'),
  achievementList: document.getElementById('achievementList'),
  shopList: document.getElementById('shopList'),
  dailyShopList: document.getElementById('dailyShopList'),
  sessionModeText: document.getElementById('sessionModeText'),
  bestComboValue: document.getElementById('bestComboValue'),
  xpGainValue: document.getElementById('xpGainValue'),
  totalClicksValue: document.getElementById('totalClicksValue'),
  gamesPlayedValue: document.getElementById('gamesPlayedValue'),
  timePlayedValue: document.getElementById('timePlayedValue'),
  activeThemeValue: document.getElementById('activeThemeValue'),
  sessionHistory: document.getElementById('sessionHistory'),
  soundToggle: document.getElementById('soundToggle'),
  animationsToggle: document.getElementById('animationsToggle'),
  resetBtn: document.getElementById('resetBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  confettiLayer: document.getElementById('confettiLayer'),
};

const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));

init();

function init() {
  loadSettings();
  applyTheme();
  bindEvents();
  updateUi();
  renderAchievements();
  renderShop();
  renderSessions();
  checkDailyReward();
  updatePanel('dashboard');
}

const settings = {
  music: true,
  sounds: true,
  particles: true,
};

function saveSettings() {
  localStorage.settings = JSON.stringify(settings);
}

function loadSettings() {
  if (localStorage.settings) {
    Object.assign(settings, JSON.parse(localStorage.settings));
  }
}

function toggleSound() {
  settings.sounds = !settings.sounds;
  saveSettings();
}

function toggleMusic() {
  settings.music = !settings.music;
  saveSettings();
}

function toggleParticles() {
  settings.particles = !settings.particles;
  saveSettings();
}

const rewards = [100, 200, 500, 1000];

function spin() {
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  state.coins += reward;
  saveState();
  updateUi();
  alert(`You won ${reward} coins!`);
}

function bindEvents() {
  elements.clickButton.addEventListener('click', handleClick);

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedMode = Number(button.dataset.duration);
      roundDuration = state.selectedMode;
      updateModeButtons();
      updateUi();
    });
  });

  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      state.activeTheme = theme;
      applyTheme();
      saveState();
      renderThemeButtons();
      updateUi();
    });
  });

  navButtons.forEach((button) => {
    button.addEventListener('click', () => updatePanel(button.dataset.panel));
  });

  elements.dailyRewardBtn.addEventListener('click', () => updatePanel('dashboard'));
  elements.claimDailyBtn.addEventListener('click', claimDailyReward);
  document.getElementById('spinBtn')?.addEventListener('click', spin);
  elements.soundToggle.addEventListener('change', (event) => {
    state.sound = event.target.checked;
    saveState();
  });
  document.getElementById('musicToggle')?.addEventListener('change', (event) => {
    state.music = event.target.checked;
    saveState();
  });
  document.getElementById('particlesToggle')?.addEventListener('change', (event) => {
    state.particles = event.target.checked;
    document.body.classList.toggle('disable-particles', !state.particles);
    saveState();
  });
  elements.animationsToggle.addEventListener('change', (event) => {
    state.animations = event.target.checked;
    document.body.classList.toggle('disable-animations', !state.animations);
    saveState();
  });
  elements.resetBtn.addEventListener('click', resetProgress);
  elements.settingsBtn.addEventListener('click', () => updatePanel('settings'));
}

function handleClick() {
  if (!state.gameActive) {
    startRound();
  }

  state.clicks += 1;
  state.totalClicks += 1;
  state.currentScore = currentRoundClicks + 1;
  currentRoundClicks += 1;
  const comboBoost = Math.min(6, 1 + Math.floor(state.combo / 8));
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const reward = state.clickPower * comboBoost;
  state.coins += reward * (state.coinMultiplier || 1);
  state.xp += Math.round(reward * (1 + state.purchasedXpBoosts * 0.25) * state.xpMultiplier);
  state.currentScore = currentRoundClicks * state.clickPower * comboBoost;
  const previousHighScore = state.highScore;
  state.highScore = Math.max(state.highScore, state.currentScore);
  state.bestCps = Math.max(state.bestCps, calculateCps());
  state.lastRoundScore = state.currentScore;
  state.lastRoundCps = calculateCps();

  if (state.combo >= 20) {
    unlockAchievement('combo');
  }

  if (state.totalClicks >= 1) {
    unlockAchievement('first');
  }
  if (state.totalClicks >= 100) {
    unlockAchievement('hundred');
  }
  if (state.totalClicks >= 1000) {
    unlockAchievement('thousand');
  }
  if (state.level >= 5) {
    unlockAchievement('level5');
  }
  if (state.bestCps >= 20) {
    unlockAchievement('legend');
  }

  if (state.highScore > previousHighScore) {
    triggerConfetti();
  }

  if (state.sound) {
    playPulseSound();
  }

  elements.clickButton.classList.remove('is-boosted');
  void elements.clickButton.offsetWidth;
  elements.clickButton.classList.add('is-boosted');

  updateLevelFromXp();
  updateUi();
  saveState();
  resetComboDecay();
}

function startRound() {
  clearInterval(gameTimer);
  currentRoundClicks = 0;
  state.clicks = 0;
  state.combo = 0;
  state.currentScore = 0;
  state.gameActive = true;
  state.timeRemaining = roundDuration;
  roundStartTime = Date.now();
  updateUi();

  gameTimer = setInterval(() => {
    state.timeRemaining = Math.max(0, roundDuration - (Date.now() - roundStartTime) / 1000);
    if (state.timeRemaining <= 0) {
      endRound();
      return;
    }
    updateUi();
  }, 100);
}

function endRound() {
  clearInterval(gameTimer);
  state.gameActive = false;
  state.totalGames += 1;
  state.totalTime += roundDuration;
  state.lastRoundCps = currentRoundClicks / roundDuration;
  state.lastRoundScore = currentRoundClicks * state.clickPower * Math.max(1, Math.floor(state.bestCombo / 8));
  state.bestCps = Math.max(state.bestCps, state.lastRoundCps);
  state.highScore = Math.max(state.highScore, state.lastRoundScore);
  state.coins += Math.round(currentRoundClicks * 0.8) + roundDuration;
  const xpGain = Math.round((state.lastRoundCps + currentRoundClicks * 0.2) * 10 * (1 + state.purchasedXpBoosts * 0.25));
  state.xp += xpGain;
  state.xpGainValue = xpGain;
  state.sessions.unshift({
    mode: roundDuration,
    clicks: currentRoundClicks,
    cps: state.lastRoundCps,
    score: state.lastRoundScore,
    date: new Date().toLocaleString(),
  });
  state.sessions = state.sessions.slice(0, 6);

  if (state.lastRoundScore > state.highScore) {
    triggerConfetti();
  }

  updateLevelFromXp();
  updateUi();
  saveState();
  renderSessions();
}

function generateDailyShop() {
  const today = new Date().toDateString();

  if (localStorage.shopDate !== today) {
    let items = [];

    while (items.length < 3) {
      const item = shopItems[Math.floor(Math.random() * shopItems.length)];
      if (!items.includes(item)) {
        items.push(item);
      }
    }

    localStorage.shopItems = JSON.stringify(items);
    localStorage.shopDate = today;
  }

  return JSON.parse(localStorage.shopItems);
}

function renderDailyShop() {
  const items = generateDailyShop();
  elements.dailyShopList.innerHTML = '';
  items.forEach((itemName) => {
    const details = DAILY_SHOP_ITEM_DETAILS[itemName];
    const owned = state.ownedDailyUpgrades.includes(itemName);
    const card = document.createElement('div');
    card.className = `shop-item ${owned ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div>
        <strong>${itemName}</strong>
        <div>${details.desc}</div>
      </div>
      <button class="primary-btn" data-daily-item="${itemName}">${owned ? 'Owned' : `${details.cost} Coins`}</button>
    `;
    const button = card.querySelector('button');
    button.disabled = owned;
    button.addEventListener('click', () => buyDailyItem(itemName, details));
    elements.dailyShopList.appendChild(card);
  });
}

function buyDailyItem(itemName, details) {
  if (state.coins < details.cost) return;
  if (state.ownedDailyUpgrades.includes(itemName)) return;

  state.coins -= details.cost;
  state.ownedDailyUpgrades.push(itemName);

  if (itemName === 'XP Booster') {
    state.xpMultiplier += 0.1;
  }
  if (itemName === 'Coin Booster') {
    state.coinMultiplier = (state.coinMultiplier || 1) + 0.1;
  }
  if (itemName === 'Fire Button') {
    state.clickPower += 1;
  }

  saveState();
  updateUi();
}

function renderThemeButtons() {
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === state.activeTheme);
  });
}

function updateLevelFromXp() {
  const xpNeeded = state.level * 140;
  while (state.xp >= xpNeeded) {
    state.xp -= xpNeeded;
    state.level += 1;
  }
}

function updateUi() {
  elements.timeLeftValue.textContent = `${state.gameActive ? state.timeRemaining.toFixed(1) : roundDuration.toFixed(1)}s`;
  elements.modeLabel.textContent = `${state.selectedMode}s`;
  elements.comboValue.textContent = `x${Math.max(1, Math.min(10, 1 + Math.floor(state.combo / 8)))}`;
  elements.clickCountValue.textContent = `${state.gameActive ? currentRoundClicks : state.clicks}`;
  elements.cpsValue.textContent = calculateCps().toFixed(2);
  elements.scoreValue.textContent = `${state.currentScore}`;
  elements.levelValue.textContent = state.level;
  elements.xpValue.textContent = state.xp;
  elements.coinValue.textContent = state.coins;
  elements.highScoreValue.textContent = state.highScore;
  elements.bestCpsValue.textContent = state.bestCps.toFixed(2);
  elements.rankBadge.textContent = getRank();
  const progressPercent = Math.min(100, Math.round((state.xp / (state.level * 140)) * 100));
  elements.levelProgressText.textContent = `${progressPercent}%`;
  elements.levelProgressFill.style.width = `${progressPercent}%`;
  elements.sessionModeText.textContent = `${state.selectedMode}s`;
  elements.bestComboValue.textContent = state.bestCombo;
  elements.xpGainValue.textContent = state.xpGainValue || 0;
  elements.totalClicksValue.textContent = state.totalClicks;
  elements.gamesPlayedValue.textContent = state.totalGames;
  elements.timePlayedValue.textContent = `${state.totalTime}s`;
  elements.activeThemeValue.textContent = THEMES[state.activeTheme].name;
  elements.dailyRewardText.textContent = getDailyRewardStatus();
  updateModeButtons();
  renderAchievements();
  renderShop();
  renderDailyShop();
  renderThemeButtons();
  renderSessions();
}

function calculateCps() {
  if (!state.gameActive) {
    return Number(state.lastRoundCps || 0);
  }
  const elapsed = Math.max(0.1, (Date.now() - roundStartTime) / 1000);
  return currentRoundClicks / elapsed;
}

function getRank() {
  const cps = state.bestCps;
  if (cps < 1.5) return 'Beginner';
  if (cps < 3) return 'Casual';
  if (cps < 5) return 'Fast';
  if (cps < 7) return 'Pro';
  if (cps < 9) return 'Elite';
  if (cps < 12) return 'Master';
  if (cps < 16) return 'Legend';
  if (cps < 22) return 'Click God';
  if (cps < 30) return 'Cosmic';
  return 'Mythic';
}

function updateModeButtons() {
  modeButtons.forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.duration) === state.selectedMode);
  });
}

function updatePanel(panel) {
  document.querySelectorAll('.panel').forEach((section) => section.classList.remove('active-panel'));
  document.querySelectorAll('.nav-btn').forEach((button) => button.classList.toggle('active', button.dataset.panel === panel));
  const target = document.getElementById(`${panel}Panel`);
  if (target) target.classList.add('active-panel');
}

function renderAchievements() {
  elements.achievementList.innerHTML = '';
  ACHIEVEMENTS.forEach((achievement) => {
    const unlocked = state.achievements.includes(achievement.id);
    const item = document.createElement('div');
    item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
    item.innerHTML = `
      <div>
        <strong>${achievement.title}</strong>
        <div>${achievement.desc}</div>
      </div>
      <span>${unlocked ? 'Unlocked' : 'Locked'}</span>
    `;
    elements.achievementList.appendChild(item);
  });
}

function renderShop() {
  elements.shopList.innerHTML = '';
  SHOP_ITEMS.forEach((item) => {
    const unlocked = item.type === 'theme' ? state.unlockedThemes.includes(item.theme) : false;
    const card = document.createElement('div');
    card.className = `shop-item ${unlocked ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div>${item.desc}</div>
      </div>
      <button class="primary-btn" data-item="${item.id}">${unlocked ? 'Owned' : `${item.cost} Coins`}</button>
    `;
    const button = card.querySelector('button');
    button.disabled = unlocked;
    button.addEventListener('click', () => buyItem(item));
    elements.shopList.appendChild(card);
  });
}

function buyItem(item) {
  if (item.type === 'theme') {
    if (state.coins < item.cost) return;
    if (state.unlockedThemes.includes(item.theme)) return;
    state.coins -= item.cost;
    state.unlockedThemes.push(item.theme);
    state.activeTheme = item.theme;
    applyTheme();
    saveState();
    updateUi();
    return;
  }

  if (item.type === 'boost' && state.coins >= item.cost) {
    state.coins -= item.cost;
    state.clickPower += 1;
    state.purchasedBoosts += 1;
    saveState();
    updateUi();
    return;
  }

  if (item.type === 'xp' && state.coins >= item.cost) {
    state.coins -= item.cost;
    state.xpMultiplier += 0.25;
    state.purchasedXpBoosts += 1;
    saveState();
    updateUi();
  }
}

function renderSessions() {
  elements.sessionHistory.innerHTML = '';
  if (!state.sessions.length) {
    elements.sessionHistory.innerHTML = '<div class="history-entry"><span>No sessions yet</span></div>';
    return;
  }
  state.sessions.forEach((session) => {
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.innerHTML = `
      <strong>${session.mode}s • ${session.clicks} clicks</strong>
      <span>${session.cps.toFixed(2)} CPS • ${session.score} score</span>
      <span>${session.date}</span>
    `;
    elements.sessionHistory.appendChild(entry);
  });
}

function claimDailyReward() {
  const today = new Date().toDateString();
  if (state.lastDailyClaim === today) {
    elements.dailyRewardText.textContent = 'Reward already claimed today.';
    return;
  }
  const reward = 100 + state.dailyStreak * 35;
  state.coins += reward;
  state.dailyStreak += 1;
  state.lastDailyClaim = today;
  saveState();
  updateUi();
  elements.dailyRewardText.textContent = `Claimed ${reward} coins. Come back tomorrow!`;
}

function checkDailyReward() {
  const today = new Date().toDateString();
  if (state.lastDailyClaim !== today) {
    elements.dailyRewardText.textContent = 'A fresh reward is ready. Claim it now.';
    return;
  }
  elements.dailyRewardText.textContent = 'Reward already claimed today.';
}

function unlockAchievement(id) {
  if (state.achievements.includes(id)) return;
  state.achievements.push(id);
  saveState();
  renderAchievements();
}

function resetProgress() {
  if (!confirm('Reset all progress?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = JSON.parse(JSON.stringify(defaultState));
  applyTheme();
  updateUi();
  saveState();
}

function applyTheme() {
  const theme = THEMES[state.activeTheme] || THEMES.neon;
  document.documentElement.style.setProperty('--accent', theme.accent);
  document.documentElement.style.setProperty('--accent-2', theme.accent2);
  document.documentElement.style.setProperty('--bg', theme.bg);
  document.documentElement.style.setProperty('--panel', theme.panel);
  document.documentElement.style.setProperty('--panel-2', theme.panel2);
}

function playPulseSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (error) {
    console.warn('Sound unavailable', error);
  }
}

function triggerConfetti() {
  const colors = ['#00f5ff', '#ff4fd8', '#ffd166', '#00ff95'];
  for (let i = 0; i < 36; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 220}px`);
    piece.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
    elements.confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 1500);
  }
}

function resetComboDecay() {
  clearTimeout(comboDecayTimer);
  comboDecayTimer = setTimeout(() => {
    state.combo = 0;
    updateUi();
  }, 900);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return JSON.parse(JSON.stringify(defaultState));
  try {
    const parsed = JSON.parse(raw);
    return { ...JSON.parse(JSON.stringify(defaultState)), ...parsed };
  } catch (error) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function getDailyRewardStatus() {
  const today = new Date().toDateString();
  if (state.lastDailyClaim === today) {
    return `Reward already collected today. Next reward in ${24 - new Date().getHours()}h.`;
  }
  return `Claim ${100 + state.dailyStreak * 35} coins for today.`;
}

window.addEventListener('beforeunload', saveState);
