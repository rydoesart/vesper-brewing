(() => {
  const viewer = document.querySelector("#can-viewer");
  const canvas = viewer.querySelector("canvas");
  const fallback = viewer.querySelector("img");
  const controls = document.querySelector(".can-controls");
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const width = 420;
  const height = 960;
  const axis = width / 2;
  const radius = 194;
  const labelTop = 152;
  const labelHeight = 715;
  const ellipseDepth = 17;
  let image;
  let rotation = 0;
  let drag;
  let pendingFrame;
  let requestNumber = 0;
  let columns = [];
  let canvasScale = 1;
  const body = new Path2D(
    "M 48 52 Q 40 57 54 69 L 55 83 C 55 115 16 134 16 181 " +
    "L 16 822 C 16 866 27 887 48 901 L 54 919 Q 60 937 210 938 " +
    "Q 360 937 366 919 L 372 901 C 393 887 404 866 404 822 " +
    "L 404 181 C 404 134 365 115 365 83 L 366 69 Q 380 57 372 52 Z"
  );

  function gradient(x0, y0, x1, y1, stops) {
    const result = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [position, color] of stops) result.addColorStop(position, color);
    return result;
  }

  function ellipse(x, y, rx, ry, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function uAt(x) {
    const normalized = Math.max(-1, Math.min(1, (x - axis) / radius));
    return 0.5 + Math.asin(normalized) / (Math.PI * 2);
  }

  function resize() {
    const newWidth = Math.min(1050, Math.ceil(viewer.clientWidth * Math.max(1.5, (window.devicePixelRatio || 1) * 1.25)));
    if (!newWidth || newWidth === canvas.width && columns.length) return;
    canvas.width = newWidth;
    canvas.height = Math.round(newWidth * height / width);
    canvasScale = newWidth / width;
    columns = Array.from({ length: newWidth }, (_, x) => {
      const left = x / canvasScale;
      const right = (x + 1) / canvasScale;
      const normalized = (0.5 * (left + right) - axis) / radius;
      if (Math.abs(normalized) > 1.003) return null;
      return {
        left: uAt(left),
        span: Math.max(0.00001, uAt(right) - uAt(left)),
        top: labelTop + ellipseDepth * Math.sqrt(Math.max(0, 1 - normalized ** 2)),
      };
    });
    schedulePaint();
  }

  function drawLabel() {
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    for (let x = 0; x < columns.length; x++) {
      const column = columns[x];
      if (!column) continue;
      const offset = ((column.left - rotation + 1) % 1) * sourceWidth;
      const span = column.span * sourceWidth;
      const firstSpan = Math.min(sourceWidth - offset, span);
      const firstWidth = firstSpan / span;
      const top = column.top * canvasScale;
      const drawHeight = labelHeight * canvasScale;
      ctx.drawImage(image, offset, 0, firstSpan, sourceHeight, x, top, firstWidth, drawHeight);
      if (firstSpan < span) {
        ctx.drawImage(image, 0, 0, span - firstSpan, sourceHeight, x + firstWidth, top, 1 - firstWidth, drawHeight);
      }
    }
  }

  function paint() {
    pendingFrame = 0;
    if (!image || !columns.length) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
    ctx.save();
    ctx.clip(body);
    ctx.fillStyle = gradient(16, 0, 404, 0, [
      [0, "#08090d"], [.18, "#20232a"], [.49, "#15171b"], [.78, "#24272d"], [1, "#0c0d10"],
    ]);
    ctx.fillRect(0, 0, width, height);
    const bottom = gradient(0, 875, 0, 941, [
      [0, "#15171b"], [.16, "#777a82"], [.28, "#bbbfc5"],
      [.56, "#696d74"], [.81, "#b2b6bc"], [1, "#535761"],
    ]);
    ctx.fillStyle = bottom;
    ctx.fillRect(0, 875, width, 66);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawLabel();
    ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
    ctx.fillStyle = gradient(16, 0, 404, 0, [
      [0, "#0008"], [.08, "#0002"], [.18, "#fff2"], [.34, "#fff0"],
      [.67, "#0000"], [.84, "#fff2"], [.94, "#0002"], [1, "#0008"],
    ]);
    ctx.fillRect(0, 52, width, height - 52);
    ctx.restore();

    const silver = gradient(47, 28, 373, 58, [
      [0, "#7c8087"], [.22, "#d7dbe0"], [.48, "#9397a0"], [.78, "#dfe2e6"], [1, "#6c727d"],
    ]);
    ellipse(axis, 53, 166, 20, "#676d76");
    ellipse(axis, 48, 166, 17, silver);
    ellipse(axis, 46, 148, 11, "#9297a1");
    ellipse(axis, 46, 136, 8, silver);
    ellipse(axis + 10, 46, 25, 3.6, "#53565e");
  }

  function schedulePaint() {
    if (!pendingFrame) pendingFrame = requestAnimationFrame(paint);
  }

  function rotate(angle) {
    rotation = ((angle % 1) + 1) % 1;
    schedulePaint();
  }

  async function showLabel(src, name) {
    const request = ++requestNumber;
    const next = new Image();
    next.src = src;
    await next.decode();
    if (request !== requestNumber) return;
    image = next;
    viewer.setAttribute("aria-label", `Rotating ${name} can`);
    fallback.hidden = true;
    canvas.hidden = false;
    controls.hidden = false;
    viewer.tabIndex = 0;
    viewer.setAttribute("role", "group");
    resize();
    rotate(0);
  }

  window.vesperCan = { showLabel };
})();
