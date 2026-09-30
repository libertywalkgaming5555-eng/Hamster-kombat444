/* ===================================================================
   HAMSTER KOMBAT - ADVANCED GAME ENGINE
   - Dynamic Tap Progression: +1, +2, +5, +9, +16, +25, +36, +50 (Hard to obtain)
   - Rare Super Critical Hits (+50)
   - Instant & Smooth Energy Auto-Regeneration
   =================================================================== */

// Multitap Ladder Definition (Expensive & Purchased with Coins!)
const MULTITAP_TIERS = [
  { level: 1, tap: 1, cost: 0 },
  { level: 2, tap: 2, cost: 10000 },      // +2 costs 10,000 coins (Expensive!)
  { level: 3, tap: 5, cost: 100000 },     // +5 costs 100,000 coins
  { level: 4, tap: 9, cost: 500000 },     // +9 costs 500,000 coins
  { level: 5, tap: 16, cost: 2500000 },   // +16 costs 2,500,000 coins
  { level: 6, tap: 25, cost: 10000000 },  // +25 costs 10,000,000 coins
  { level: 7, tap: 36, cost: 35000000 },  // +36 costs 35,000,000 coins
  { level: 8, tap: 50, cost: 100000000 }  // +50 costs 100,000,000 coins (Prestige tier!)
];

// Game Levels
const RANKS = [
  { level: 1, name: "Bronze", minCoins: 0, maxCoins: 5000 },
  { level: 2, name: "Silver", minCoins: 5000, maxCoins: 25000 },
  { level: 3, name: "Gold", minCoins: 25000, maxCoins: 100000 },
  { level: 4, name: "Platinum", minCoins: 100000, maxCoins: 1000000 },
  { level: 5, name: "Diamond", minCoins: 1000000, maxCoins: 2000000 },
  { level: 6, name: "Epic", minCoins: 2000000, maxCoins: 10000000 },
  { level: 7, name: "Legendary", minCoins: 10000000, maxCoins: 50000000 },
  { level: 8, name: "Master", minCoins: 50000000, maxCoins: 100000000 },
  { level: 9, name: "Grandmaster", minCoins: 100000000, maxCoins: 500000000 },
  { level: 10, name: "Lord", minCoins: 500000000, maxCoins: 1000000000 }
];

// Cards Database for Mine
const MINE_CARDS = [
  // Markets
  { id: "btc_pairs", name: "BTC pairs", category: "markets", icon: "🪙", baseCost: 750, baseProfit: 120, level: 0 },
  { id: "eth_pairs", name: "ETH pairs", category: "markets", icon: "🔷", baseCost: 1200, baseProfit: 250, level: 0 },
  { id: "fan_tokens", name: "Fan tokens", category: "markets", icon: "⚽", baseCost: 3000, baseProfit: 600, level: 0 },
  { id: "meme_coins", name: "Meme coins", category: "markets", icon: "🐶", baseCost: 5000, baseProfit: 1100, level: 0 },
  { id: "margin_trading", name: "Margin trading", category: "markets", icon: "📈", baseCost: 15000, baseProfit: 3500, level: 0 },
  { id: "web3", name: "Web3 integration", category: "markets", icon: "🌐", baseCost: 40000, baseProfit: 8000, level: 0 },

  // PR & Team
  { id: "ceo", name: "CEO", category: "pr", icon: "👔", baseCost: 1000, baseProfit: 200, level: 0 },
  { id: "marketing", name: "Marketing", category: "pr", icon: "📢", baseCost: 2500, baseProfit: 550, level: 0 },
  { id: "influencers", name: "Influencers", category: "pr", icon: "🤳", baseCost: 8000, baseProfit: 1800, level: 0 },
  { id: "audit", name: "Security audit", category: "pr", icon: "🛡️", baseCost: 20000, baseProfit: 4500, level: 0 },

  // Legal
  { id: "kyc", name: "KYC", category: "legal", icon: "📜", baseCost: 1500, baseProfit: 300, level: 0 },
  { id: "license_eu", name: "EU License", category: "legal", icon: "🇪🇺", baseCost: 6000, baseProfit: 1400, level: 0 },
  { id: "license_uae", name: "UAE License", category: "legal", icon: "🇦🇪", baseCost: 18000, baseProfit: 4200, level: 0 },

  // Specials
  { id: "merch", name: "Hamster Merch", category: "specials", icon: "👕", baseCost: 10000, baseProfit: 3000, level: 0 },
  { id: "ton", name: "TON Partnership", category: "specials", icon: "💎", baseCost: 50000, baseProfit: 15000, level: 0 },
  { id: "dubai", name: "Dubai Party", category: "specials", icon: "🏙️", baseCost: 150000, baseProfit: 45000, level: 0 }
];

