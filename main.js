document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupCustomCursor();
  
  // Render dynamic elements
  renderGames();
  renderTeam();
  renderFeaturedProject();
  
  // Custom deep link routing
  handleGameDeepLinking();
  
  // Initialize the Arcade Cabinet
  initArcadeCabinet();
  
  setupAudioSynth();
  setupCardGlow();
  setupContextSpecifics();

  // Run loader setup after rendering dynamic elements to track all image preloads
  setupLoader();
});

// 1. PAGE LOADER & IMAGE PRELOADER ENGINE
function setupLoader() {
  const loader = document.querySelector('.loader-wrapper');
  const barFill = document.querySelector('.loader-bar-fill');
  if (!loader) return;

  let isHidden = false;

  function hideLoader() {
    if (isHidden) return;
    isHidden = true;

    if (barFill) barFill.style.width = '100%';

    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      setTimeout(() => {
        if (loader && loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, 500);
    }, 200);
  }

  // Gather all unique image URLs from DOM, GAMES_DATA, and TEAM_DATA
  const imageUrls = new Set();

  // DOM <img> tags
  document.querySelectorAll('img').forEach(img => {
    if (img.src) imageUrls.add(img.src);
  });

  // GAMES_DATA images & icons
  if (typeof GAMES_DATA !== 'undefined' && Array.isArray(GAMES_DATA)) {
    GAMES_DATA.forEach(game => {
      if (Array.isArray(game.images)) {
        game.images.forEach(src => { if (src) imageUrls.add(src); });
      }
      if (game.icon && typeof game.icon === 'string' && (game.icon.endsWith('.png') || game.icon.endsWith('.jpg') || game.icon.endsWith('.svg') || game.icon.endsWith('.webp') || game.icon.includes('/'))) {
        imageUrls.add(game.icon);
      }
    });
  }

  // TEAM_DATA icons
  if (typeof TEAM_DATA !== 'undefined' && Array.isArray(TEAM_DATA)) {
    TEAM_DATA.forEach(member => {
      if (member.icon && typeof member.icon === 'string' && (member.icon.endsWith('.png') || member.icon.endsWith('.jpg') || member.icon.endsWith('.svg') || member.icon.endsWith('.webp') || member.icon.includes('/'))) {
        imageUrls.add(member.icon);
      }
    });
  }

  const urlArray = Array.from(imageUrls);
  const total = urlArray.length;

  if (total === 0) {
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
      setTimeout(hideLoader, 2500);
    }
    return;
  }

  let loaded = 0;

  function updateProgress() {
    loaded++;
    const percent = Math.min(100, Math.round((loaded / total) * 100));
    if (barFill) {
      barFill.style.width = `${percent}%`;
    }
    if (loaded >= total) {
      hideLoader();
    }
  }

  // Preload every single image
  urlArray.forEach(url => {
    const img = new Image();
    img.onload = updateProgress;
    img.onerror = updateProgress; // Advance on error to prevent hanging on missing assets
    img.src = url;
  });

  // Safety fallback timeout (10s max)
  setTimeout(hideLoader, 10000);
}

// 2. MOBILE NAVIGATION DRAWER
function setupMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.nav-menu');
  
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      menu.classList.toggle('open');
      playRetroBeep(toggle.classList.contains('open') ? 220 : 180, 'triangle', 0.1);
    });
    
    // Close menu when clicking navigation link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        menu.classList.remove('open');
      });
    });
  }
}

// 3. RETRO AUDIO SYNTHESIS (WEB AUDIO API - BOOSTED SOUND ENGINE)
let audioCtx = null;
let masterGain = null;
let masterCompressor = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master Gain Boost Node (2.8x Volume Boost)
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(2.8, audioCtx.currentTime);

    // Dynamics Compressor Limiter to prevent clipping/distortion when boosted
    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-6, audioCtx.currentTime);
    masterCompressor.knee.setValueAtTime(15, audioCtx.currentTime);
    masterCompressor.ratio.setValueAtTime(10, audioCtx.currentTime);
    masterCompressor.attack.setValueAtTime(0.002, audioCtx.currentTime);
    masterCompressor.release.setValueAtTime(0.1, audioCtx.currentTime);

    masterGain.connect(masterCompressor);
    masterCompressor.connect(audioCtx.destination);
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function setupAudioSynth() {
  // Add boosted retro beeps to buttons, links, and cards on click and hover
  const interactiveElements = document.querySelectorAll('a, button, .btn-card, .btn-live, .game-card, .fighter-card, .arcade-menu-item, .filter-btn');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      // Crisp boosted tick on hover
      playRetroBeep(750, 'sine', 0.03, 0.12);
    });
    
    el.addEventListener('click', () => {
      // Punchy boosted beep on click
      if (el.classList.contains('btn-live') || el.classList.contains('nav-cta') || el.classList.contains('arcade-btn-action')) {
        playRetroBeep(520, 'square', 0.15, 0.22);
        setTimeout(() => playRetroBeep(659.25, 'square', 0.18, 0.22), 90);
      } else {
        playRetroBeep(380, 'triangle', 0.09, 0.18);
      }
    });
  });
}

function playRetroBeep(frequency, type = 'sine', duration = 0.1, volume = 0.1) {
  try {
    initAudioContext();
    if (!audioCtx || !masterGain) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    // Smooth volume decay with boosted baseline output
    const boostedVol = Math.min(0.95, volume * 2.2);
    gain.gain.setValueAtTime(boostedVol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Browser blocked autoplay or audio context not supported
  }
}

// 4. MOUSE SPOTLIGHT GLOW EFFECT (FIGHTER CARDS)
function setupCardGlow() {
  const cards = document.querySelectorAll('.fighter-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate cursor position in percentages
      const xPercent = Math.round((x / rect.width) * 100);
      const yPercent = Math.round((y / rect.height) * 100);
      
      // Inject background-gradient offset dynamically
      card.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(var(--accent-color-rgb), 0.15) 0%, var(--color-bg-card) 60%)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

// 5. PAGE-SPECIFIC INTERACTIVE WIDGETS
function setupContextSpecifics() {
  // A. Home Page (index.html): Simulation Terminal Console
  const terminalBody = document.getElementById('dev-terminal-body');
  if (terminalBody) {
    runHomeTerminalSimulation(terminalBody);
  }
  
  // B. Games Page (games.html): Filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  const gameCards = document.querySelectorAll('.game-card');
  if (filterBtns.length > 0 && gameCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        playRetroBeep(400, 'triangle', 0.05, 0.08);
        
        gameCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            setTimeout(() => card.style.opacity = '1', 50);
          } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
          }
        });
      });
    });
  }
  
  // C. Contact Page (contact.html): Terminal Log Submission
  const contactForm = document.getElementById('studio-contact-form');
  const terminalConsole = document.getElementById('contact-terminal-log');
  if (contactForm && terminalConsole) {
    setupContactFormTerminal(contactForm, terminalConsole);
  }
}

