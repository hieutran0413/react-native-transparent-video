// Minimal promise-based client for src/worker.js.
class FFmpegClient {
  #worker;
  #pending = new Map();
  #nextId = 0;
  onLog = () => {};

  constructor(workerURL) {
    this.#worker = new Worker(workerURL);
    this.#worker.onmessage = ({ data }) => {
      if ('log' in data) {
        this.onLog(data.log);
        return;
      }
      const { resolve, reject } = this.#pending.get(data.id);
      this.#pending.delete(data.id);
      if (data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data.result);
      }
    };
  }

  #call(type, payload, transfer = []) {
    return new Promise((resolve, reject) => {
      const id = this.#nextId++;
      this.#pending.set(id, { resolve, reject });
      this.#worker.postMessage({ id, type, payload }, transfer);
    });
  }

  load = (wasmBinary) => this.#call('load', { wasmBinary }, [wasmBinary.buffer]);
  exec = (args) => this.#call('exec', { args });
  writeFile = (path, data) => this.#call('writeFile', { path, data }, [data.buffer]);
  readFile = (path) => this.#call('readFile', { path });
  deleteFile = (path) => this.#call('deleteFile', { path });
}

function decodeEmbedded(id) {
  const binary = atob(document.getElementById(id).textContent);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const BACKGROUNDS = [
  'linear-gradient(135deg, #00c6ff 0%, #0047ff 100%)',
  'linear-gradient(135deg, #ff9a8b 0%, #d4001a 100%)',
  'linear-gradient(135deg, #e0a3ff 0%, #5b00c9 100%)',
  'linear-gradient(135deg, #fff59d 0%, #ff9800 100%)',
];
const LARGE_FILE_BYTES = 500 * 1024 * 1024;

const $ = (id) => document.getElementById(id);
const drop = $('drop');
const fileInput = $('file');
const convertButton = $('convert');
const status = $('status');
const statusText = $('status-text');
const barFill = $('bar-fill');
const result = $('result');
const stacked = $('stacked');

let file = null;
let ffmpeg = null;
let log = [];
let onLogLine = null;
let outputURL = null;

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const toSeconds = (h, m, s) => Number(h) * 3600 + Number(m) * 60 + Number(s);

function setStatus(text, { progress = null, error = false } = {}) {
  status.hidden = false;
  status.classList.toggle('error', error);
  statusText.textContent = text;
  if (progress !== null) {
    barFill.style.width = `${Math.round(progress * 100)}%`;
  }
}

function selectFile(selected) {
  if (!selected) {
    return;
  }
  file = selected;
  $('drop-title').textContent = file.name;
  $('drop-hint').textContent = formatSize(file.size);
  convertButton.disabled = false;
  result.hidden = true;
  if (file.size > LARGE_FILE_BYTES) {
    setStatus('File lớn hơn 500 MB, trình duyệt có thể hết bộ nhớ khi xử lý.', { progress: 0 });
  } else {
    status.hidden = true;
  }
}

async function loadFFmpeg() {
  if (ffmpeg) {
    return ffmpeg;
  }
  const workerBlob = new Blob([decodeEmbedded('worker-source')], { type: 'text/javascript' });
  const instance = new FFmpegClient(URL.createObjectURL(workerBlob));
  instance.onLog = (message) => {
    log.push(message);
    onLogLine?.(message);
  };
  await instance.load(decodeEmbedded('ffmpeg-wasm'));
  ffmpeg = instance;
  return ffmpeg;
}

function buildArgs(inputName, outputName) {
  const width = $('width').value;
  const fps = $('fps').value;
  const filters = [];
  if (fps) {
    filters.push(`fps=${fps}`);
  }
  // H.264 needs even dimensions.
  filters.push(width ? `scale=${width}:-2` : 'scale=trunc(iw/2)*2:trunc(ih/2)*2');
  // Rounding to even sizes leaves a non-square pixel ratio behind; players would stretch it.
  filters.push('setsar=1');

  const args = [];
  if (/\.(webm|mkv)$/i.test(inputName)) {
    // ffmpeg's native VP9 decoder drops the alpha plane; libvpx keeps it.
    args.push('-c:v', 'libvpx-vp9');
  }
  args.push(
    '-i', inputName,
    // format=rgba keeps the alpha plane through scale, which would otherwise drop it.
    // The final scale converts to YUV with the BT.709 matrix the output is tagged with;
    // ffmpeg's default (BT.601) makes players that assume BT.709 shift the colors.
    '-filter_complex',
    `[0:v]${filters.join(',')},format=rgba,split[c][a];[a]alphaextract[m];` +
      '[c][m]vstack,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-colorspace', 'bt709',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-color_range', 'tv',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', $('quality').value,
    '-pix_fmt', 'yuv420p',
    '-an',
    '-movflags', '+faststart',
    outputName
  );
  return args;
}

// Reads the input's stream info from ffmpeg's log; `-i` alone exits right after printing it.
async function hasAlpha(instance, inputName) {
  log = [];
  await instance.exec(['-i', inputName]);
  const text = log.join('\n');
  return (
    /Video: [^\n]*\b(yuva|gbrap|rgba|argb|bgra|abgr|ya\d)/.test(text) ||
    /alpha_mode\s*:\s*1/i.test(text)
  );
}

class NoAlphaError extends Error {}

function explainFailure(error) {
  const text = log.join('\n');
  if (error instanceof NoAlphaError) {
    return 'Video này không có kênh alpha. Hãy xuất lại từ After Effects với Channels: RGB + Alpha.';
  }
  if (/Invalid data found|moov atom not found|Unknown format/i.test(text)) {
    return 'Không đọc được file này. Hãy dùng ProRes 4444 (.mov) hoặc WebM VP9.';
  }
  return 'Chuyển đổi thất bại. Mở console của trình duyệt để xem log ffmpeg.';
}

async function convert() {
  convertButton.disabled = true;
  result.hidden = true;
  log = [];

  const inputName = `input${file.name.match(/\.[^.]+$/)?.[0] ?? '.mov'}`;
  const outputName = 'output.mp4';
  let duration = 0;

  const trackProgress = (message) => {
    const total = message.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (total) {
      duration = toSeconds(total[1], total[2], total[3]);
    }
    const current = message.match(/time=(\d+):(\d+):(\d+\.\d+)/);
    if (current && duration > 0) {
      const progress = Math.min(toSeconds(current[1], current[2], current[3]) / duration, 1);
      setStatus(`Đang chuyển đổi… ${Math.round(progress * 100)}%`, { progress });
    }
  };

  try {
    setStatus('Đang khởi động ffmpeg…', { progress: 0 });
    const instance = await loadFFmpeg();

    setStatus('Đang đọc file…', { progress: 0 });
    await instance.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

    if (!(await hasAlpha(instance, inputName))) {
      await instance.deleteFile(inputName);
      throw new NoAlphaError();
    }

    const started = performance.now();
    onLogLine = trackProgress;
    const exitCode = await instance.exec(buildArgs(inputName, outputName));
    if (exitCode !== 0) {
      throw new Error(`ffmpeg exited with code ${exitCode}`);
    }

    const data = await instance.readFile(outputName);
    await instance.deleteFile(inputName);
    await instance.deleteFile(outputName);

    showResult(new Blob([data.buffer], { type: 'video/mp4' }), (performance.now() - started) / 1000);
    setStatus('Xong.', { progress: 1 });
  } catch (error) {
    console.error(error, log.join('\n'));
    setStatus(explainFailure(error), { error: true });
  } finally {
    onLogLine = null;
    convertButton.disabled = false;
  }
}

function showResult(blob, seconds) {
  if (outputURL) {
    URL.revokeObjectURL(outputURL);
  }
  outputURL = URL.createObjectURL(blob);

  const name = `${file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_stacked.mp4`;
  const download = $('download');
  download.href = outputURL;
  download.download = name;

  stacked.src = outputURL;
  stacked.onloadedmetadata = () => {
    $('result-info').textContent =
      `${name} · ${stacked.videoWidth}×${stacked.videoHeight} · ${formatSize(blob.size)} ` +
      `(gốc ${formatSize(file.size)}) · xử lý trong ${seconds.toFixed(1)} giây`;
  };
  result.hidden = false;
}

function setupSwatches() {
  const stage = $('stage');
  const swatches = $('swatches');
  BACKGROUNDS.forEach((background, index) => {
    const button = document.createElement('button');
    button.style.background = background;
    button.setAttribute('aria-label', `Nền ${index + 1}`);
    button.addEventListener('click', () => {
      stage.style.background = background;
      swatches.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === button));
    });
    swatches.append(button);
  });
  swatches.firstChild.click();
}

fileInput.addEventListener('change', () => selectFile(fileInput.files[0]));
drop.addEventListener('dragover', (event) => {
  event.preventDefault();
  drop.classList.add('over');
});
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (event) => {
  event.preventDefault();
  drop.classList.remove('over');
  selectFile(event.dataTransfer.files[0]);
});
convertButton.addEventListener('click', convert);

setupSwatches();
createPreview($('canvas'), stacked);