// Tasks
const INITIAL_TASKS = [
  { id: "tg", title: "Join Telegram Channel", reward: 25000, completed: false },
  { id: "yt", title: "Watch YouTube Video", reward: 50000, completed: false },
  { id: "x", title: "Follow on X (Twitter)", reward: 20000, completed: false },
  { id: "daily", title: "Daily Check-in", reward: 5000, completed: false }
];

// ================= GAME STATE =================
class GameState {
  constructor() {
    this.coins = 100;
    this.profitPerHour = 0;
    this.multitapTierIndex = 0; // Index in MULTITAP_TIERS (0 => +1, 1 => +2, etc.)
    this.energy = 1000;
    this.maxEnergy = 1000;
    this.freeEnergyLeft = 6;
    this.lastSaveTime = Date.now();
    this.energyLimitLevel = 1;

    this.cards = JSON.parse(JSON.stringify(MINE_CARDS));
    this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.friends = [];
    this.lastTapTime = 0;
  }

  get earnPerTap() {
    const tier = MULTITAP_TIERS[this.multitapTierIndex] || MULTITAP_TIERS[0];
    return tier.tap;
  }

  load() {
    const saved = localStorage.getItem("hamster_kombat_save_v4");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this, parsed);
      } catch (e) {
        console.error("Error loading save:", e);
      }
    }
  }

  save() {
    this.lastSaveTime = Date.now();
    localStorage.setItem("hamster_kombat_save_v4", JSON.stringify(this));
  }
}

const game = new GameState();

// ================= SOUND SYNTHESIZER =================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playPop(isCrit = false) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCrit ? "triangle" : "sine";
    const freq = isCrit ? 900 + Math.random() * 200 : 480 + Math.random() * 60;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isCrit ? 1400 : 750, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(isCrit ? 0.35 : 0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playUpgrade() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.18);
    });
  }
}

const sounds = new SoundFX();

// ================= HELPERS =================
function formatNum(n) {
  if (n === undefined || isNaN(n)) return "0";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Math.floor(n).toLocaleString();
}

function showToast(msg, icon = "🪙") {
  const container = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function getCurrentRank() {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (game.coins >= RANKS[i].minCoins) {
      return { rank: RANKS[i], index: i + 1 };
    }
  }
  return { rank: RANKS[0], index: 1 };
}

// ================= UPDATE UI =================
function updateUI() {
  // Top Metrics
  document.getElementById("earnPerTapVal").innerText = game.earnPerTap;
  document.getElementById("profitPerHourVal").innerText = formatNum(game.profitPerHour);

  // Big Balance
  document.getElementById("totalBalance").innerText = formatNum(game.coins);

  // Rank & Level Progress
  const { rank, index } = getCurrentRank();
  document.getElementById("rankBadge").innerText = rank.name;
  document.getElementById("levelNumbers").innerText = `${index}/${RANKS.length}`;

  const nextThreshold = rank.maxCoins;
  let progressPercent = 0;
  if (nextThreshold !== Infinity) {
    const range = nextThreshold - rank.minCoins;
    const current = game.coins - rank.minCoins;
    progressPercent = Math.min(100, Math.max(2, (current / range) * 100));
    document.getElementById("coinsToNextLevel").innerText = formatNum(nextThreshold);
  } else {
    progressPercent = 100;
    document.getElementById("coinsToNextLevel").innerText = "MAX";
  }
  document.getElementById("levelProgressBar").style.width = `${progressPercent}%`;

  // Energy & Boost
  document.getElementById("currentEnergy").innerText = Math.floor(game.energy);
  document.getElementById("maxEnergy").innerText = game.maxEnergy;

  // Boost modal info
  document.getElementById("freeEnergyLeft").innerText = `${game.freeEnergyLeft}/6`;
  
  const nextTier = MULTITAP_TIERS[game.multitapTierIndex + 1];
  const multitapTitle = document.getElementById("multitapTitle");
  if (nextTier) {
    if (multitapTitle) multitapTitle.innerText = `Multitap (+${nextTier.tap})`;
    document.getElementById("multitapCost").innerText = formatNum(nextTier.cost);
  } else {
    if (multitapTitle) multitapTitle.innerText = `Multitap (+50)`;
    document.getElementById("multitapCost").innerText = "MAX";
  }
  document.getElementById("energyLimitCost").innerText = formatNum(game.energyLimitLevel * 2000);
}

