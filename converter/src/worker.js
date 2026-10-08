// Runs ffmpeg off the main thread. The build prepends ffmpeg-core.js, which defines
// createFFmpegCore.

let core;

const handlers = {
  async load({ wasmBinary }) {
    core = await createFFmpegCore({ wasmBinary });
    core.setLogger(({ message }) => self.postMessage({ log: message }));
  },
  exec({ args }) {
    core.setTimeout(-1);
    core.exec(...args);
    const exitCode = core.ret;
    core.reset();
    return exitCode;
  },
  writeFile({ path, data }) {
    core.FS.writeFile(path, data);
  },
  readFile({ path }) {
    return core.FS.readFile(path);
  },
  deleteFile({ path }) {
    core.FS.unlink(path);
  },
};

self.onmessage = async ({ data: { id, type, payload } }) => {
  try {
    const result = await handlers[type](payload);
    self.postMessage({ id, result }, result instanceof Uint8Array ? [result.buffer] : []);
  } catch (error) {
    self.postMessage({ id, error: String(error) });
  }
};