// --- SIMULATED TERMINAL WIDGET (Home Page) ---
function runHomeTerminalSimulation(element) {
  const logs = [
    'Initializing odd7games development feed...',
    'Connecting to repo core-void_runner.git...',
    'Update: [Artist] pushed 14 sprite sheets (Level 3 Cyberpunk City).',
    'Compile check: Void Runner build v0.8.2-beta - SUCCESS.',
    'Update: [Coder] resolved collider bugs on dynamic platforms.',
    'Deploy: Internal Alpha Build uploaded to staging servers.',
    'System: Running performance audit... LCP target is 60fps on Steam Deck.',
    'Update: [Sound] uploaded 3 new synth tracks (Area 2 soundtrack).',
    'Update: [Design] adjusted weapon recoil curves & jump velocity values.',
    'Update: [Coder] optimized texture compression to reduce disk foot-print.',
    'Sync: Database server synchronized with 4 node clusters.',
    'Status Check: All systems nominal. Fueling caffeine tanks...'
  ];
  
  let lineIdx = 0;
  
  function addTerminalLine() {
    if (lineIdx < logs.length) {
      const p = document.createElement('p');
      p.className = 'terminal-line';
      p.innerHTML = `<span class="terminal-prompt">></span> ${logs[lineIdx]}`;
      element.appendChild(p);
      element.scrollTop = element.scrollHeight;
      lineIdx++;
      
      // Schedule next line
      const randomTime = Math.random() * 2000 + 1500;
      setTimeout(addTerminalLine, randomTime);
    } else {
      // Reset loop
      lineIdx = 2; // don't repeat initializations
      setTimeout(addTerminalLine, 2000);
    }
  }
  
  // Start simulation
  setTimeout(addTerminalLine, 500);
}




// --- CONTACT SUBMIT TERMINAL STYLING & GOOGLE FORMS INTEGRATION ---
function setupContactFormTerminal(form, consoleEl) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Get the values from your UI
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    
    // 2. Prepare the data for Google Forms
    const formData = new URLSearchParams();
    formData.append('entry.1109224288', name);    
    formData.append('entry.1073111076', email);   
    formData.append('entry.1756205073', subject); 
    formData.append('entry.960216680', message);  

    const googleFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSeA-DZFBoTl15EKgDsdAFvGrxLMV5sxz7EKp13dWprymH1NNQ/formResponse';
    
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    // Reset terminal display
    consoleEl.innerHTML = '';
    consoleEl.style.display = 'block';

    // Helper function to print a line with a delay and sound
    const printLine = (text, isSuccess = false, isError = false) => {
      return new Promise((resolve) => {
        const line = document.createElement('div');
        line.className = 'console-log-line';
        if (isSuccess) {
          line.style.color = 'var(--color-neon-green)';
          playRetroBeep(880, 'square', 0.2, 0.1);
        } else if (isError) {
          line.style.color = 'var(--color-neon-pink)';
          playRetroBeep(150, 'sawtooth', 0.3, 0.15);
        } else {
          playRetroBeep(440, 'sine', 0.05, 0.05);
        }
        line.innerHTML = `<span class="prompt">$</span> ${text}`;
        consoleEl.appendChild(line);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        setTimeout(resolve, 350);
      });
    };

    // Print connection logs
    await printLine('STATUS: Form Submission Requested.');
    await printLine('CONNECTING: odd7games mail router...');
    await printLine('VERIFYING: Credentials & data packets...');
    await printLine(`PACKET: From="${name}" Email="${email}"`);
    await printLine(`SUBJECT: "${subject}"`);
    await printLine('ROUTE: Dispatching message payload...');

    try {
      // 3. Send the data silently in the background
      await fetch(googleFormURL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      // If we got here, transmission succeeded (no network error)
      await printLine('LOG: Compiling mail script...');
      await printLine('SUCCESS: Message delivered to the studio database!', true);
      await printLine('STATUS: Active connection CLOSED.');
      
      // Reset form inputs and enable submit button
      form.reset();
      submitBtn.disabled = false;
      
      setTimeout(() => {
        alert('Transmission sent successfully, Agent! We will contact you soon.');
      }, 300);
      
    } catch (err) {
      console.error('Transmission error:', err);
      // Transmission failed
      await printLine('ERROR: Uplink failed. Connection lost.', false, true);
      await printLine('STATUS: Active connection CLOSED.');
      
      submitBtn.disabled = false;
      
      setTimeout(() => {
        alert('Transmission failed! Please check your network connection and try again.');
      }, 300);
    }
  });
}


// --- DYNAMIC RENDER FUNCTIONS FOR MODULAR CONFIGS ---

// Helper function to render icon as either an image or emoji/text
function renderIcon(icon, alt = '') {
  if (!icon) return '';
  const isImage = typeof icon === 'string' && (
    /\.(png|jpe?g|svg|webp|gif|avif|ico)(\?.*)?$/i.test(icon) ||
    /^(assets\/|images\/|https?:\/\/|\/|data:image\/)/i.test(icon)
  );

  if (isImage) {
    return `<img src="${icon}" alt="${alt}" class="card-icon-img" />`;
  }
  return icon;
}

