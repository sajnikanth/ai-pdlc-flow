// ── EDITOR PAGE ──────────────────────────────────────────────────

const hSlider = document.getElementById('hSlider');
const zSlider = document.getElementById('zSlider');
const photoBg = document.getElementById('photoBg');
const cropOverlay = document.getElementById('cropOverlay');
const warningsPanel = document.getElementById('warningsPanel');
const faceL = document.getElementById('faceL');
const faceR = document.getElementById('faceR');
const qualityBar = document.getElementById('qualityBar');
const resolutionLabel = document.getElementById('resolutionLabel');
const saveDot = document.getElementById('saveDot');
const saveLabel = document.getElementById('saveLabel');

if (hSlider) {
  hSlider.addEventListener('input', function () {
    document.getElementById('hVal').textContent = this.value + '%';
    const offset = (this.value - 50) * 1.2;
    photoBg.style.transform = `scale(${zSlider.value / 100}) translateX(${offset}px)`;
    checkCrop();
  });
}

if (zSlider) {
  zSlider.addEventListener('input', function () {
    document.getElementById('zVal').textContent = this.value + '%';
    const offset = (hSlider.value - 50) * 1.2;
    photoBg.style.transform = `scale(${this.value / 100}) translateX(${offset}px)`;
  });
}

let activeScenario = 'ok';

function setScenario(s) {
  activeScenario = s;
  ['ok', 'crop', 'lowres', 'both'].forEach(id => {
    const btn = document.getElementById('btn-' + id);
    if (btn) btn.style.background = id === s ? '#E6F4F3' : '';
  });

  clearWarnings();
  triggerAutosave();

  if (s === 'ok') {
    showAllClear();
    setResolution('Excellent · 3200×2400px', 95, 'good');
    if (cropOverlay) cropOverlay.classList.remove('on');
    if (faceR) faceR.style.left = 'calc(50% + 18px)';
  }

  if (s === 'crop' || s === 'both') {
    if (faceR) faceR.style.left = 'calc(100% - 55px)';
    if (cropOverlay) cropOverlay.classList.add('on');
    showCropWarning();
    if (s === 'crop') setResolution('Excellent · 3200×2400px', 95, 'good');
  }

  if (s === 'lowres' || s === 'both') {
    setResolution('Poor · 480×360px · below minimum', 18, 'bad');
    showResWarning();
    if (s !== 'both' && cropOverlay) cropOverlay.classList.remove('on');
  }

  if (s === 'lowres') {
    if (faceR) faceR.style.left = 'calc(50% + 18px)';
  }
}

function clearWarnings() {
  if (!warningsPanel) return;
  warningsPanel.innerHTML = '';
}

function showAllClear() {
  if (!warningsPanel) return;
  warningsPanel.innerHTML = `
    <div class="banner ok">
      <div class="banner-icon">✅</div>
      <div class="banner-body">
        <h4>Looks great!</h4>
        <p>No issues detected. Your photo is ready to print.</p>
      </div>
    </div>`;
}

function showCropWarning() {
  if (!warningsPanel) return;
  warningsPanel.innerHTML += `
    <div class="banner error" id="cropBanner">
      <div class="banner-icon">✂️</div>
      <div class="banner-body">
        <h4>Head will be cut off</h4>
        <p>A face is too close to the right edge and will be cropped in the final print.</p>
        <div class="banner-actions">
          <button class="btn-sm btn-sm-primary" onclick="fixCrop()">Adjust frame</button>
          <button class="btn-sm btn-sm-ghost" onclick="ignoreCrop()">I understand, keep as-is</button>
        </div>
      </div>
    </div>`;
}

function showResWarning() {
  if (!warningsPanel) return;
  warningsPanel.innerHTML += `
    <div class="banner warn" id="resBanner">
      <div class="banner-icon">⚠️</div>
      <div class="banner-body">
        <h4>Image may print blurry</h4>
        <p>This image is 480×360px — too low for a 30×30cm print. For best results, use an image at least 3000×3000px.</p>
        <div class="banner-actions">
          <button class="btn-sm btn-sm-primary" onclick="fixRes()">Choose different photo</button>
          <button class="btn-sm btn-sm-ghost" onclick="ignoreCrop()">Order at lower quality</button>
        </div>
      </div>
    </div>`;
}

function checkCrop() {
  // auto-detect when slider pushes face to edge
  if (hSlider && parseInt(hSlider.value) > 75) {
    if (faceR) faceR.style.left = 'calc(100% - 55px)';
    if (cropOverlay) cropOverlay.classList.add('on');
    if (warningsPanel && !document.getElementById('cropBanner')) {
      clearWarnings();
      showCropWarning();
    }
  } else if (activeScenario === 'ok') {
    if (faceR) faceR.style.left = 'calc(50% + 18px)';
    if (cropOverlay) cropOverlay.classList.remove('on');
    clearWarnings();
    showAllClear();
  }
}

function fixCrop() {
  if (hSlider) { hSlider.value = 50; document.getElementById('hVal').textContent = '50%'; }
  if (photoBg) photoBg.style.transform = '';
  if (faceR) faceR.style.left = 'calc(50% + 18px)';
  if (cropOverlay) cropOverlay.classList.remove('on');
  clearWarnings();
  showAllClear();
  activeScenario = 'ok';
  triggerAutosave();
}

