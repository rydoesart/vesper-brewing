(() => {
  const viewer = document.querySelector('#can-viewer');
  const can = viewer.querySelector('img');
  const canvas = viewer.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const controls = document.querySelector('.can-controls');
  const buttons = [...controls.querySelectorAll('button')];
  const status = document.querySelector('#can-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tau = Math.PI * 2;
  // Sleeve placement and front registration measured from the supplied PSD.
  // Texture distance must stay proportional to angle around the cylinder.
  const sleeveTop = 36 / 2227;
  const sleeveHeight = 2096 / 2227;
  const frontCenter = 1496.5 / 3018;
  const layer = document.createElement('canvas');
  const layerCtx = layer.getContext('2d');
  const lighting = document.createElement('canvas');
  const lightingCtx = lighting.getContext('2d');
  let frontImage;
  let wrapImage;
  let lightingPattern;
  let angle = 0;
  let target = 0;
  let frame = 0;
  let previousTime = 0;
  let drag;
  let requestNumber = 0;
  let columns = [];

  const normalize = value => ((value + Math.PI) % tau + tau) % tau - Math.PI;

  function uAt(theta) {
    return frontCenter + theta / tau;
  }

  function load(src) {
    const image = new Image();
    image.src = src;
    return image.decode().then(() => image);
  }

  function setInteractive(enabled) {
    viewer.classList.toggle('is-interactive', enabled);
    canvas.hidden = !enabled;
    controls.hidden = !enabled;
    if (enabled) {
      viewer.tabIndex = 0;
      viewer.setAttribute('role', 'group');
      viewer.setAttribute('aria-describedby', 'can-hint');
    } else {
      viewer.removeAttribute('tabindex');
      viewer.removeAttribute('role');
      viewer.removeAttribute('aria-describedby');
    }
  }

  function resize() {
    if (!ctx || !layerCtx || !lightingCtx) return;
    const width = Math.min(900, Math.max(600, Math.ceil(viewer.clientWidth * Math.max(2, window.devicePixelRatio || 1))));
    if (!width || canvas.width === width && columns.length) return;
    canvas.width = layer.width = width;
    canvas.height = layer.height = Math.round(width * 1940 / 750);
    // Body bounds measured from the source silhouette, rather than a drawn can.
    const axis = width * 436.5 / 861;
    const radius = width * 423.5 / 861;
    columns = Array.from({ length: width }, (_, x) => ({
      left: Math.asin(Math.max(-1, Math.min(1, (x - axis) / radius))),
      right: Math.asin(Math.max(-1, Math.min(1, (x + 1 - axis) / radius))),
    }));
    if (frontImage) prepareLighting();
    schedule();
  }

  function prepareLighting() {
    // Reuse a full-width unprinted row just below the shoulder for its studio sheen.
    lighting.width = canvas.width;
    lighting.height = 1;
    lightingCtx.drawImage(frontImage, 0, Math.round(frontImage.height * .12), frontImage.width, 1, 0, 0, lighting.width, 1);
    lightingPattern = layerCtx.createPattern(lighting, 'repeat-y');
  }

  function paint() {
    if (!frontImage || !ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(frontImage, 0, 0, width, height);
    viewer.dataset.rotation = String(Math.round(normalize(angle) / tau * 36000) / 100);
    if (!wrapImage) return;
    layerCtx.clearRect(0, 0, width, height);
    layerCtx.imageSmoothingEnabled = true;
    layerCtx.imageSmoothingQuality = 'high';
    const sleeveY = sleeveTop * height;
    const sleevePixels = sleeveHeight * height;
    const circumference = width * 423.5 / 861 * tau;
    // One full wrap keeps the source artwork's width-to-height ratio.
    // Leave unprinted can above/below it rather than stretching it vertically.
    const labelHeight = Math.min(sleevePixels, circumference * wrapImage.height / wrapImage.width);
    const top = sleeveY + (sleevePixels - labelHeight) / 2;
    layerCtx.fillStyle = '#101010';
    layerCtx.fillRect(0, sleeveY, width, sleevePixels);
    for (let x = 0; x < columns.length; x++) {
      const column = columns[x];
      const left = uAt(column.left - angle);
      const span = (column.right - column.left) / tau;
      const sourceX = ((left % 1 + 1) % 1) * wrapImage.width;
      const sourceWidth = Math.max(.01, span * wrapImage.width);
      const first = Math.min(sourceWidth, wrapImage.width - sourceX);
      const part = first / sourceWidth;
      layerCtx.drawImage(wrapImage, sourceX, 0, first, wrapImage.height, x, top, part, labelHeight);
      if (part < 1) layerCtx.drawImage(wrapImage, 0, 0, sourceWidth - first, wrapImage.height, x + part, top, 1 - part, labelHeight);
    }
    layerCtx.globalCompositeOperation = 'multiply';
    const shading = layerCtx.createLinearGradient(0, 0, width, 0);
    for (const [stop, color] of [[0, '#777'], [.12, '#d8d8d8'], [.35, '#f4f4f4'], [.65, '#e8e8e8'], [.88, '#cfcfcf'], [1, '#777']]) shading.addColorStop(stop, color);
    layerCtx.fillStyle = shading;
    layerCtx.fillRect(0, sleeveY, width, sleevePixels);
    layerCtx.globalCompositeOperation = 'screen';
    layerCtx.fillStyle = lightingPattern;
    layerCtx.fillRect(0, sleeveY, width, sleevePixels);
    // Original photographic alpha keeps the shoulder, base, and edges intact.
    layerCtx.globalCompositeOperation = 'destination-in';
    layerCtx.drawImage(frontImage, 0, 0, width, height);
    layerCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(layer, 0, 0);
  }

  function tick(time) {
    frame = 0;
    const elapsed = previousTime ? Math.min(50, time - previousTime) : 16;
    previousTime = time;
    const difference = target - angle;
    if (reducedMotion.matches || Math.abs(difference) < .001) angle = target;
    else angle += difference * (1 - Math.exp(-elapsed / 45));
    paint();
    if (angle !== target) schedule();
    else previousTime = 0;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function turn(amount) {
    if (!wrapImage) return;
    target += amount;
    schedule();
  }

  function reset() {
    if (!wrapImage) return;
    target = Math.round(angle / tau) * tau;
    schedule();
  }

  async function showLabel(src, name) {
    const request = ++requestNumber;
    const canSrc = src.replace('-wrap.webp', '-can.webp');
    viewer.setAttribute('aria-busy', 'true');
    viewer.setAttribute('aria-label', `${name} can, interactive label`);
    setInteractive(false);
    drag = undefined;
    viewer.classList.remove('is-dragging');
    wrapImage = undefined;
    frontImage = undefined;
    angle = target = 0;
    can.hidden = true;
    status.textContent = '';
    status.classList.remove('has-preview');
    const [frontResult, wrapResult] = await Promise.allSettled([load(canSrc), load(src)]);
    if (request !== requestNumber) return;
    viewer.setAttribute('aria-busy', 'false');
    if (frontResult.status === 'rejected') {
      status.textContent = `${name} can preview could not load. Choose another beer or try again.`;
      throw frontResult.reason;
    }
    frontImage = frontResult.value;
    can.src = canSrc;
    can.alt = `${name} can, original mockup`;
    can.hidden = false;
    status.textContent = '';
    if (wrapResult.status === 'fulfilled' && ctx && layerCtx && lightingCtx) {
      wrapImage = wrapResult.value;
      resize();
      prepareLighting();
      paint();
      setInteractive(true);
    } else if (wrapResult.status === 'rejected') {
      status.classList.add('has-preview');
      status.textContent = 'The front mockup is available, but the rotating label could not load. Select the beer again to retry.';
    }
  }

  for (const button of buttons) button.addEventListener('click', () => {
    if (button.hasAttribute('data-front')) reset();
    else turn(Number(button.dataset.turn) * tau / 8);
  });

  viewer.addEventListener('keydown', event => {
    if (event.key === 'Home') reset();
    else if (event.key === 'ArrowLeft') turn(-tau / 8);
    else if (event.key === 'ArrowRight') turn(tau / 8);
    else return;
    event.preventDefault();
  });

  viewer.addEventListener('pointerdown', event => {
    if (!wrapImage || !event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, angle, active: false };
    viewer.setPointerCapture(event.pointerId);
  });
  viewer.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) < 5) return;
      if (Math.abs(dy) > Math.abs(dx)) return;
      drag.active = true;
      viewer.classList.add('is-dragging');
      viewer.focus({ preventScroll: true });
    }
    event.preventDefault();
    angle = target = drag.angle + dx / viewer.clientWidth * Math.PI;
    schedule();
  });
  function stopDrag(event) {
    if (drag?.id !== event.pointerId) return;
    drag = undefined;
    viewer.classList.remove('is-dragging');
    if (viewer.hasPointerCapture(event.pointerId)) viewer.releasePointerCapture(event.pointerId);
  }
  viewer.addEventListener('pointerup', stopDrag);
  viewer.addEventListener('pointercancel', stopDrag);
  viewer.addEventListener('lostpointercapture', stopDrag);
  reducedMotion.addEventListener('change', schedule);
  new ResizeObserver(resize).observe(viewer);
  window.vesperCan = { showLabel, reset };
})();