function renderGames() {
  const container = document.getElementById('games-grid');
  if (!container || typeof GAMES_DATA === 'undefined') return;

  container.innerHTML = GAMES_DATA.map(game => {
    // Merge stats and featuredStat/featuredStats
    let cardStatsList = [];
    if (Array.isArray(game.stats) && game.stats.length > 0) {
      cardStatsList = [...game.stats];
    }
    if (Array.isArray(game.featuredStats)) {
      cardStatsList = [...cardStatsList, ...game.featuredStats];
    } else if (Array.isArray(game.featuredStat)) {
      cardStatsList = [...cardStatsList, ...game.featuredStat];
    } else if (game.featuredStat && typeof game.featuredStat === 'object') {
      cardStatsList.push(game.featuredStat);
    }
    
    // Filter duplicates
    const uniqueStats = cardStatsList.filter((stat, idx, self) =>
      idx === self.findIndex((s) => s.label === stat.label && s.value === stat.value)
    );

    const statsHtml = uniqueStats.map(stat => `
      <div class="card-stats">
        <span class="stat-label">${stat.label}</span>
        <span class="stat-val" style="${getGameStatStyle(game.accentClass)}">${stat.value}</span>
      </div>
    `).join('');

    const hasImages = game.images && game.images.length > 0;
    const buttonTextStyle = (game.accentClass === 'accent-red' || game.accentClass === 'accent-purple') ? 'color: #fff;' : 'color: #000;';

    // Horizontal Scroll Gallery under stats
    const galleryHtml = hasImages ? `
      <div class="card-gallery-scroll" onclick="event.stopPropagation();">
        ${game.images.map((imgSrc, imgIndex) => `
          <div class="gallery-scroll-item" title="Click to view" onclick="event.stopPropagation(); openGallery(${JSON.stringify(game.images).replace(/"/g, '&quot;')}, ${imgIndex}, '${game.title}', '${game.accentClass}')">
            <img src="${imgSrc}" alt="${game.title} screenshot ${imgIndex + 1}" loading="lazy" />
          </div>
        `).join('')}
      </div>
    ` : '';

    const hasValidLink = game.buttonLink && game.buttonLink.trim() !== '' && game.buttonLink.trim() !== '#';

    const actionBtnOnClick = hasValidLink
      ? `onclick="event.stopPropagation(); window.open('${game.buttonLink.trim()}', '_blank');"`
      : `onclick="event.stopPropagation(); event.preventDefault(); return false;"`;

    const actionBtnStyle = hasValidLink
      ? `width: auto; padding: 9px 22px; background-color: var(--accent-color, var(--color-neon-yellow)); ${buttonTextStyle} font-weight: 900; cursor: pointer;`
      : `width: auto; padding: 9px 22px; background-color: rgba(255,255,255,0.08); color: var(--color-text-muted); border-color: rgba(255,255,255,0.2); font-weight: 700; cursor: default; opacity: 0.75;`;

    return `
      <div class="fighter-card ${game.accentClass} game-card" id="${game.id}" data-category="${game.category}" style="transition: opacity 0.3s ease;">
        <div>
          <div class="card-header">
            <div class="card-icon">${renderIcon(game.icon, game.title)}</div>
            <div class="card-title-group">
              <h3 class="card-title">${game.title}</h3>
              <span class="card-subtitle">${game.subtitle}</span>
            </div>
          </div>
          <div class="card-body">
            ${game.description}
            ${game.quote ? `<div class="card-quote">"${game.quote}"</div>` : ''}
          </div>
        </div>
        <div>
          ${statsHtml}
          ${galleryHtml}
          <div class="card-action" style="display: flex; justify-content: flex-start; margin-top: 10px;">
            <button class="btn-card ${!hasValidLink ? 'btn-no-link' : ''}" style="${actionBtnStyle}" ${actionBtnOnClick}>${game.buttonText}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Helper to determine the stat-val background color style based on the accent class
function getGameStatStyle(accentClass) {
  switch (accentClass) {
    case 'accent-red':
      return 'background-color: var(--color-neon-pink); color: #fff;';
    case 'accent-cyan':
      return 'background-color: var(--color-neon-cyan); color: #000; font-weight: 900;';
    case 'accent-green':
      return 'background-color: var(--color-neon-green); color: #000; font-weight: 900;';
    case 'accent-purple':
      return 'background-color: var(--color-neon-purple); color: #fff;';
    case 'accent-yellow':
      return 'background-color: var(--color-neon-yellow); color: #000; font-weight: 900;';
    case 'accent-orange':
      return 'background-color: var(--color-neon-orange); color: #000; font-weight: 900;';
    default:
      return 'background-color: var(--color-primary); color: #000;';
  }
}

function renderTeam() {
  const container = document.getElementById('team-grid');
  if (!container || typeof TEAM_DATA === 'undefined') return;

  container.innerHTML = TEAM_DATA.map(member => {
    // Generate the stats HTML blocks
    const statsHtml = member.stats.map(stat => `
      <div class="card-stats">
        <span class="stat-label">${stat.label}</span>
        <span class="stat-val">${stat.value}</span>
      </div>
    `).join('');

    const isLongBio = member.bio && member.bio.trim().length > 150;

    return `
      <div class="fighter-card ${member.accentClass}">
        <div>
          <div class="card-header">
            <div class="card-icon">${renderIcon(member.icon, member.name)}</div>
            <div class="card-title-group">
              <h3 class="card-title">${member.name}</h3>
              <span class="card-subtitle">${member.role}</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-bio">
              <div class="bio-content ${isLongBio ? 'is-truncated' : ''}">${member.bio}</div>
              ${isLongBio ? `<button class="bio-toggle-btn" onclick="toggleBio(this)">SHOW MORE ▼</button>` : ''}
            </div>
            ${member.quote ? `<div class="card-quote">"${member.quote}"</div>` : ''}
          </div>
        </div>
        <div>
          ${statsHtml}
          <div class="card-action">
            <button class="btn-card" onclick="window.open('${member.buttonLink || '#'}', '_blank')">${member.buttonText}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleBio(btn) {
  const container = btn.closest('.card-bio');
  if (!container) return;
  const content = container.querySelector('.bio-content');
  if (!content) return;

  const isTruncated = content.classList.toggle('is-truncated');
  if (!isTruncated) {
    btn.innerHTML = 'SHOW LESS ▲';
    btn.classList.add('expanded');
  } else {
    btn.innerHTML = 'SHOW MORE ▼';
    btn.classList.remove('expanded');
  }
}