// ================= HAMSTER TAP MECHANIC =================
const hamsterRing = document.getElementById("hamsterRing");
let overdriveTapsLeft = 0;
let isTurboCharging = false;

function handleTap(clientX, clientY) {
  if (game.energy <= 0) {
    showToast("⚡ Energiya tugadi! Tez tiklanmoqda...", "⚡");
    return;
  }

  // Strictly earned tap value from owned Multitap tier (e.g. +1 until bought +2)
  let finalEarn = game.earnPerTap;

  // Check Overdrive Bonus (earned after 0 -> 100% full recharge)
  let isOverdrive = false;
  if (overdriveTapsLeft > 0) {
    finalEarn *= 2;
    overdriveTapsLeft--;
    isOverdrive = true;
  }

  // RARE CRITICAL HIT (3% chance) -> Multiplies tap power by 3!
  const isCrit = Math.random() < 0.03;
  if (isCrit) {
    finalEarn *= 3;
  }

  // Energy consumption per tap (8 energy per tap)
  const energyCost = Math.min(game.energy, 8);
  if (energyCost <= 0) return;

  game.energy = Math.max(0, game.energy - energyCost);
  
  // Award strictly the earned coins
  game.coins += finalEarn;

  sounds.playPop(isCrit || isOverdrive);

  // Floating click animation
  createFloatingText(clientX, clientY, `+${finalEarn}`, isCrit, isOverdrive);

  // If energy just reached 0, activate Turbo Recharging!
  if (game.energy <= 0 && !isTurboCharging) {
    isTurboCharging = true;
    const energyDisp = document.querySelector(".energy-display");
    if (energyDisp) energyDisp.classList.add("recharging");
    showToast("⚡ Energiya tugadi! Super tez tiklanish boshlandi!", "🚀");
  }

  // 3D Perspective Tilt on Tap
  const rect = hamsterRing.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = (clientX - centerX) / (rect.width / 2);
  const deltaY = (clientY - centerY) / (rect.height / 2);

  hamsterRing.style.transform = `perspective(500px) rotateX(${-deltaY * 16}deg) rotateY(${deltaX * 16}deg) scale(0.96)`;
  setTimeout(() => {
    hamsterRing.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)";
  }, 90);

  updateUI();
}