function fixRes() {
  setResolution('Excellent · 3200×2400px', 95, 'good');
  clearWarnings();
  showAllClear();
  activeScenario = 'ok';
  triggerAutosave();
}

function ignoreCrop() {
  if (!warningsPanel) return;
  warningsPanel.innerHTML = `
    <div class="banner warn">
      <div class="banner-icon">⚠️</div>
      <div class="banner-body">
        <h4>Warning acknowledged</h4>
        <p>You've confirmed you're aware of the crop. We'll still run our AI quality check at checkout.</p>
      </div>
    </div>`;
}

function setResolution(text, pct, level) {
  if (resolutionLabel) resolutionLabel.textContent = text;
  if (qualityBar) {
    qualityBar.style.width = pct + '%';
    qualityBar.className = 'q-bar-fill ' + level;
  }
}

function triggerAutosave() {
  if (!saveDot || !saveLabel) return;
  saveDot.classList.add('saving');
  saveLabel.textContent = 'Saving…';
  setTimeout(() => {
    saveDot.classList.remove('saving');
    saveLabel.textContent = 'All changes saved';
  }, 1400);
}

// Periodic autosave simulation
setInterval(() => { if (saveDot) triggerAutosave(); }, 30000);


// ── PREVIEW PAGE ──────────────────────────────────────────────────

function runScan() {
  const steps = [
    { dotId: 'c1dot', textId: 'c1', label: 'No crop issues detected ✓', delay: 900 },
    { dotId: 'c2dot', textId: 'c2', label: 'Colour accuracy verified ✓', delay: 1800 },
    { dotId: 'c3dot', textId: 'c3', label: 'Resolution: excellent ✓', delay: 2600 },
    { dotId: 'c4dot', textId: 'c4', label: 'File integrity confirmed ✓', delay: 3300 },
  ];

  // Kick off first step as scanning immediately
  const firstDot = document.getElementById(steps[0].dotId);
  if (firstDot) { firstDot.className = 'check-dot scan'; firstDot.textContent = '⏳'; }

  steps.forEach((s, i) => {
    setTimeout(() => {
      // Mark current as passed
      const dot = document.getElementById(s.dotId);
      const text = document.getElementById(s.textId);
      if (dot) { dot.className = 'check-dot pass'; dot.textContent = '✓'; }
      if (text) { text.textContent = s.label; text.style.color = ''; }
      // Mark next step as scanning
      if (i < steps.length - 1) {
        const nextDot = document.getElementById(steps[i + 1].dotId);
        const nextText = document.getElementById(steps[i + 1].textId);
        if (nextDot) { nextDot.className = 'check-dot scan'; nextDot.textContent = '⏳'; }
        if (nextText) nextText.style.color = '';
      }
    }, s.delay);
  });

  // Complete scan
  setTimeout(() => {
    const aiIcon = document.getElementById('aiIcon');
    const aiTitle = document.getElementById('aiTitle');
    const aiSub = document.getElementById('aiSub');
    if (aiIcon) { aiIcon.classList.remove('spinning'); aiIcon.textContent = '✅'; }
    if (aiTitle) aiTitle.textContent = 'Quality check passed';
    if (aiSub) aiSub.textContent = 'All checks clear · Confidence score 98/100';

    // Show review notice (high value order)
    const notice = document.getElementById('reviewNotice');
    if (notice) notice.style.display = 'flex';

    // Show guarantee badge
    const badge = document.getElementById('guaranteeBadge');
    if (badge) { badge.style.display = 'block'; badge.style.opacity = '0'; badge.style.transition = 'opacity .5s'; setTimeout(() => badge.style.opacity = '1', 50); }

    // Enable CTA
    const btn = document.getElementById('orderBtn');
    const sub = document.getElementById('orderSub');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
    if (sub) sub.textContent = 'Protected by Perfect Print Guarantee';
  }, 3700);
}


// ── REPORT ISSUE PAGE ──────────────────────────────────────────────

let selectedIssue = null;
let uploadDone = false;

function selectIssue(el, type) {
  selectedIssue = type;
  document.querySelectorAll('.issue-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  const btn = document.getElementById('submitBtn');
  const sub = btn ? btn.nextElementSibling : null;
  if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
  if (sub) sub.textContent = 'Auto-approved — no review required for first-time issues';
}

function simulateUpload() {
  const zone = document.getElementById('uploadZone');
  const preview = document.getElementById('uploadedPreview');
  if (!zone || !preview) return;
  zone.innerHTML = '<div class="icon">⏳</div><div class="label">Uploading…</div>';
  setTimeout(() => {
    zone.style.display = 'none';
    preview.classList.add('on');
    uploadDone = true;
  }, 1200);
}

function submitReport() {
  const btn = document.getElementById('submitBtn');
  if (!btn || !selectedIssue) return;

  // Show loading state
  btn.innerHTML = '<span class="spinner"></span> Processing…';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    const form = document.getElementById('formState');
    const success = document.getElementById('successState');
    if (form) form.classList.add('off');
    if (success) success.classList.add('on');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 1800);
}