function renderFeaturedProject() {
  const container = document.getElementById('featured-project-container');
  if (!container || typeof GAMES_DATA === 'undefined') return;

  const sectionParent = container.closest('section');

  // Find game explicitly marked with featuredOnHome: true
  let featuredGame = GAMES_DATA.find(game => game.featuredOnHome === true);
  if (!featuredGame) {
    container.innerHTML = '';
    if (sectionParent) sectionParent.style.display = 'none';
    return;
  }

  if (sectionParent) sectionParent.style.display = 'block';

  const accentClass = featuredGame.accentClass || 'accent-red';
  const labelText = featuredGame.featuredLabel || 'OUT NOW';
  const textStyle = (accentClass === 'accent-red' || accentClass === 'accent-purple') ? 'color: #fff;' : 'color: #000; font-weight: 900;';
  const hasImages = featuredGame.images && featuredGame.images.length > 0;
  const hasFeaturedValidLink = featuredGame.buttonLink && featuredGame.buttonLink.trim() !== '' && featuredGame.buttonLink.trim() !== '#';

  // Support featuredStats array, featuredStat array/object, or fallback to game.stats
  let statsList = [];
  if (Array.isArray(featuredGame.featuredStats)) {
    statsList = featuredGame.featuredStats;
  } else if (Array.isArray(featuredGame.featuredStat)) {
    statsList = featuredGame.featuredStat;
  } else if (featuredGame.featuredStat && typeof featuredGame.featuredStat === 'object') {
    statsList = [featuredGame.featuredStat];
  } else if (Array.isArray(featuredGame.stats) && featuredGame.stats.length > 0) {
    statsList = featuredGame.stats;
  } else {
    statsList = [{ label: "DEVELOPMENT", value: "IN PROGRESS" }];
  }

  const featuredStatsHtml = statsList.map(stat => `
    <div class="card-stats" style="margin-bottom: 10px;">
      <span class="stat-label">${stat.label}</span>
      <span class="stat-val" style="${getGameStatStyle(accentClass)}">${stat.value}</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="fighter-card ${accentClass}" style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: row; flex-wrap: wrap; gap: 30px; padding: 30px; cursor: ${hasImages ? 'pointer' : 'default'};" onclick="${hasImages ? `openGallery(${JSON.stringify(featuredGame.images).replace(/"/g, '&quot;')}, 0, '${featuredGame.title}', '${featuredGame.accentClass}')` : ''}">
      <!-- Image generated left side -->
      <div style="flex: 1 1 300px; border: 3px solid #000; border-radius: 2px; overflow: hidden; background-color: #04020a; display: flex; align-items: center; justify-content: center; position: relative; height: 260px;">
        <!-- Visual neon filler representing the gameplay screenshot -->
        <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(var(--accent-color-rgb),0.2), rgba(6,3,19,0.9)), repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 10px, transparent 10px, transparent 20px); z-index: 1;"></div>
        <div style="z-index: 2; text-align: center; padding: 20px;">
          <span style="background-color: var(--accent-color); ${textStyle} padding: 4px 10px; font-family: var(--font-display); font-weight: 900; font-size: 0.75rem; text-transform: uppercase; display: inline-block; transform: skewX(-10deg); border: 1px solid #000; box-shadow: 2px 2px 0px #000; margin-bottom: 12px;">${labelText}</span>
          <h3 style="font-family: var(--font-display); font-weight: 900; font-style: italic; font-size: 2.2rem; text-shadow: 2px 2px 0px #000; color: #fff;">${featuredGame.title}</h3>
        </div>
      </div>
      
      <!-- Info right side -->
      <div style="flex: 1 1 300px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-family: var(--font-display); font-weight: 900; font-style: italic; font-size: 1.8rem; color: var(--accent-color); text-transform: uppercase; margin-bottom: 5px;">${featuredGame.title}</h3>
          <h4 style="font-family: var(--font-display); font-size: 0.8rem; text-transform: uppercase; color: var(--color-text-muted); letter-spacing: 1.5px; margin-bottom: 15px;">GENRE: ${featuredGame.subtitle}</h4>
          <p style="font-size: 0.95rem; color: var(--color-text); margin-bottom: 20px;">
            ${featuredGame.description}
          </p>
        </div>
        
        <div>
          <!-- Card Stats inside -->
          <div style="margin-bottom: 15px;">
            ${featuredStatsHtml}
          </div>
          
          <div style="display: flex; gap: 10px;">
            <a href="games.html" class="btn-card" style="text-align: center; text-decoration: none; border-color: var(--accent-color); color: #fff; background-color: transparent; flex: 1;" onclick="event.stopPropagation();">PLAY DEMO</a>
            ${hasFeaturedValidLink
              ? `<a href="${featuredGame.buttonLink.trim()}" target="_blank" class="btn-card" style="text-align: center; text-decoration: none; border-color: var(--accent-color); ${textStyle} background-color: var(--accent-color); flex: 1.2; font-weight: 900;" onclick="event.stopPropagation();">${featuredGame.buttonText}</a>`
              : `<button class="btn-card btn-no-link" style="text-align: center; text-decoration: none; border-color: rgba(255,255,255,0.2); color: var(--color-text-muted); background-color: rgba(255,255,255,0.08); flex: 1.2; font-weight: 700; opacity: 0.75; cursor: default;" onclick="event.stopPropagation(); event.preventDefault(); return false;">${featuredGame.buttonText}</button>`}
          </div>
        </div>
      </div>
    </div>
  `;
}


// --- LIGHTBOX IMAGE GALLERY LIGHTBOX ENGINE ---

let currentGalleryImages = [];
let currentGalleryIndex = 0;
let currentGalleryAccent = 'accent-yellow';

function createGalleryModal() {
  if (document.getElementById('gallery-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'gallery-modal';
  modal.className = 'gallery-modal';
  modal.innerHTML = `
    <div class="gallery-modal-content">
      <div class="gallery-modal-header">
        <span class="gallery-modal-title" id="gallery-modal-title">TRANSMISSION LOGS</span>
      </div>
      <button class="gallery-modal-close-btn" id="gallery-modal-close" aria-label="Close Gallery">✕</button>
      
      <div class="gallery-slideshow-container" id="gallery-slideshow">
        <!-- Slides dynamically injected -->
      </div>
      
      <button class="gallery-nav-btn prev" id="gallery-prev" aria-label="Previous Image">◀</button>
      <button class="gallery-nav-btn next" id="gallery-next" aria-label="Next Image">▶</button>
      
      <div class="gallery-modal-footer">
        <div class="gallery-caption" id="gallery-caption">Image Caption</div>
        <div class="gallery-counter" id="gallery-counter">1 / 1</div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Setup event listeners
  document.getElementById('gallery-modal-close').addEventListener('click', closeGallery);
  document.getElementById('gallery-prev').addEventListener('click', () => navigateGallery(-1));
  document.getElementById('gallery-next').addEventListener('click', () => navigateGallery(1));
  
  // Close when clicking overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeGallery();
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleGalleryKeydowns);
}

function openGallery(images, startIdx = 0, gameTitle = 'TRANSMISSION', accentClass = 'accent-yellow') {
  createGalleryModal();
  
  currentGalleryImages = images;
  currentGalleryIndex = startIdx;
  currentGalleryAccent = accentClass;

  const modal = document.getElementById('gallery-modal');
  const modalContent = modal.querySelector('.gallery-modal-content');
  const title = document.getElementById('gallery-modal-title');
  
  // Apply accent class variables to the modal content card
  modalContent.className = `gallery-modal-content ${accentClass}`;
  title.innerText = `${gameTitle} // TRANSMISSION LOGS`;

  renderGallerySlide();
  
  modal.classList.add('open');
  playRetroBeep(440, 'square', 0.15, 0.1);
  setTimeout(() => playRetroBeep(554.37, 'square', 0.15, 0.1), 80);
}

function closeGallery() {
  const modal = document.getElementById('gallery-modal');
  if (modal) {
    modal.classList.remove('open');
    playRetroBeep(330, 'triangle', 0.08, 0.1);
  }
}

function renderGallerySlide() {
  const slideshow = document.getElementById('gallery-slideshow');
  const caption = document.getElementById('gallery-caption');
  const counter = document.getElementById('gallery-counter');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  if (!currentGalleryImages || currentGalleryImages.length === 0) {
    slideshow.innerHTML = `
      <div style="color: var(--color-text-muted); font-style: italic; font-family: 'Courier New', Courier, monospace; text-align: center; padding: 20px;">
        [ ERROR ] NO LOG PACKETS FOUND IN DATABASE.
      </div>
    `;
    caption.innerText = 'No screenshots uploaded.';
    counter.innerText = '0 / 0';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    return;
  }

  prevBtn.style.display = currentGalleryImages.length > 1 ? 'flex' : 'none';
  nextBtn.style.display = currentGalleryImages.length > 1 ? 'flex' : 'none';

  const imagePath = currentGalleryImages[currentGalleryIndex];
  // Extract filename as a nice caption
  const filename = imagePath.split('/').pop().split('.')[0].replace(/_/g, ' ').toUpperCase();

  slideshow.innerHTML = `<img src="${imagePath}" class="gallery-slide-img active" alt="${filename}">`;
  caption.innerText = filename;
  counter.innerText = `${currentGalleryIndex + 1} / ${currentGalleryImages.length}`;
}

function navigateGallery(direction) {
  if (!currentGalleryImages || currentGalleryImages.length <= 1) return;

  currentGalleryIndex += direction;
  if (currentGalleryIndex < 0) {
    currentGalleryIndex = currentGalleryImages.length - 1;
  } else if (currentGalleryIndex >= currentGalleryImages.length) {
    currentGalleryIndex = 0;
  }

  playRetroBeep(600, 'sine', 0.02, 0.05);
  renderGallerySlide();
}

function handleGalleryKeydowns(e) {
  const modal = document.getElementById('gallery-modal');
  if (!modal || !modal.classList.contains('open')) return;

  if (e.key === 'Escape') {
    closeGallery();
  } else if (e.key === 'ArrowLeft') {
    navigateGallery(-1);
  } else if (e.key === 'ArrowRight') {
    navigateGallery(1);
  }
}


// --- DEEP LINK ROUTING FOR GAMES CATALOG ---
function handleGameDeepLinking() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('game');
  if (gameId) {
    // Wait slightly to make sure rendering and layout settle
    setTimeout(() => {
      const card = document.getElementById(gameId);
      if (card) {
        // Clear active button filter state to reveal the game if filtered out
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (filterBtns.length > 0) {
          const allBtn = Array.from(filterBtns).find(btn => btn.getAttribute('data-filter') === 'all');
          if (allBtn) allBtn.click(); // trigger reset filter to 'all'
        }
        
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('card-highlight-flash');
        
        // Remove highlight flash after animation ends
        setTimeout(() => {
          card.classList.remove('card-highlight-flash');
        }, 2000);
      }
    }, 400);
  }
}

