(() => {
  const welcome = document.getElementById('welcome');
  const letterScreen = document.getElementById('letter-screen');
  const openButton = document.getElementById('open-letter');
  const title = document.getElementById('letter-title');
  const paragraphs = [...document.querySelectorAll('#letter-copy p')];
  const flowerLayer = document.getElementById('flower-layer');
  const musicToggle = document.getElementById('music-toggle');

  const titleText = 'A veces, el amor llega en forma de amistad';
  let musicContext = null;
  let musicNodes = [];
  let musicOn = false;
  let flowerTimer = null;

  function typeTitle() {
    let i = 0;
    title.textContent = '';
    title.classList.remove('done');
    const interval = window.setInterval(() => {
      title.textContent += titleText.charAt(i);
      i++;
      if (i >= titleText.length) {
        window.clearInterval(interval);
        title.classList.add('done');
        revealParagraphs();
      }
    }, 72);
  }

  function revealParagraphs() {
    paragraphs.forEach((p, index) => {
      window.setTimeout(() => {
        p.classList.add('visible');
        if (index > 0) addFlowerBurst(2);
      }, 450 + index * 1050);
    });
    window.setTimeout(() => addFlowerBurst(8), 1600);
  }

  function createFlower() {
    const el = document.createElement('span');
    el.className = 'floating-lily';
    el.textContent = Math.random() > 0.35 ? '✿' : '❀';
    el.style.left = `${Math.random() * 100}%`;
    el.style.setProperty('--size', `${12 + Math.random() * 19}px`);
    el.style.setProperty('--duration', `${8 + Math.random() * 8}s`);
    el.style.setProperty('--drift', `${Math.round(Math.random() * 120 - 60)}px`);
    flowerLayer.appendChild(el);
    window.setTimeout(() => el.remove(), 17000);
  }

  function addFlowerBurst(count = 3) {
    for (let i = 0; i < count; i++) window.setTimeout(createFlower, i * 240);
  }

  // A soft, original synthesized instrumental motif. No external audio file is needed.
  function startMusic() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      musicToggle.textContent = '♫ Música no disponible en este navegador';
      return;
    }
    if (!musicContext) musicContext = new AudioCtx();
    if (musicContext.state === 'suspended') musicContext.resume();
    musicOn = true;
    musicToggle.setAttribute('aria-pressed', 'true');
    musicToggle.innerHTML = '<span class="music-icon" aria-hidden="true">♫</span> Música: encendida';

    const master = musicContext.createGain();
    master.gain.value = 0.0001;
    master.connect(musicContext.destination);
    master.gain.setTargetAtTime(0.11, musicContext.currentTime, 1.2);
    musicNodes.push(master);

    const notes = [
      [261.63, 0], [329.63, 0.55], [392.00, 1.1], [329.63, 1.65],
      [293.66, 2.2], [349.23, 2.75], [440.00, 3.3], [349.23, 3.85],
      [246.94, 4.4], [329.63, 4.95], [392.00, 5.5], [329.63, 6.05],
      [220.00, 6.6], [293.66, 7.15], [369.99, 7.7], [293.66, 8.25]
    ];
    const startAt = musicContext.currentTime + 0.15;
    notes.forEach(([freq, offset]) => {
      const osc = musicContext.createOscillator();
      const gain = musicContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, startAt + offset);
      gain.gain.exponentialRampToValueAtTime(0.20, startAt + offset + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 1.35);
      osc.connect(gain);
      gain.connect(master);
      osc.start(startAt + offset);
      osc.stop(startAt + offset + 1.45);
      musicNodes.push(osc, gain);
    });
    // Repeat the gentle phrase while the letter is open.
    musicTimer = window.setTimeout(() => {
      if (musicOn) {
        stopMusic(false);
        startMusic();
      }
    }, 9200);
  }

  let musicTimer = null;
  function stopMusic(updateButton = true) {
    musicOn = false;
    if (musicTimer) window.clearTimeout(musicTimer);
    musicTimer = null;
    if (musicContext) {
      musicNodes.forEach(node => {
        try {
          if (node.gain) node.gain.setTargetAtTime(0.0001, musicContext.currentTime, 0.08);
          else if (node.stop) node.stop();
        } catch (_) {}
      });
    }
    musicNodes = [];
    if (updateButton) {
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.innerHTML = '<span class="music-icon" aria-hidden="true">♫</span> Música: apagada';
    }
  }

  openButton.addEventListener('click', () => {
    welcome.classList.add('hidden');
    letterScreen.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    typeTitle();
    addFlowerBurst(7);
    flowerTimer = window.setInterval(() => addFlowerBurst(2), 4800);
    startMusic();
  });

  musicToggle.addEventListener('click', () => {
    if (musicOn) stopMusic();
    else startMusic();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && musicOn && musicContext) musicContext.suspend();
    else if (!document.hidden && musicOn && musicContext) musicContext.resume();
  });
})();
