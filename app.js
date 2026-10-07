/* ==========================================================================
   LIFE CYCLE ASSESSMENT OF ELECTRONIC DEVICES: INTERACTIVE ENGINE
   Sci-Fi Motion Graphics, Audio Synthesis, and Navigation Controller
   ========================================================================== */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIS ENGINE (Web Audio API) ---
  class SciFiSoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playChirp(freq = 880, duration = 0.06, type = 'sine') {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }

    playTransition() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.18);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.18);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
      } catch (e) {}
    }

    playAlert() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.setValueAtTime(330, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      } catch (e) {}
    }
  }

  const sound = new SciFiSoundEngine();

  // --- STATE MANAGEMENT ---
  const state = {
    currentSlide: 0,
    totalSlides: 10,
    autoplay: false,
    autoplayInterval: null,
    autoplayTimerSec: 15,
    animationFrames: {},
    activeSubTab: { 6: 'smelt', 2: 'elements' }
  };

  const slideTitles = [
    'EXECUTIVE_OVERVIEW // ISO_14040_FRAMEWORK',
    'STAGE_01 // RAW_MINERAL_EXTRACTION',
    'STAGE_02 // SEMICONDUCTOR_FABRICATION',
    'STAGE_03 // ASSEMBLY_&_GLOBAL_LOGISTICS',
    'STAGE_04 // USE_PHASE_&_CLOUD_BURDEN',
    'STAGE_05 // END_OF_LIFE_EWASTE_CRISIS',
    'STAGE_06 // ADVANCED_RECYCLING_METALLURGY',
    'STAGE_07 // CIRCULAR_DESIGN_&_REGULATION',
    'STAGE_08 // PARAMETRIC_LCA_SIMULATOR',
    'STAGE_09 // SCI_FI_HORIZONS_2050'
  ];

  // --- CORE SLIDE CONTROLLER ---
  function initNavigation() {
    const slides = document.querySelectorAll('.slide-panel');
    const pills = document.querySelectorAll('.topic-pill');
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');
    const counterBadge = document.getElementById('slide-counter-badge');
    const progressBar = document.getElementById('progress-bar-fill');
    const currentStageName = document.getElementById('current-stage-name');
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    const autoplayBtn = document.getElementById('autoplay-btn');

    function updateView(newIndex, playSoundEffect = true) {
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= state.totalSlides) newIndex = state.totalSlides - 1;

      state.currentSlide = newIndex;

      slides.forEach((slide, idx) => {
        if (idx === newIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      pills.forEach((pill, idx) => {
        if (idx === newIndex) {
          pill.classList.add('active');
          pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else {
          pill.classList.remove('active');
        }
      });

      if (counterBadge) {
        const paddedCur = String(newIndex + 1).padStart(2, '0');
        const paddedTot = String(state.totalSlides).padStart(2, '0');
        counterBadge.innerHTML = `<span class="pulse-dot"></span> MODULE [${paddedCur} / ${paddedTot}]`;
      }

      if (currentStageName) {
        currentStageName.textContent = slideTitles[newIndex] || 'LCA_TELEMETRY';
      }

      if (progressBar) {
        const pct = ((newIndex + 1) / state.totalSlides) * 100;
        progressBar.style.width = `${pct}%`;
      }

      if (playSoundEffect) {
        sound.playTransition();
      }

      // Trigger animations for the active slide
      triggerSlideAnimation(newIndex);
    }

    // Attach topic pill clicks (INSTANT OPEN AS REQUESTED)
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetIndex = parseInt(pill.getAttribute('data-slide-index'), 10);
        sound.playChirp(750, 0.05);
        updateView(targetIndex, true);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (state.currentSlide > 0) {
          updateView(state.currentSlide - 1, true);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.currentSlide < state.totalSlides - 1) {
          updateView(state.currentSlide + 1, true);
        }
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      // Don't intercept when user is typing in search input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (state.currentSlide < state.totalSlides - 1) {
          updateView(state.currentSlide + 1, true);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (state.currentSlide > 0) {
          updateView(state.currentSlide - 1, true);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        updateView(0, true);
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < state.totalSlides) {
          updateView(idx, true);
        }
      } else if (e.key === '0') {
        updateView(9, true);
      } else if (e.key.toLowerCase() === 'm') {
        toggleAudio();
      } else if (e.key.toLowerCase() === 'p') {
        toggleAutoplay();
      }
    });

    // Audio toggle
    function toggleAudio() {
      const isEnabled = sound.toggle();
      if (audioToggleBtn) {
        audioToggleBtn.innerHTML = isEnabled 
          ? `<span>🔊</span> AUDIO: ON` 
          : `<span>🔇</span> AUDIO: MUTE`;
        if (isEnabled) sound.playChirp(1040, 0.08);
      }
    }

    if (audioToggleBtn) {
      audioToggleBtn.addEventListener('click', toggleAudio);
    }

    // Autoplay toggle
    function toggleAutoplay() {
      state.autoplay = !state.autoplay;
      if (autoplayBtn) {
        if (state.autoplay) {
          autoplayBtn.classList.add('primary');
          autoplayBtn.innerHTML = `<span>⏸</span> AUTO: ACTIVE`;
          sound.playChirp(920, 0.05);
          startAutoplay();
        } else {
          autoplayBtn.classList.remove('primary');
          autoplayBtn.innerHTML = `<span>▶</span> AUTO: IDLE`;
          sound.playChirp(460, 0.05);
          stopAutoplay();
        }
      }
    }

    function startAutoplay() {
      stopAutoplay();
      state.autoplayInterval = setInterval(() => {
        let nextIdx = state.currentSlide + 1;
        if (nextIdx >= state.totalSlides) nextIdx = 0;
        updateView(nextIdx, true);
      }, state.autoplayTimerSec * 1000);
    }

    function stopAutoplay() {
      if (state.autoplayInterval) {
        clearInterval(state.autoplayInterval);
        state.autoplayInterval = null;
      }
    }

    if (autoplayBtn) {
      autoplayBtn.addEventListener('click', toggleAutoplay);
    }

    // Initial render
    updateView(0, false);
  }

  // --- AMBIENT HOLOGRAPHIC BACKGROUND CANVAS ---
  function initAmbientHologram() {
    const canvas = document.getElementById('hologram-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.8,
        color: Math.random() > 0.5 ? '#00f0ff' : '#00ff9d',
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Draw faint cybernetic connectivity lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 * (1 - dist / 130)})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(render);
    }
    render();
  }

  // --- DYNAMIC SLIDE-SPECIFIC MOTION GRAPHIC CANVAS CONTROLLERS ---
  function triggerSlideAnimation(index) {
    switch (index) {
      case 0:
        runOverviewWireframeCanvas();
        break;
      case 1:
        runRawMaterialsLatticeCanvas();
        break;
      case 2:
        runSemiconductorWaferStepperCanvas();
        break;
      case 3:
        runGlobalLogisticsRadarCanvas();
        break;
      case 4:
        runGridOscilloscopeCanvas();
        break;
      case 5:
        runEwasteHazardScannerCanvas();
        break;
      case 6:
        runMetallurgyCrucibleCanvas();
        break;
      case 7:
        runCircularTorusCanvas();
        break;
      case 8:
        runSimulatorCharts();
        break;
      case 9:
        runNaniteDissolutionCanvas();
        break;
    }
  }

  // 1. SLIDE 0: Holographic Rotating Isometric Wireframe Cube / Smartphone
  function runOverviewWireframeCanvas() {
    const canvas = document.getElementById('canvas-overview');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    let angle = 0;
    let scanY = 0;

    function draw() {
      if (state.currentSlide !== 0) return;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 - 10;
      angle += 0.015;

      // Concentric telemetry target rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating radar crosshair
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.5);
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.35)';
      ctx.beginPath();
      ctx.moveTo(-130, 0); ctx.lineTo(130, 0);
      ctx.moveTo(0, -130); ctx.lineTo(0, 130);
      ctx.stroke();
      ctx.restore();

      // 3D Isometric Wireframe Phone Chassis
      const boxW = 85;
      const boxH = 155;
      const depth = 28;

      ctx.save();
      ctx.translate(cx, cy);

      const tilt = Math.sin(angle) * 0.35;
      const rot = angle;

      // Draw 8 vertices of 3D box
      const pts = [
        [-boxW, -boxH, -depth],
        [boxW, -boxH, -depth],
        [boxW, boxH, -depth],
        [-boxW, boxH, -depth],
        [-boxW, -boxH, depth],
        [boxW, -boxH, depth],
        [boxW, boxH, depth],
        [-boxW, boxH, depth]
      ];

      const projected = pts.map(([x, y, z]) => {
        // Simple 3D rotation around Y and X
        const radY = rot;
        const x1 = x * Math.cos(radY) + z * Math.sin(radY);
        const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

        const radX = 0.45;
        const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

        const fov = 350;
        const scale = fov / (fov + z2);
        return [x1 * scale, y2 * scale];
      });

      // Draw wireframe edges
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;

      for (let [i, j] of edges) {
        ctx.beginPath();
        ctx.moveTo(projected[i][0], projected[i][1]);
        ctx.lineTo(projected[j][0], projected[j][1]);
        ctx.stroke();
      }

      // Internal Silicon Die & Battery Wireframe
      ctx.strokeStyle = '#00ff9d';
      ctx.shadowColor = '#00ff9d';
      ctx.lineWidth = 1;
      const midScale = 0.55;
      ctx.strokeRect(-boxW * midScale * Math.cos(rot), -boxH * 0.4, boxW * midScale * 2, boxH * 0.7);

      ctx.shadowBlur = 0;
      ctx.restore();

      // Scanning Laser Beam Line
      scanY += 2;
      if (scanY > h) scanY = 0;

      const grad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.75)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(cx - 160, scanY - 10, 320, 20);

      // Telemetry Text
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`SYSTEM_SCAN: CALIBRATING [${Math.floor(scanY / h * 100)}%]`, cx - 130, h - 25);
      ctx.fillStyle = '#00ff9d';
      ctx.fillText('EMBODIED_EMISSIONS: 78.4% DETECTED', cx - 130, h - 12);

      requestAnimationFrame(draw);
    }
    draw();
  }

  // 2. SLIDE 1: Raw Materials Quantum Atomic Lattice & Geopolitical Nodes
  function runRawMaterialsLatticeCanvas() {
    const canvas = document.getElementById('canvas-materials');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    const elements = [
      { sym: 'Li', name: 'Lithium', color: '#00ff9d', x: w * 0.25, y: h * 0.35, gwp: '12 kg CO2e/kg', risk: 'HIGH (Water Depletion)' },
      { sym: 'Co', name: 'Cobalt', color: '#ff9f1c', x: w * 0.72, y: h * 0.3, gwp: '38 kg CO2e/kg', risk: 'CRITICAL (Artisanal DRC)' },
      { sym: 'Nd', name: 'Neodymium', color: '#b5179e', x: w * 0.45, y: h * 0.22, gwp: '72 kg CO2e/kg', risk: 'SEVERE (Thorium Slag)' },
      { sym: 'Au', name: 'Gold', color: '#ffd166', x: w * 0.28, y: h * 0.72, gwp: '16,500 kg CO2e/kg', risk: 'EXTREME (Cyanide Leaching)' },
      { sym: 'Ta', name: 'Tantalum', color: '#00f0ff', x: w * 0.75, y: h * 0.7, gwp: '180 kg CO2e/kg', risk: 'CONFLICT REGIONS' },
      { sym: 'Cu', name: 'Copper', color: '#ff6b35', x: w * 0.5, y: h * 0.55, gwp: '4.2 kg CO2e/kg', risk: 'HIGH (Ore Degradation)' }
    ];

    let t = 0;
    let hoveredElem = null;

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      hoveredElem = null;
      for (let el of elements) {
        const d = Math.hypot(el.x - mx, el.y - my);
        if (d < 30) {
          hoveredElem = el;
          sound.playChirp(600, 0.03);
          break;
        }
      }
    };

    function draw() {
      if (state.currentSlide !== 1) return;
      ctx.clearRect(0, 0, w, h);
      t += 0.02;

      // Draw force connections
      ctx.lineWidth = 1;
      for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const e1 = elements[i];
          const e2 = elements[j];
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
          ctx.beginPath();
          ctx.moveTo(e1.x, e1.y);
          ctx.lineTo(e2.x, e2.y);
          ctx.stroke();

          // Flowing particle on thread
          const flow = (t * 0.5 + (i + j) * 0.2) % 1;
          const px = e1.x + (e2.x - e1.x) * flow;
          const py = e1.y + (e2.y - e1.y) * flow;
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Elemental Node Orbs
      for (let el of elements) {
        const isHov = hoveredElem === el;
        const pulse = Math.sin(t * 2 + el.x) * 3;
        const r = isHov ? 28 : 22 + pulse;

        // Outer glow
        ctx.save();
        ctx.shadowColor = el.color;
        ctx.shadowBlur = isHov ? 25 : 12;
        ctx.strokeStyle = el.color;
        ctx.lineWidth = isHov ? 3 : 1.8;
        ctx.fillStyle = 'rgba(10, 18, 38, 0.9)';

        ctx.beginPath();
        ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Symbol Text
        ctx.font = 'bold 13px ui-monospace, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.sym, el.x, el.y);

        // Subtitle
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillStyle = el.color;
        ctx.fillText(el.name, el.x, el.y + r + 12);
      }

      // Hover Tooltip Display in Canvas
      if (hoveredElem) {
        ctx.fillStyle = 'rgba(13, 22, 44, 0.95)';
        ctx.strokeStyle = hoveredElem.color;
        ctx.lineWidth = 1;
        const tipW = 210;
        const tipH = 75;
        const tipX = Math.min(w - tipW - 10, Math.max(10, hoveredElem.x - tipW / 2));
        const tipY = Math.max(10, hoveredElem.y - 75);

        ctx.fillRect(tipX, tipY, tipW, tipH);
        ctx.strokeRect(tipX, tipY, tipW, tipH);

        ctx.textAlign = 'left';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillStyle = hoveredElem.color;
        ctx.fillText(`ELEMENT: ${hoveredElem.name} [${hoveredElem.sym}]`, tipX + 10, tipY + 18);

        ctx.font = '10px system-ui, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`Embodied GWP: ${hoveredElem.gwp}`, tipX + 10, tipY + 36);

        ctx.fillStyle = '#ff9f1c';
        ctx.fillText(`Risk: ${hoveredElem.risk}`, tipX + 10, tipY + 54);
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  // 3. SLIDE 2: Semiconductor Wafer Stepper & EUV Laser Beam
  function runSemiconductorWaferStepperCanvas() {
    const canvas = document.getElementById('canvas-wafer');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    let stepX = 0;
    let stepY = 0;
    let laserIntensity = 1;
    let frame = 0;

    const gridSize = 12;
    const dieSize = 22;
    const startX = (w - gridSize * dieSize) / 2;
    const startY = (h - gridSize * dieSize) / 2 + 15;

    function draw() {
      if (state.currentSlide !== 2) return;
      ctx.clearRect(0, 0, w, h);
      frame++;

      const cx = w / 2;
      const cy = h / 2 + 15;
      const waferRadius = (gridSize * dieSize) / 2 + 8;

      // 300mm Silicon Wafer Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, waferRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 28, 56, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // Flat notch at wafer edge
      ctx.fillStyle = '#0a1124';
      ctx.fillRect(cx - 15, cy + waferRadius - 3, 30, 8);

      // Die Grid Matrix
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const dx = startX + c * dieSize;
          const dy = startY + r * dieSize;
          const distToCenter = Math.hypot(dx + dieSize / 2 - cx, dy + dieSize / 2 - cy);

          if (distToCenter < waferRadius - 5) {
            const isExposed = r < stepY || (r === stepY && c <= stepX);
            const isCurrent = r === stepY && c === stepX;

            if (isCurrent) {
              ctx.fillStyle = '#e040fb';
            } else if (isExposed) {
              ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
            } else {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            }

            ctx.fillRect(dx + 1, dy + 1, dieSize - 2, dieSize - 2);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
            ctx.strokeRect(dx, dy, dieSize, dieSize);
          }
        }
      }

      // Advance Stepper position
      if (frame % 5 === 0) {
        stepX++;
        if (stepX >= gridSize) {
          stepX = 0;
          stepY++;
          if (stepY >= gridSize) {
            stepY = 0;
          }
        }
      }

      // Draw EUV Lithography Laser Beam (13.5nm High-NA Laser)
      const targetDieX = startX + stepX * dieSize + dieSize / 2;
      const targetDieY = startY + stepY * dieSize + dieSize / 2;

      ctx.save();
      const beamGrad = ctx.createLinearGradient(cx, 10, targetDieX, targetDieY);
      beamGrad.addColorStop(0, 'rgba(224, 64, 251, 0.95)');
      beamGrad.addColorStop(0.7, 'rgba(181, 23, 158, 0.7)');
      beamGrad.addColorStop(1, '#ffffff');

      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 3 + Math.sin(frame * 0.4) * 1.5;
      ctx.shadowColor = '#e040fb';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(cx, 15);
      ctx.lineTo(targetDieX, targetDieY);
      ctx.stroke();

      // High-NA Lithography Lens Ring at top
      ctx.fillStyle = '#0a142c';
      ctx.strokeStyle = '#e040fb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, 15, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Cleanroom Particle Ionization Telemetry
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('EUV_LITHOGRAPHY: 13.5nm // HIGH-NA 0.55', 15, 25);
      ctx.fillStyle = '#b5179e';
      ctx.fillText(`STEPPER EXPOSURE DIE: [${stepX}, ${stepY}]`, 15, 40);
      ctx.fillStyle = '#00ff9d';
      ctx.fillText('CHAMBER GAS: NF3 / GWP 17,200 PURGE OK', 15, h - 15);

      requestAnimationFrame(draw);
    }
    draw();
  }

  // 4. SLIDE 3: Global Cargo Aerospace & Maritime Logistics Radar
  function runGlobalLogisticsRadarCanvas() {
    const canvas = document.getElementById('canvas-logistics');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    const hubs = [
      { name: 'Shenzhen (Fab EMS)', x: w * 0.75, y: h * 0.45, color: '#00f0ff' },
      { name: 'Rotterdam (Port Hub)', x: w * 0.35, y: h * 0.32, color: '#00ff9d' },
      { name: 'Long Beach (Pacific)', x: w * 0.15, y: h * 0.42, color: '#ff9f1c' },
      { name: 'Dubai (Air Logistics)', x: w * 0.52, y: h * 0.48, color: '#b5179e' }
    ];

    const cargoArcs = [
      { from: 0, to: 1, type: 'SEA', gwp: '15 g/t-km', color: '#00ff9d', progress: 0.1, speed: 0.003 },
      { from: 0, to: 2, type: 'SEA', gwp: '12 g/t-km', color: '#00ff9d', progress: 0.6, speed: 0.0025 },
      { from: 0, to: 3, type: 'AIR', gwp: '500 g/t-km', color: '#ff5400', progress: 0.4, speed: 0.012 },
      { from: 3, to: 1, type: 'AIR', gwp: '520 g/t-km', color: '#ff5400', progress: 0.8, speed: 0.01 }
    ];

    function draw() {
      if (state.currentSlide !== 3) return;
      ctx.clearRect(0, 0, w, h);

      // Draw faint world longitude/latitude map grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw Cargo Flight & Maritime Trajectory Arcs
      for (let arc of cargoArcs) {
        const h1 = hubs[arc.from];
        const h2 = hubs[arc.to];

        const cx = (h1.x + h2.x) / 2;
        const cy = Math.min(h1.y, h2.y) - 60; // Curved arc peak

        ctx.strokeStyle = arc.type === 'AIR' ? 'rgba(255, 84, 0, 0.4)' : 'rgba(0, 255, 157, 0.35)';
        ctx.lineWidth = arc.type === 'AIR' ? 2 : 1.5;
        ctx.setLineDash(arc.type === 'AIR' ? [4, 4] : [2, 2]);

        ctx.beginPath();
        ctx.moveTo(h1.x, h1.y);
        ctx.quadraticCurveTo(cx, cy, h2.x, h2.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated cargo vector bullet
        arc.progress = (arc.progress + arc.speed) % 1;
        const t = arc.progress;
        // Bezier formula: (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
        const bx = Math.pow(1 - t, 2) * h1.x + 2 * (1 - t) * t * cx + Math.pow(t, 2) * h2.x;
        const by = Math.pow(1 - t, 2) * h1.y + 2 * (1 - t) * t * cy + Math.pow(t, 2) * h2.y;

        ctx.save();
        ctx.fillStyle = arc.color;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(bx, by, arc.type === 'AIR' ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Logistics Hub Bases
      for (let hub of hubs) {
        ctx.save();
        ctx.fillStyle = hub.color;
        ctx.shadowColor = hub.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Label
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(hub.name, hub.x + 10, hub.y + 4);
      }

      // Telemetry Header
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillStyle = '#ff5400';
      ctx.fillText('AIR FREIGHT: ~500 g CO2e / tonne-km [EMISSION SURGE]', 15, 20);
      ctx.fillStyle = '#00ff9d';
      ctx.fillText('OCEAN MARITIME: ~15 g CO2e / tonne-km [33x EFFICIENCY]', 15, 36);

      requestAnimationFrame(draw);
    }
    draw();
  }

  // 5. SLIDE 4: Real-time Oscilloscope & Grid Carbon Harmonizer
  function runGridOscilloscopeCanvas() {
    const canvas = document.getElementById('canvas-oscilloscope');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    let phase = 0;
    let gridType = 'coal'; // 'coal' or 'renew'

    const coalBtn = document.getElementById('grid-btn-coal');
    const renewBtn = document.getElementById('grid-btn-renew');

    if (coalBtn && renewBtn) {
      coalBtn.onclick = () => {
        gridType = 'coal';
        coalBtn.classList.add('active');
        renewBtn.classList.remove('active');
        sound.playAlert();
      };
      renewBtn.onclick = () => {
        gridType = 'renew';
        renewBtn.classList.add('active');
        coalBtn.classList.remove('active');
        sound.playChirp(880, 0.08);
      };
    }

    function draw() {
      if (state.currentSlide !== 4) return;
      ctx.clearRect(0, 0, w, h);
      phase += 0.05;

      const cy = h / 2;

      // Oscilloscope grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let y = 30; y < h; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let x = 30; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Draw dynamic sine waveform
      ctx.save();
      const isCoal = gridType === 'coal';
      ctx.strokeStyle = isCoal ? '#ff5400' : '#00ff9d';
      ctx.shadowColor = isCoal ? '#ff5400' : '#00ff9d';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const freq = isCoal ? 0.03 : 0.02;
        const amp = isCoal ? 55 + Math.sin(x * 0.1 + phase * 2) * 8 : 40;
        const y = cy + Math.sin(x * freq + phase) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Compounding Cloud Rebound Wave (High-frequency harmonic)
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const harmonic = cy + Math.sin(x * 0.08 + phase * 3) * 18;
        if (x === 0) ctx.moveTo(x, harmonic);
        else ctx.lineTo(x, harmonic);
      }
      ctx.stroke();
      ctx.restore();

      // Telemetry
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = isCoal ? '#ff5400' : '#00ff9d';
      ctx.fillText(
        isCoal ? 'GRID CARBON: 750 g CO2/kWh [FOSSIL COAL HEAVY]' : 'GRID CARBON: 35 g CO2/kWh [HYDRO / NUCLEAR]',
        15, 25
      );
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('CLOUD REBOUND: 5G + AI HYPERSCALE HARMONIC ACTIVE', 15, 42);

      requestAnimationFrame(draw);
    }
    draw();
  }

  // 6. SLIDE 5: E-Waste Toxic Plume & Geiger Threat Detector
  function runEwasteHazardScannerCanvas() {
    const canvas = document.getElementById('canvas-ewaste');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    let plumeT = 0;
    const plumes = [];
    for (let i = 0; i < 35; i++) {
      plumes.push({
        x: w * 0.5 + (Math.random() - 0.5) * 80,
        y: h * 0.8 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 1.8 - 0.5,
        size: Math.random() * 15 + 8,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function draw() {
      if (state.currentSlide !== 5) return;
      ctx.clearRect(0, 0, w, h);
      plumeT += 0.03;

      // Draw E-Waste PCB silhouette in dump
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ff5400';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.85);
      ctx.lineTo(w * 0.8, h * 0.85);
      ctx.lineTo(w * 0.75, h * 0.75);
      ctx.lineTo(w * 0.25, h * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Toxic burning fumes rising
      for (let p of plumes) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.005;

        if (p.y < 50 || p.alpha <= 0) {
          p.x = w * 0.5 + (Math.random() - 0.5) * 100;
          p.y = h * 0.75;
          p.vy = -Math.random() * 1.5 - 0.6;
          p.alpha = Math.random() * 0.4 + 0.3;
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, 'rgba(255, 84, 0, ' + p.alpha + ')');
        grad.addColorStop(0.6, 'rgba(181, 23, 158, ' + p.alpha * 0.4 + ')');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Circular Geiger Scanner Radar Reticle
      const cx = w * 0.5;
      const cy = h * 0.45;
      const scanRad = 80;

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 84, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, scanRad, 0, Math.PI * 2);
      ctx.stroke();

      // Pulsing Geiger warning cone
      const sweepAngle = plumeT * 3;
      ctx.fillStyle = 'rgba(255, 159, 28, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, scanRad, sweepAngle, sweepAngle + 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Toxic Leachate Vector Markers
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.fillStyle = '#ff5400';
      ctx.fillText('CRITICAL HAZARD: PB (LEAD) + HG (MERCURY)', 15, 25);
      ctx.fillStyle = '#ffd166';
      ctx.fillText('UN FORMAL RECYCLING: ONLY 22.3% COLLECTED', 15, 42);

      requestAnimationFrame(draw);
    }
    draw();
  }

  // 7. SLIDE 6: Metallurgy Thermal Smelter vs Hydrometallurgical Extraction
  function runMetallurgyCrucibleCanvas() {
    const canvas = document.getElementById('canvas-metallurgy');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    let mode = 'smelt'; // 'smelt' vs 'hydro'

    const smeltBtn = document.getElementById('metal-btn-smelt');
    const hydroBtn = document.getElementById('metal-btn-hydro');

    if (smeltBtn && hydroBtn) {
      smeltBtn.onclick = () => {
        mode = 'smelt';
        smeltBtn.classList.add('active');
        hydroBtn.classList.remove('active');
        sound.playAlert();
      };
      hydroBtn.onclick = () => {
        mode = 'hydro';
        hydroBtn.classList.add('active');
        smeltBtn.classList.remove('active');
        sound.playChirp(720, 0.08);
      };
    }

    let t = 0;
    const crystals = [];
    for (let i = 0; i < 25; i++) {
      crystals.push({
        x: Math.random() * (w - 100) + 50,
        y: Math.random() * (h - 100) + 50,
        color: Math.random() > 0.5 ? '#ffd166' : '#00ff9d',
        size: Math.random() * 5 + 3,
        vy: Math.random() * 0.8 + 0.2
      });
    }

    function draw() {
      if (state.currentSlide !== 6) return;
      ctx.clearRect(0, 0, w, h);
      t += 0.03;

      if (mode === 'smelt') {
        // High-temperature Pyrometallurgical Blast Furnace Simulation
        const grad = ctx.createLinearGradient(0, h * 0.2, 0, h);
        grad.addColorStop(0, 'rgba(255, 84, 0, 0.15)');
        grad.addColorStop(0.7, 'rgba(255, 84, 0, 0.6)');
        grad.addColorStop(1, 'rgba(255, 209, 102, 0.85)');

        ctx.fillStyle = grad;
        ctx.fillRect(w * 0.2, h * 0.3, w * 0.6, h * 0.6);
        ctx.strokeStyle = '#ff5400';
        ctx.strokeRect(w * 0.2, h * 0.3, w * 0.6, h * 0.6);

        // Slag bubbles
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 12; i++) {
          const bx = w * 0.25 + Math.sin(t + i) * (w * 0.25) + w * 0.25;
          const by = h * 0.85 - ((t * 40 + i * 25) % 150);
          ctx.beginPath();
          ctx.arc(bx, by, (i % 4) + 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.font = '11px ui-monospace, monospace';
        ctx.fillStyle = '#ff5400';
        ctx.fillText('PYROMETALLURGY: 1250°C BLAST SMELTING', 20, 25);
        ctx.fillStyle = '#ffd166';
        ctx.fillText('RECOVERS: Au, Cu, Ag | CRITICAL LOSS: Li & REE in Slag', 20, 42);
      } else {
        // Hydrometallurgical Acid Precipitation Chamber
        const grad = ctx.createLinearGradient(0, h * 0.2, 0, h);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
        grad.addColorStop(0.7, 'rgba(0, 255, 157, 0.45)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0.7)');

        ctx.fillStyle = grad;
        ctx.fillRect(w * 0.2, h * 0.3, w * 0.6, h * 0.6);
        ctx.strokeStyle = '#00f0ff';
        ctx.strokeRect(w * 0.2, h * 0.3, w * 0.6, h * 0.6);

        // Floating pure gold & lithium precipitated crystals
        for (let c of crystals) {
          c.y += c.vy;
          if (c.y > h * 0.85) c.y = h * 0.35;

          ctx.save();
          ctx.fillStyle = c.color;
          ctx.shadowColor = c.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.font = '11px ui-monospace, monospace';
        ctx.fillStyle = '#00ff9d';
        ctx.fillText('HYDROMETALLURGY: AMBIENT ACID LEACHING', 20, 25);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('YIELD: 98.5% LITHIUM & RARE EARTH RECOVERY', 20, 42);
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  // 8. SLIDE 7: Infinite Circular Economy Toroidal Möbius Loop
  function runCircularTorusCanvas() {
    const canvas = document.getElementById('canvas-circular');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    let angle = 0;
    const stages = ['DESIGN', 'MANUFACTURE', 'USE', 'REPAIR', 'REFURBISH', 'RECYCLE'];

    function draw() {
      if (state.currentSlide !== 7) return;
      ctx.clearRect(0, 0, w, h);
      angle += 0.015;

      const cx = w / 2;
      const cy = h / 2;
      const rx = 150;
      const ry = 70;

      // Draw revolving 3D elliptical loop
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 157, 0.25)';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#00ff9d';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff9d';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // Particles cycling continuously along ellipse
      for (let i = 0; i < 8; i++) {
        const offset = (angle + (i * Math.PI) / 4) % (Math.PI * 2);
        const px = cx + Math.cos(offset) * rx;
        const py = cy + Math.sin(offset) * ry;

        ctx.save();
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Fixed Stage Anchors along the loop
      for (let i = 0; i < stages.length; i++) {
        const a = (i * Math.PI * 2) / stages.length;
        const sx = cx + Math.cos(a) * rx;
        const sy = cy + Math.sin(a) * ry;

        ctx.fillStyle = '#0a1124';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px ui-monospace, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(stages[i], sx, sy + (sy > cy ? 22 : -16));
      }

      // Center Core
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillStyle = '#00ff9d';
      ctx.textAlign = 'center';
      ctx.fillText('CLOSED LOOP', cx, cy - 5);
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('ZERO LANDFILL TARGET', cx, cy + 12);

      requestAnimationFrame(draw);
    }
    draw();
  }

  // 9. SLIDE 8: Interactive LCA Parametric Simulator Engine
  function runSimulatorCharts() {
    const simDevice = document.getElementById('sim-device');
    const simYears = document.getElementById('sim-years');
    const simCleanEnergy = document.getElementById('sim-clean-energy');
    const simFreight = document.getElementById('sim-freight');
    const simRecycle = document.getElementById('sim-recycle');

    const valYears = document.getElementById('val-years');
    const valClean = document.getElementById('val-clean');
    const valFreight = document.getElementById('val-freight');
    const valRecycle = document.getElementById('val-recycle');

    const resTotalCo2 = document.getElementById('res-total-co2');
    const resAnnualCo2 = document.getElementById('res-annual-co2');
    const resCircularity = document.getElementById('res-circularity');
    const resWater = document.getElementById('res-water');

    const barMfg = document.getElementById('bar-mfg');
    const barUse = document.getElementById('bar-use');
    const barLog = document.getElementById('bar-log');
    const barEol = document.getElementById('bar-eol');

    // Base device baseline footprints (kg CO2e)
    const deviceProfiles = {
      phone: { baseMfg: 65, baseUsePerYr: 4, baseLog: 6, water: 1200 },
      laptop: { baseMfg: 240, baseUsePerYr: 18, baseLog: 15, water: 4500 },
      server: { baseMfg: 1200, baseUsePerYr: 280, baseLog: 45, water: 18000 },
      iot: { baseMfg: 12, baseUsePerYr: 1.2, baseLog: 1.5, water: 250 }
    };

    function recalculate() {
      const devType = simDevice ? simDevice.value : 'phone';
      const profile = deviceProfiles[devType] || deviceProfiles.phone;

      const years = simYears ? parseFloat(simYears.value) : 3;
      const cleanPct = simCleanEnergy ? parseFloat(simCleanEnergy.value) : 25;
      const airFreightPct = simFreight ? parseFloat(simFreight.value) : 50;
      const recyclePct = simRecycle ? parseFloat(simRecycle.value) : 30;

      if (valYears) valYears.textContent = `${years} yrs`;
      if (valClean) valClean.textContent = `${cleanPct}%`;
      if (valFreight) valFreight.textContent = `${airFreightPct}% Air / ${100 - airFreightPct}% Ocean`;
      if (valRecycle) valRecycle.textContent = `${recyclePct}%`;

      // Calculations:
      // Clean energy reduces manufacturing carbon by up to 60%
      const mfgFactor = 1 - (cleanPct / 100) * 0.6;
      const calcMfg = profile.baseMfg * mfgFactor;

      // Use phase over years
      const calcUse = profile.baseUsePerYr * years;

      // Freight carbon: air freight is 30x more intense than ocean
      const logFactor = (airFreightPct / 100) * 1.5 + ((100 - airFreightPct) / 100) * 0.1;
      const calcLog = profile.baseLog * logFactor;

      // End of life credit/debit: recycling offsets up to 18% of embodied manufacturing
      const eolCredit = (recyclePct / 100) * (calcMfg * 0.22);
      const calcEol = Math.max(2, calcMfg * 0.08 - eolCredit);

      const totalCo2 = Math.round(calcMfg + calcUse + calcLog + calcEol);
      const annualCo2 = Math.round((totalCo2 / years) * 10) / 10;
      const circularityScore = Math.min(98, Math.round(15 + recyclePct * 0.6 + (cleanPct / 100) * 20));
      const calcWaterAvoided = Math.round(profile.water * (recyclePct / 100) * 0.7);

      if (resTotalCo2) resTotalCo2.textContent = `${totalCo2} kg`;
      if (resAnnualCo2) resAnnualCo2.textContent = `${annualCo2} kg/yr`;
      if (resCircularity) resCircularity.textContent = `${circularityScore}%`;
      if (resWater) resWater.textContent = `${calcWaterAvoided} L`;

      // Breakdown Bar percentages
      const sum = calcMfg + calcUse + calcLog + calcEol;
      const pMfg = Math.round((calcMfg / sum) * 100);
      const pUse = Math.round((calcUse / sum) * 100);
      const pLog = Math.round((calcLog / sum) * 100);
      const pEol = 100 - (pMfg + pUse + pLog);

      if (barMfg) { barMfg.style.width = `${pMfg}%`; barMfg.title = `Manufacturing: ${pMfg}%`; }
      if (barUse) { barUse.style.width = `${pUse}%`; barUse.title = `Use Phase: ${pUse}%`; }
      if (barLog) { barLog.style.width = `${pLog}%`; barLog.title = `Logistics: ${pLog}%`; }
      if (barEol) { barEol.style.width = `${pEol}%`; barEol.title = `End-of-Life: ${pEol}%`; }
    }

    [simDevice, simYears, simCleanEnergy, simFreight, simRecycle].forEach((input) => {
      if (input) {
        input.addEventListener('input', () => {
          recalculate();
          sound.playChirp(600 + Math.random() * 200, 0.02);
        });
      }
    });

    recalculate();
  }

  // 10. SLIDE 9: Sci-Fi Horizon 2050 Transient Nanite Dissolution
  function runNaniteDissolutionCanvas() {
    const canvas = document.getElementById('canvas-nanite');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.parentElement.clientWidth || 480);
    let h = (canvas.height = canvas.parentElement.clientHeight || 380);

    let t = 0;
    const nanites = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      nanites.push({
        origX: w * 0.35 + (i % 10) * 16,
        origY: h * 0.3 + Math.floor(i / 10) * 16,
        x: w * 0.35 + (i % 10) * 16,
        y: h * 0.3 + Math.floor(i / 10) * 16,
        vx: 0,
        vy: 0,
        color: '#00ff9d',
        dissolved: false
      });
    }

    function draw() {
      if (state.currentSlide !== 9) return;
      ctx.clearRect(0, 0, w, h);
      t += 0.02;

      // Laser stimulus scanner
      const scanX = w * 0.2 + (Math.sin(t) * 0.5 + 0.5) * (w * 0.6);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scanX, 20);
      ctx.lineTo(scanX, h - 20);
      ctx.stroke();

      // Nanite Substrate grid
      for (let n of nanites) {
        if (Math.abs(n.x - scanX) < 15) {
          n.dissolved = true;
          n.vx = (Math.random() - 0.5) * 2;
          n.vy = -Math.random() * 2 - 0.5;
        }

        if (n.dissolved) {
          n.x += n.vx;
          n.y += n.vy;
          ctx.fillStyle = 'rgba(0, 255, 157, 0.6)';
        } else {
          ctx.fillStyle = '#00f0ff';
        }

        ctx.fillRect(n.x, n.y, 6, 6);

        // Reset if float away
        if (n.y < 10) {
          n.x = n.origX;
          n.y = n.origY;
          n.dissolved = false;
        }
      }

      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = '#00ff9d';
      ctx.fillText('BIODEGRADABLE TRANSIENT SUBSTRATE: 100% WATER DISSOLUTION', 15, 25);
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('SILK FIBROIN + ZINC TRACE MATRIX ZERO TOXIC LEACHATE', 15, 42);

      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- MODAL DIALOGS (COMMAND SEARCH & TECHNICAL DOSSIER) ---
  function initModals() {
    const searchModal = document.getElementById('search-modal');
    const searchBtn = document.getElementById('search-btn');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    const dossierModal = document.getElementById('dossier-modal');
    const dossierBtn = document.getElementById('dossier-btn');
    const dossierClose = document.getElementById('dossier-close');

    // Search Database
    const searchIndex = [
      { title: 'ISO 14040 & 14044 Framework', slide: 0, tag: 'Standard' },
      { title: 'Goal and Scope Definition', slide: 0, tag: 'Methodology' },
      { title: 'Functional Unit Definition', slide: 0, tag: 'Scope' },
      { title: 'Lithium & Brine Extraction', slide: 1, tag: 'Raw Materials' },
      { title: 'Cobalt Mining in DRC', slide: 1, tag: 'Critical Minerals' },
      { title: 'Neodymium & Rare Earth Elements', slide: 1, tag: 'Magnets' },
      { title: 'Tantalum Capacitors & Coltan', slide: 1, tag: 'Minerals' },
      { title: 'Gold PCB Traces & Cyanide', slide: 1, tag: 'Precious Metals' },
      { title: 'Extreme Ultraviolet (EUV) Lithography', slide: 2, tag: 'Semiconductor' },
      { title: 'Fluorinated GHGs (NF3, CF4, SF6)', slide: 2, tag: 'Emissions' },
      { title: 'Ultrapure Water (UPW) Consumption', slide: 2, tag: 'Water Footprint' },
      { title: 'Surface Mount Technology (SMT)', slide: 3, tag: 'Assembly' },
      { title: 'Air Freight vs Maritime Shipping', slide: 3, tag: 'Logistics' },
      { title: 'Grid Carbon Intensity Factor', slide: 4, tag: 'Use Phase' },
      { title: 'Vampire & Phantom Power Draw', slide: 4, tag: 'Power' },
      { title: 'Cloud Rebound Effect & AI Compute', slide: 4, tag: 'Data Centers' },
      { title: 'Global E-Waste Crisis (62M Tonnes)', slide: 5, tag: 'E-Waste' },
      { title: 'Agbogbloshie & Guiyu Informal Scraps', slide: 5, tag: 'Toxicology' },
      { title: 'Pyrometallurgical Smelting', slide: 6, tag: 'Recycling' },
      { title: 'Hydrometallurgical Acid Leaching', slide: 6, tag: 'Urban Mining' },
      { title: 'Bioleaching with Acidithiobacillus', slide: 6, tag: 'Bio-tech' },
      { title: 'EU WEEE & RoHS Directives', slide: 7, tag: 'Regulation' },
      { title: 'EU Digital Product Passport (DPP)', slide: 7, tag: 'Policy' },
      { title: 'Design for Disassembly (DfD)', slide: 7, tag: 'Modularity' },
      { title: 'Interactive LCA Simulator Calculator', slide: 8, tag: 'Tool' },
      { title: 'Transient Resorbable Electronics', slide: 9, tag: 'Future 2050' }
    ];

    function openSearch() {
      if (searchModal) {
        searchModal.classList.add('open');
        sound.playChirp(700, 0.05);
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          renderSearchResults('');
        }
      }
    }

    function closeSearch() {
      if (searchModal) searchModal.classList.remove('open');
    }

    if (searchBtn) searchBtn.onclick = openSearch;
    if (searchClose) searchClose.onclick = closeSearch;

    function renderSearchResults(q) {
      if (!searchResults) return;
      const filtered = q
        ? searchIndex.filter((item) =>
            item.title.toLowerCase().includes(q.toLowerCase()) ||
            item.tag.toLowerCase().includes(q.toLowerCase())
          )
        : searchIndex;

      searchResults.innerHTML = filtered
        .map(
          (item) => `
        <div class="search-item" data-slide="${item.slide}">
          <div>
            <div style="font-weight: 600; color: #fff;">${item.title}</div>
            <div style="font-size: 0.72rem; color: #00f0ff; font-family: ui-monospace;">TAG: ${item.tag}</div>
          </div>
          <span class="sci-btn" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">JUMP ➔</span>
        </div>
      `
        )
        .join('');

      searchResults.querySelectorAll('.search-item').forEach((row) => {
        row.addEventListener('click', () => {
          const sIdx = parseInt(row.getAttribute('data-slide'), 10);
          closeSearch();
          const pills = document.querySelectorAll('.topic-pill');
          if (pills[sIdx]) pills[sIdx].click();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderSearchResults(e.target.value);
      });
    }

    // Dossier Modal
    if (dossierBtn) {
      dossierBtn.onclick = () => {
        if (dossierModal) {
          dossierModal.classList.add('open');
          sound.playChirp(820, 0.05);
        }
      };
    }
    if (dossierClose) {
      dossierClose.onclick = () => {
        if (dossierModal) dossierModal.classList.remove('open');
      };
    }

    // Close on overlay background click
    window.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
      if (e.target === dossierModal) dossierModal.classList.remove('open');
    });

    // Keyboard shortcut Cmd+K or /
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      } else if (e.key === 'Escape') {
        closeSearch();
        if (dossierModal) dossierModal.classList.remove('open');
      }
    });
  }

  // --- INITIALIZE ON DOM READY ---
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAmbientHologram();
    initModals();
  });
})();