// --- RETRO ARCADE CABINET MINI-GAME ENGINE ---

let arcadeScores = {
  flappy: 0,
  snake: 0,
  ttt: 0
};

// Load scores from localStorage
if (localStorage.getItem('odd7_arcade_scores')) {
  try {
    arcadeScores = JSON.parse(localStorage.getItem('odd7_arcade_scores'));
  } catch (e) {}
}

function saveArcadeScores() {
  localStorage.setItem('odd7_arcade_scores', JSON.stringify(arcadeScores));
}

let activeGame = null;
let gameInterval = null;
let gameCanvas = null;
let gameCtx = null;
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttPlayer = 'X';
let tttActive = true;

// Void Flier (Flappy Bird) physics variables
let bird = { y: 150, velocity: 0, gravity: 0.3, lift: -5.5, size: 10 };
let pipes = [];
let flappyScore = 0;
let flappyGameOver = false;

// Data Worm (Snake) variables
let snake = [];
let snakeDir = { x: 1, y: 0 };
let snakeNextDir = { x: 1, y: 0 };
let wormFood = { x: 0, y: 0 };
let snakeScore = 0;
let snakeGameOver = false;
const gridCount = 20;

function initArcadeCabinet() {
  // 1. Create floating launcher button
  if (document.getElementById('arcade-launcher')) return;
  const launcher = document.createElement('button');
  launcher.id = 'arcade-launcher';
  launcher.className = 'floating-arcade-btn';
  launcher.title = 'Open Arcade Cabinet';
  launcher.innerHTML = '👾';
  document.body.appendChild(launcher);

  // 2. Setup modal container
  const modal = document.createElement('div');
  modal.id = 'arcade-modal';
  modal.className = 'arcade-modal';
  modal.innerHTML = `
    <div class="arcade-modal-content">
      <div class="gallery-modal-header" style="top: -24px;">
        <span class="gallery-modal-title" style="color: #000;">ODD7_ARCADE_CABINET.SYS</span>
      </div>
      <button class="gallery-modal-close-btn" id="arcade-modal-close" style="top: 15px; right: 15px;">✕</button>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
          <h3 style="font-family: var(--font-display); font-size: 1.4rem; text-transform: uppercase; color: #fff; margin: 0;">STUDIO ARCADE</h3>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);" id="arcade-game-status">SELECT YOUR SIMULATION</span>
        </div>
        <button class="arcade-btn-back" id="arcade-btn-menu" style="display: none;">MAIN MENU</button>
      </div>
      
      <div class="arcade-screen" id="arcade-screen">
        <!-- Interactive menu or active game content -->
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // 3. Event listeners
  launcher.addEventListener('click', openArcade);
  document.getElementById('arcade-modal-close').addEventListener('click', closeArcade);
  document.getElementById('arcade-btn-menu').addEventListener('click', () => {
    stopActiveGame();
    showArcadeMenu();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeArcade();
  });
}

function openArcade() {
  const modal = document.getElementById('arcade-modal');
  if (modal) {
    modal.classList.add('open');
    showArcadeMenu();
    playRetroBeep(440, 'triangle', 0.1, 0.1);
  }
}

function closeArcade() {
  stopActiveGame();
  const modal = document.getElementById('arcade-modal');
  if (modal) {
    modal.classList.remove('open');
    playRetroBeep(250, 'sine', 0.08, 0.1);
  }
}

function stopActiveGame() {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  activeGame = null;
  document.removeEventListener('keydown', handleGameControls);
}

function showArcadeMenu() {
  const screen = document.getElementById('arcade-screen');
  const statusText = document.getElementById('arcade-game-status');
  const menuBtn = document.getElementById('arcade-btn-menu');
  
  statusText.innerText = 'SELECT YOUR SIMULATION';
  menuBtn.style.display = 'none';

  screen.innerHTML = `
    <div class="arcade-menu-list">
      <div class="arcade-menu-item accent-red" onclick="startVoidFlier()">
        <div class="arcade-menu-item-info">
          <span class="arcade-menu-item-title">VOID FLIER</span>
          <span class="arcade-menu-item-desc">Dodge neon gate columns (Flappy Bird)</span>
        </div>
        <span class="arcade-menu-score" style="color: var(--color-neon-pink);">HI: ${arcadeScores.flappy}</span>
      </div>
      
      <div class="arcade-menu-item accent-green" onclick="startDataWorm()">
        <div class="arcade-menu-item-info">
          <span class="arcade-menu-item-title">DATA WORM</span>
          <span class="arcade-menu-item-desc">Consume security database fragments (Snake)</span>
        </div>
        <span class="arcade-menu-score" style="color: var(--color-neon-green);">HI: ${arcadeScores.snake}</span>
      </div>
      
      <div class="arcade-menu-item accent-cyan" onclick="startGridConqueror()">
        <div class="arcade-menu-item-info">
          <span class="arcade-menu-item-title">GRID CONQUEROR</span>
          <span class="arcade-menu-item-desc">Hack matching lines vs core AI (Tic-Tac-Toe)</span>
        </div>
        <span class="arcade-menu-score" style="color: var(--color-neon-cyan);">WINS: ${arcadeScores.ttt}</span>
      </div>
    </div>
  `;
  
  // Update hover sounds
  setupAudioSynth();
}

// --- GAME 1: VOID FLIER (Flappy Bird) ---

function startVoidFlier() {
  stopActiveGame();
  activeGame = 'flappy';
  
  const screen = document.getElementById('arcade-screen');
  const statusText = document.getElementById('arcade-game-status');
  const menuBtn = document.getElementById('arcade-btn-menu');
  
  statusText.innerText = 'VOID FLIER // SPACE OR CLICK TO FLAP';
  menuBtn.style.display = 'block';

  screen.innerHTML = `<canvas class="arcade-canvas" id="flappy-canvas" width="600" height="400"></canvas>`;
  gameCanvas = document.getElementById('flappy-canvas');
  gameCtx = gameCanvas.getContext('2d');

  // Reset parameters
  bird = { y: 180, velocity: 0, gravity: 0.28, lift: -5.6, size: 10 };
  pipes = [];
  flappyScore = 0;
  flappyGameOver = false;
  
  // Add initial pipe
  spawnPipe();

  // Controls listeners
  document.addEventListener('keydown', handleGameControls);
  gameCanvas.addEventListener('mousedown', flapBird);

  // Loop
  gameInterval = setInterval(updateVoidFlier, 1000 / 60);
  playRetroBeep(330, 'square', 0.1, 0.08);
}

function flapBird() {
  if (flappyGameOver) {
    startVoidFlier();
    return;
  }
  bird.velocity = bird.lift;
  playRetroBeep(700, 'sine', 0.04, 0.05);
}

function spawnPipe() {
  const minHeight = 40;
  const maxHeight = 240;
  const height = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
  const gap = 115;
  pipes.push({
    x: 600,
    top: height,
    bottom: 400 - (height + gap),
    passed: false
  });
}

function updateVoidFlier() {
  if (flappyGameOver) {
    drawFlappyGameOver();
    return;
  }

  // Physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Floor/ceiling collision
  if (bird.y > 400 - bird.size || bird.y < bird.size) {
    triggerFlappyDeath();
  }

  // Scroll pipes
  pipes.forEach(pipe => {
    pipe.x -= 2.2;
    
    // Check collision
    if (pipe.x < 150 + bird.size && pipe.x + 50 > 150 - bird.size) {
      if (bird.y - bird.size < pipe.top || bird.y + bird.size > 400 - pipe.bottom) {
        triggerFlappyDeath();
      }
    }

    // Score point
    if (!pipe.passed && pipe.x < 150) {
      pipe.passed = true;
      flappyScore++;
      playRetroBeep(950, 'sine', 0.06, 0.07);
    }
  });

  // Remove offscreen pipes
  if (pipes.length > 0 && pipes[0].x < -60) {
    pipes.shift();
  }

  // Spawner timer
  if (pipes.length === 0 || (pipes[pipes.length - 1].x < 380)) {
    spawnPipe();
  }

  // Render
  gameCtx.fillStyle = '#020108';
  gameCtx.fillRect(0, 0, 600, 400);

  // Draw pipes (cyan neon outlines)
  pipes.forEach(pipe => {
    gameCtx.fillStyle = 'rgba(0, 229, 255, 0.15)';
    gameCtx.strokeStyle = 'var(--color-neon-cyan)';
    gameCtx.lineWidth = 3;

    // Top pipe
    gameCtx.fillRect(pipe.x, 0, 50, pipe.top);
    gameCtx.strokeRect(pipe.x, -5, 50, pipe.top + 5);

    // Bottom pipe
    gameCtx.fillRect(pipe.x, 400 - pipe.bottom, 50, pipe.bottom);
    gameCtx.strokeRect(pipe.x, 400 - pipe.bottom, 50, pipe.bottom + 5);
  });

  // Draw bird (pink neon circle)
  gameCtx.beginPath();
  gameCtx.arc(150, bird.y, bird.size, 0, Math.PI * 2);
  gameCtx.fillStyle = 'var(--color-neon-pink)';
  gameCtx.fill();
  gameCtx.lineWidth = 2;
  gameCtx.strokeStyle = '#fff';
  gameCtx.stroke();
  gameCtx.closePath();

  // Draw Score
  gameCtx.fillStyle = '#fff';
  gameCtx.font = '900 1.2rem var(--font-display)';
  gameCtx.fillText(`SCORE: ${flappyScore}`, 25, 35);
  gameCtx.fillStyle = 'var(--color-neon-pink)';
  gameCtx.fillText(`HI: ${arcadeScores.flappy}`, 520, 35);

  // Scanlines overlay
  drawRetroScanlines();
}

function triggerFlappyDeath() {
  flappyGameOver = true;
  playRetroBeep(120, 'sawtooth', 0.3, 0.12);
  if (flappyScore > arcadeScores.flappy) {
    arcadeScores.flappy = flappyScore;
    saveArcadeScores();
  }
}

function drawFlappyGameOver() {
  gameCtx.fillStyle = 'rgba(2, 1, 8, 0.7)';
  gameCtx.fillRect(0, 0, 600, 400);

  gameCtx.fillStyle = 'var(--color-neon-pink)';
  gameCtx.font = '900 2.2rem var(--font-display)';
  gameCtx.textAlign = 'center';
  gameCtx.fillText('GAME OVER', 300, 170);

  gameCtx.fillStyle = '#fff';
  gameCtx.font = '700 1rem var(--font-body)';
  gameCtx.fillText(`SCORE: ${flappyScore}  //  BEST: ${arcadeScores.flappy}`, 300, 215);
  gameCtx.fillStyle = 'var(--color-neon-cyan)';
  gameCtx.fillText('PRESS SPACE OR CLICK TO RESTART', 300, 255);
  gameCtx.textAlign = 'left'; // reset
}