function createFloatingText(x, y, text, isCrit = false, isOverdrive = false) {
  const el = document.createElement("div");
  el.className = `floating-tap-number ${isCrit ? "crit" : ""}`;
  if (isCrit) {
    el.innerText = `🔥 ${text} CRIT!`;
  } else if (isOverdrive) {
    el.innerText = `⚡ ${text} 2X!`;
  } else {
    el.innerText = text;
  }
  el.style.left = `${x - 20}px`;
  el.style.top = `${y - 30}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), isCrit ? 1000 : 800);
}

hamsterRing.addEventListener("touchstart", (e) => {
  e.preventDefault();
  for (let i = 0; i < e.touches.length; i++) {
    const t = e.touches[i];
    handleTap(t.clientX, t.clientY);
  }
}, { passive: false });

hamsterRing.addEventListener("mousedown", (e) => {
  handleTap(e.clientX, e.clientY);
});

// ================= DYNAMIC ENERGY RECOVERY (TURBO WHEN EMPTY) =================
// Ticks every 200ms (5 times a second)
setInterval(() => {
  if (game.energy < game.maxEnergy) {
    // If energy was depleted to 0, it recovers at SUPER TURBO SPEED (+6 per 200ms = +30/sec)!
    // Otherwise normal steady regen (+1.5 per 200ms = +7.5/sec)
    const regenStep = isTurboCharging ? 6 : 1.5;
    game.energy = Math.min(game.maxEnergy, game.energy + regenStep);
    
    document.getElementById("currentEnergy").innerText = Math.floor(game.energy);

    // When fully charged after being empty, grant 2X Overdrive power!
    if (game.energy >= game.maxEnergy && isTurboCharging) {
      isTurboCharging = false;
      overdriveTapsLeft = 20; // 20 boosted taps
      const energyDisp = document.querySelector(".energy-display");
      if (energyDisp) energyDisp.classList.remove("recharging");
      sounds.playUpgrade();
      showToast("🔋 Energiya 100% to'ldi! 2X Kuchayish faol! ⚡", "🔥");
    }
  }
}, 200);

// Passive income ticker (every 1 second)
setInterval(() => {
  if (game.profitPerHour > 0) {
    game.coins += game.profitPerHour / 3600;
    document.getElementById("totalBalance").innerText = formatNum(game.coins);
  }
}, 1000);

// Auto-save every 4s
setInterval(() => game.save(), 4000);

// ================= MODALS & CONTROLLER =================
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("open");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("open");
}

document.querySelectorAll(".modal-overlay").forEach(m => {
  m.addEventListener("click", (e) => {
    if (e.target === m) m.classList.remove("open");
  });
  const c = m.querySelector(".modal-close");
  if (c) c.onclick = () => m.classList.remove("open");
});

document.getElementById("statEarnTap").onclick = () => openModal("boostModal");
document.getElementById("statLevelUp").onclick = () => showToast("Ko'proq tanga to'plang!", "🏆");
document.getElementById("statProfitHour").onclick = () => {
  renderMineCards();
  openModal("mineModal");
};
document.getElementById("boostModalBtn").onclick = () => openModal("boostModal");

// Nav Bar
document.getElementById("navExchange").onclick = () => setActiveNav("navExchange");
document.getElementById("navMine").onclick = () => {
  setActiveNav("navMine");
  renderMineCards();
  openModal("mineModal");
};
document.getElementById("navFriends").onclick = () => {
  setActiveNav("navFriends");
  renderFriendsList();
  openModal("friendsModal");
};
document.getElementById("navEarn").onclick = () => {
  setActiveNav("navEarn");
  renderTasks();
  openModal("earnModal");
};
document.getElementById("navAirdrop").onclick = () => {
  setActiveNav("navAirdrop");
  showToast("Airdrop tez kunda boshlanadi!", "🪂");
};

function setActiveNav(btnId) {
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(btnId).classList.add("active");
}

// ================= MINE CARDS =================
let currentCategory = "markets";

function renderMineCards() {
  const container = document.getElementById("mineCardsGrid");
  container.innerHTML = "";

  const filtered = game.cards.filter(c => c.category === currentCategory);
  filtered.forEach(card => {
    const cost = Math.floor(card.baseCost * Math.pow(1.5, card.level));
    const profitBonus = Math.floor(card.baseProfit * Math.pow(1.15, card.level));

    const cardEl = document.createElement("div");
    cardEl.className = "mine-card";
    cardEl.innerHTML = `
      <div class="card-top">
        <div class="card-icon">${card.icon}</div>
        <div>
          <div class="card-name">${card.name}</div>
          <div class="card-profit">+${formatNum(profitBonus)}/hr</div>
        </div>
      </div>
      <div class="card-bot">
        <span>lvl ${card.level}</span>
        <span class="card-cost">🪙 ${formatNum(cost)}</span>
      </div>
    `;

    cardEl.onclick = () => {
      if (game.coins >= cost) {
        game.coins -= cost;
        card.level++;
        game.profitPerHour += profitBonus;
        sounds.playUpgrade();
        showToast(`${card.name} yangilandi!`, "🚀");
        updateUI();
        renderMineCards();
        game.save();
      } else {
        showToast("Mablag' yetarli emas!", "❌");
      }
    };

    container.appendChild(cardEl);
  });
}

document.querySelectorAll(".cat-pill").forEach(p => {
  p.onclick = () => {
    document.querySelectorAll(".cat-pill").forEach(x => x.classList.remove("active"));
    p.classList.add("active");
    currentCategory = p.getAttribute("data-cat");
    renderMineCards();
  };
});

// ================= BOOSTS (TIERED MULTITAP UPGRADE) =================
document.getElementById("claimFullEnergyBtn").onclick = () => {
  if (game.freeEnergyLeft > 0) {
    game.freeEnergyLeft--;
    game.energy = game.maxEnergy;
    sounds.playUpgrade();
    showToast("Energiya 100% to'ldirildi! ⚡");
    closeModal("boostModal");
    updateUI();
    game.save();
  } else {
    showToast("Bugungi limit tugadi!", "❌");
  }
};

document.getElementById("upgradeMultitapBtn").onclick = () => {
  const nextTierIndex = game.multitapTierIndex + 1;
  if (nextTierIndex >= MULTITAP_TIERS.length) {
    showToast("Maksimal Multitap (+50) ga yetdingiz!", "👑");
    return;
  }

  const nextTier = MULTITAP_TIERS[nextTierIndex];
  if (game.coins >= nextTier.cost) {
    game.coins -= nextTier.cost;
    game.multitapTierIndex = nextTierIndex;
    sounds.playUpgrade();
    showToast(`Multitap kuchaytirildi! Endi bosishda: +${nextTier.tap} 🪙`, "👆");
    closeModal("boostModal");
    updateUI();
    game.save();
  } else {
    showToast(`Mablag' yetarli emas! Kerak: ${formatNum(nextTier.cost)} 🪙`, "❌");
  }
};