// --- GAME 2: DATA WORM (Snake) ---

function startDataWorm() {
  stopActiveGame();
  activeGame = 'snake';

  const screen = document.getElementById('arcade-screen');
  const statusText = document.getElementById('arcade-game-status');
  const menuBtn = document.getElementById('arcade-btn-menu');
  
  statusText.innerText = 'DATA WORM // USE ARROW KEYS TO SLITHER';
  menuBtn.style.display = 'block';

  screen.innerHTML = `<canvas class="arcade-canvas" id="snake-canvas" width="400" height="400" style="width:400px; height:400px;"></canvas>`;
  gameCanvas = document.getElementById('snake-canvas');
  gameCtx = gameCanvas.getContext('2d');

  // Reset parameters
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  snakeDir = { x: 1, y: 0 };
  snakeNextDir = { x: 1, y: 0 };
  snakeScore = 0;
  snakeGameOver = false;

  spawnWormFood();

  // Controls listeners
  document.addEventListener('keydown', handleGameControls);

  // Loop (100ms ticks)
  gameInterval = setInterval(updateDataWorm, 95);
  playRetroBeep(330, 'square', 0.1, 0.08);
}

function spawnWormFood() {
  // Avoid placing food on the snake body
  let validPosition = false;
  while (!validPosition) {
    wormFood = {
      x: Math.floor(Math.random() * gridCount),
      y: Math.floor(Math.random() * gridCount)
    };
    validPosition = !snake.some(segment => segment.x === wormFood.x && segment.y === wormFood.y);
  }
}