document.getElementById("upgradeEnergyLimitBtn").onclick = () => {
  const cost = game.energyLimitLevel * 2000;
  if (game.coins >= cost) {
    game.coins -= cost;
    game.energyLimitLevel++;
    game.maxEnergy += 500;
    game.energy += 500;
    sounds.playUpgrade();
    showToast(`Maksimal energiya ${game.maxEnergy}! 🔋`);
    closeModal("boostModal");
    updateUI();
    game.save();
  } else {
    showToast("Mablag' yetarli emas!", "❌");
  }
};

// ================= TASKS & FRIENDS =================
function renderTasks() {
  const list = document.getElementById("tasksList");
  list.innerHTML = "";
  game.tasks.forEach(t => {
    const el = document.createElement("div");
    el.className = "task-card";
    el.innerHTML = `
      <div>
        <div class="task-title">${t.title}</div>
        <div class="task-reward">+${formatNum(t.reward)} 🪙</div>
      </div>
      <div>${t.completed ? "✅" : "➡️"}</div>
    `;
    el.onclick = () => {
      if (!t.completed) {
        t.completed = true;
        game.coins += t.reward;
        sounds.playUpgrade();
        showToast(`Vazifa bajarildi! +${formatNum(t.reward)} 🪙`);
        updateUI();
        renderTasks();
        game.save();
      }
    };
    list.appendChild(el);
  });
}

function renderFriendsList() {
  const list = document.getElementById("friendsList");
  list.innerHTML = "";
  if (game.friends.length === 0) {
    list.innerHTML = "<p style='color:#858b97;text-align:center;padding:12px;'>Hali do'stlar yo'q</p>";
  } else {
    game.friends.forEach(f => {
      const el = document.createElement("div");
      el.className = "task-card";
      el.innerHTML = `<span>👤 ${f}</span><span style="color:#2ebd85;">+2.5K/hr</span>`;
      list.appendChild(el);
    });
  }
}

document.getElementById("simulateFriendBtn").onclick = () => {
  const name = "Friend_" + Math.floor(Math.random() * 9000 + 1000);
  game.friends.push(name);
  game.coins += 5000;
  sounds.playUpgrade();
  showToast(`Do'st qo'shildi: ${name}! +5,000 🪙`);
  renderFriendsList();
  updateUI();
  game.save();
};

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  game.load();
  updateUI();
});