function updateDataWorm() {
  if (snakeGameOver) {
    drawSnakeGameOver();
    return;
  }

  // Update direction
  snakeDir = snakeNextDir;

  // Move head
  const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };

  // Wall collisions
  if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
    triggerSnakeDeath();
    return;
  }

  // Tail collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    triggerSnakeDeath();
    return;
  }

  // Add head
  snake.unshift(head);

  // Eat food check
  if (head.x === wormFood.x && head.y === wormFood.y) {
    snakeScore++;
    playRetroBeep(880, 'sine', 0.05, 0.08);
    spawnWormFood();
  } else {
    // Remove tail segment
    snake.pop();
  }

  // Render Grid canvas
  gameCtx.fillStyle = '#020108';
  gameCtx.fillRect(0, 0, 400, 400);

  // Draw grid border
  gameCtx.strokeStyle = '#110d29';
  gameCtx.lineWidth = 1;
  for (let i = 0; i <= gridCount; i++) {
    gameCtx.beginPath();
    gameCtx.moveTo(i * 20, 0);
    gameCtx.lineTo(i * 20, 400);
    gameCtx.stroke();
    gameCtx.beginPath();
    gameCtx.moveTo(0, i * 20);
    gameCtx.lineTo(400, i * 20);
    gameCtx.stroke();
  }

  // Draw food (neon yellow compiling dot)
  gameCtx.fillStyle = 'var(--color-neon-yellow)';
  gameCtx.shadowColor = 'var(--color-neon-yellow)';
  gameCtx.shadowBlur = 8;
  gameCtx.fillRect(wormFood.x * 20 + 3, wormFood.y * 20 + 3, 14, 14);

  // Draw Snake (neon green glow block lines)
  gameCtx.shadowBlur = 0; // reset
  snake.forEach((segment, idx) => {
    gameCtx.fillStyle = idx === 0 ? '#fff' : 'var(--color-neon-green)';
    gameCtx.fillRect(segment.x * 20 + 2, segment.y * 20 + 2, 16, 16);
  });

  // Draw score overlay
  gameCtx.fillStyle = '#fff';
  gameCtx.font = '900 1rem var(--font-display)';
  gameCtx.fillText(`DATA: ${snakeScore}`, 15, 25);
  gameCtx.fillStyle = 'var(--color-neon-green)';
  gameCtx.fillText(`HI: ${arcadeScores.snake}`, 340, 25);

  drawRetroScanlines();
}

function triggerSnakeDeath() {
  snakeGameOver = true;
  playRetroBeep(150, 'sawtooth', 0.3, 0.12);
  if (snakeScore > arcadeScores.snake) {
    arcadeScores.snake = snakeScore;
    saveArcadeScores();
  }
}

function drawSnakeGameOver() {
  gameCtx.fillStyle = 'rgba(2, 1, 8, 0.8)';
  gameCtx.fillRect(0, 0, 400, 400);

  gameCtx.fillStyle = 'var(--color-neon-pink)';
  gameCtx.font = '900 2rem var(--font-display)';
  gameCtx.textAlign = 'center';
  gameCtx.fillText('WORM CRASH', 200, 160);

  gameCtx.fillStyle = '#fff';
  gameCtx.font = '700 0.95rem var(--font-body)';
  gameCtx.fillText(`BYTES CAPTURED: ${snakeScore} // BEST: ${arcadeScores.snake}`, 200, 205);
  gameCtx.fillStyle = 'var(--color-neon-cyan)';
  gameCtx.fillText('PRESS ANY KEY OR TAP TO RESTART', 200, 245);
  gameCtx.textAlign = 'left'; // reset
}


// --- GAME 3: GRID CONQUEROR (Tic-Tac-Toe) ---

function startGridConqueror() {
  stopActiveGame();
  activeGame = 'ttt';

  const screen = document.getElementById('arcade-screen');
  const statusText = document.getElementById('arcade-game-status');
  const menuBtn = document.getElementById('arcade-btn-menu');
  
  statusText.innerText = 'GRID CONQUEROR // MATCH A NEON LINE';
  menuBtn.style.display = 'block';

  // Draw grid layout
  screen.innerHTML = `
    <div class="ttt-grid">
      <div class="ttt-cell" data-idx="0"></div>
      <div class="ttt-cell" data-idx="1"></div>
      <div class="ttt-cell" data-idx="2"></div>
      <div class="ttt-cell" data-idx="3"></div>
      <div class="ttt-cell" data-idx="4"></div>
      <div class="ttt-cell" data-idx="5"></div>
      <div class="ttt-cell" data-idx="6"></div>
      <div class="ttt-cell" data-idx="7"></div>
      <div class="ttt-cell" data-idx="8"></div>
    </div>
    
    <div class="arcade-overlay" id="ttt-overlay" style="display: none;">
      <span class="arcade-overlay-title" id="ttt-result-title">YOU WIN</span>
      <button class="arcade-btn-action" onclick="resetGridConqueror()">PLAY AGAIN</button>
    </div>
  `;

  tttBoard = ['', '', '', '', '', '', '', '', ''];
  tttPlayer = 'X'; // X is the human player
  tttActive = true;

  document.querySelectorAll('.ttt-cell').forEach(cell => {
    cell.addEventListener('click', handleGridCellClick);
  });
  
  playRetroBeep(330, 'square', 0.1, 0.08);
}

function resetGridConqueror() {
  const overlay = document.getElementById('ttt-overlay');
  if (overlay) overlay.style.display = 'none';

  tttBoard = ['', '', '', '', '', '', '', '', ''];
  tttPlayer = 'X';
  tttActive = true;

  document.querySelectorAll('.ttt-cell').forEach(cell => {
    cell.className = 'ttt-cell';
    cell.innerText = '';
  });
}

function handleGridCellClick(e) {
  const cell = e.target;
  const idx = parseInt(cell.getAttribute('data-idx'));

  if (tttBoard[idx] !== '' || !tttActive || tttPlayer !== 'X') return;

  // Make player move
  makeGridMove(idx, 'X');

  if (checkVictory(tttBoard, 'X')) {
    endGridGame('YOU WIN');
    return;
  }
  if (checkTie(tttBoard)) {
    endGridGame('TIE MATCH');
    return;
  }

  // AI moves next
  tttPlayer = 'O';
  setTimeout(makeAIMove, 450);
}

function makeGridMove(idx, symbol) {
  tttBoard[idx] = symbol;
  const cell = document.querySelector(`.ttt-cell[data-idx="${idx}"]`);
  if (cell) {
    cell.innerText = symbol;
    cell.classList.add(symbol.toLowerCase());
    playRetroBeep(symbol === 'X' ? 520 : 660, 'sine', 0.08, 0.08);
  }
}

function makeAIMove() {
  if (!tttActive) return;

  // Minimax algorithm to choose best move
  let bestVal = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < tttBoard.length; i++) {
    if (tttBoard[i] === '') {
      tttBoard[i] = 'O';
      let moveVal = minimax(tttBoard, 0, false);
      tttBoard[i] = '';
      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }

  if (bestMove !== -1) {
    makeGridMove(bestMove, 'O');
    
    if (checkVictory(tttBoard, 'O')) {
      endGridGame('AI WIN');
      return;
    }
    if (checkTie(tttBoard)) {
      endGridGame('TIE MATCH');
      return;
    }

    tttPlayer = 'X';
  }
}

function minimax(board, depth, isMax) {
  if (checkVictory(board, 'O')) return 10 - depth;
  if (checkVictory(board, 'X')) return depth - 10;
  if (checkTie(board)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = '';
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = '';
      }
    }
    return best;
  }
}

function checkVictory(board, symbol) {
  const winPaths = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  return winPaths.some(path => board[path[0]] === symbol && board[path[1]] === symbol && board[path[2]] === symbol);
}

function checkTie(board) {
  return board.every(cell => cell !== '');
}

function endGridGame(result) {
  tttActive = false;
  const overlay = document.getElementById('ttt-overlay');
  const title = document.getElementById('ttt-result-title');
  
  title.innerText = result;
  
  if (result === 'YOU WIN') {
    title.style.color = 'var(--color-neon-green)';
    title.style.textShadow = '0 0 15px rgba(0, 255, 153, 0.5)';
    playRetroBeep(440, 'sine', 0.08, 0.08);
    setTimeout(() => playRetroBeep(554.37, 'sine', 0.08, 0.08), 80);
    setTimeout(() => playRetroBeep(659.25, 'sine', 0.18, 0.1), 160);
    
    arcadeScores.ttt++;
    saveArcadeScores();
  } else if (result === 'AI WIN') {
    title.style.color = 'var(--color-neon-pink)';
    title.style.textShadow = '0 0 15px rgba(255, 0, 85, 0.5)';
    playRetroBeep(180, 'sawtooth', 0.25, 0.1);
  } else {
    title.style.color = '#fff';
    title.style.textShadow = 'none';
    playRetroBeep(280, 'triangle', 0.15, 0.08);
  }

  setTimeout(() => {
    if (overlay) overlay.style.display = 'flex';
  }, 450);
}


// --- GENERAL RETRO ENGINE CONTROLS ---

function handleGameControls(e) {
  if (activeGame === 'flappy') {
    if (e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      flapBird();
    }
  } else if (activeGame === 'snake') {
    if (snakeGameOver) {
      startDataWorm();
      return;
    }
    // Prevent reverse movements
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      if (snakeDir.y !== 1) snakeNextDir = { x: 0, y: -1 };
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      if (snakeDir.y !== -1) snakeNextDir = { x: 0, y: 1 };
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      if (snakeDir.x !== 1) snakeNextDir = { x: -1, y: 0 };
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      if (snakeDir.x !== -1) snakeNextDir = { x: 1, y: 0 };
    }
  }
}

// Draw retro scanlines on canvas context
function drawRetroScanlines() {
  if (!gameCtx || !gameCanvas) return;
  gameCtx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let i = 0; i < gameCanvas.height; i += 4) {
    gameCtx.fillRect(0, i, gameCanvas.width, 1.5);
  }
}

// --- RETRO CYBER HUD CUSTOM CURSOR ENGINE WITH LASER RIBBON TRAIL ---
function setupCustomCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';

  const ring = document.createElement('div');
  ring.className = 'custom-cursor-ring';

  // Continuous Laser Line Trail Canvas Layer
  const trailCanvas = document.createElement('canvas');
  trailCanvas.className = 'custom-cursor-trail-canvas';

  document.body.appendChild(trailCanvas);
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  const ctx = trailCanvas.getContext('2d');

  function resizeCanvas() {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isVisible = false;
  let rotAngle = 0;

  // History buffer for continuous laser ribbon line trail
  const points = [];
  const MAX_POINTS = 28;       // Number of points in trail line
  const TRAIL_LIFETIME = 280;  // Milliseconds point remains visible

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      ringX = mouseX;
      ringY = mouseY;
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }

    // Hardware 1:1 precision hotspot positioning
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    // Push point into laser trail buffer
    if (!document.body.classList.contains('cursor-text')) {
      points.push({
        x: mouseX,
        y: mouseY,
        time: performance.now()
      });
    }
  });

  // Combined Render Loop: Reticle Physics + Laser Ribbon Line Drawing
  function animate() {
    const now = performance.now();

    // 1. Ring Follower Physics Lerp
    const dx = mouseX - ringX;
    const dy = mouseY - ringY;
    ringX += dx * 0.35;
    ringY += dy * 0.35;

    const isHover = document.body.classList.contains('cursor-hover');
    rotAngle += isHover ? 1.5 : 0.4;
    if (rotAngle >= 360) rotAngle = 0;

    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) rotate(${rotAngle}deg)`;

    // 2. Render Continuous Laser Ribbon Line Trail on Canvas
    ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    // Remove expired points
    while (points.length > 0 && (now - points[0].time > TRAIL_LIFETIME || points.length > MAX_POINTS)) {
      points.shift();
    }

    if (points.length > 1 && isVisible && !document.body.classList.contains('cursor-text')) {
      // Pass 1: Outer Glowing Neon Laser Ribbon
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const progress = i / points.length; // 0 (tail) -> 1 (head)
        const age = now - p2.time;
        const alpha = Math.max(0, (1 - age / TRAIL_LIFETIME) * Math.pow(progress, 0.7));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = 2 + progress * 6; // Taper line from 8px head down to 2px tail
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const strokeColor = isHover 
          ? `rgba(0, 229, 255, ${alpha * 0.95})` 
          : `rgba(255, 0, 85, ${alpha * 0.85})`;
        ctx.strokeStyle = strokeColor;
        ctx.shadowColor = isHover ? '#00e5ff' : '#ff0055';
        ctx.shadowBlur = 14 * progress;
        ctx.stroke();
      }

      // Pass 2: Inner Ultra-Bright Electric Core Line
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const progress = i / points.length;
        const age = now - p2.time;
        const alpha = Math.max(0, (1 - age / TRAIL_LIFETIME) * Math.pow(progress, 0.5));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = 1 + progress * 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = `rgba(255, 242, 0, ${alpha})`;
        ctx.shadowColor = '#fff200';
        ctx.shadowBlur = 6 * progress;
        ctx.stroke();
      }
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Selectors for interactive vs text elements
  const interactiveSelector = 'a, button, select, .btn-card, .btn-live, .fighter-card, .game-card, .social-icon, .mobile-toggle, .filter-btn, .arcade-menu-item, .hero-cta, [onclick], [role="button"]';
  const textSelector = 'input[type="text"], input[type="email"], input[type="number"], input[type="search"], input[type="password"], textarea, [contenteditable="true"]';

  // Smart context-aware hover detection
  document.addEventListener('mouseover', (e) => {
    const textTarget = e.target.closest(textSelector);
    const interactiveTarget = e.target.closest(interactiveSelector);

    if (textTarget) {
      document.body.classList.add('cursor-text');
      document.body.classList.remove('cursor-hover');
    } else if (interactiveTarget) {
      document.body.classList.add('cursor-hover');
      document.body.classList.remove('cursor-text');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const textTarget = e.target.closest(textSelector);
    const interactiveTarget = e.target.closest(interactiveSelector);

    if (textTarget) {
      document.body.classList.remove('cursor-text');
    }
    if (interactiveTarget) {
      document.body.classList.remove('cursor-hover');
    }
  });

  // Tactile Click Shockwave Feedback
  document.addEventListener('mousedown', (e) => {
    document.body.classList.add('cursor-active');

    // Spawn cyber click ripple burst
    if (isVisible) {
      const ripple = document.createElement('div');
      ripple.className = 'custom-cursor-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 380);
    }
  });

  document.addEventListener('mouseup', () => {
    document.body.classList.remove('cursor-active');
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
    isVisible = false;
    points.length = 0;
  });

  document.addEventListener('mouseenter', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    ringX = mouseX;
    ringY = mouseY;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
    isVisible = true;
  });
}