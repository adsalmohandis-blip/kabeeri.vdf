const net = require("net");

function encodeFrame(frame) {
  const payload = Buffer.from(JSON.stringify(frame), "utf8");
  const header = Buffer.alloc(4);
  header.writeUInt32BE(payload.length, 0);
  return Buffer.concat([header, payload]);
}

function decodeFrame(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return null;
  const length = buffer.readUInt32BE(0);
  if (buffer.length < 4 + length) return null;
  const payload = buffer.slice(4, 4 + length).toString("utf8");
  try {
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

function createFrameReader(onFrame) {
  let buffer = Buffer.alloc(0);
  return function onData(chunk) {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 4) {
      const frameLength = buffer.readUInt32BE(0);
      if (buffer.length < 4 + frameLength) break;
      const raw = buffer.slice(4, 4 + frameLength).toString("utf8");
      buffer = buffer.slice(4 + frameLength);
      try {
        const frame = JSON.parse(raw);
        onFrame(frame);
      } catch (error) {
        onFrame({ type: "error", error: "malformed_json" });
      }
    }
  };
}

function createTransferServer({ port, onFrame, onConnection } = {}) {
  const server = net.createServer((socket) => {
    if (typeof onConnection === "function") onConnection(socket);
    const readFrame = createFrameReader((frame) => {
      if (typeof onFrame === "function") {
        onFrame(frame, socket);
      }
    });
    socket.on("data", readFrame);
    socket.on("error", () => {});
  });
  server.listen(Number(port) || 47633, "127.0.0.1");
  return server;
}

function sendFrames({ host = "127.0.0.1", port = 47633, frames = [], timeout = 5000 } = {}) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const responses = [];
    const timer = setTimeout(() => {
      socket.destroy(new Error("Transfer timed out."));
    }, timeout);
    const readFrame = createFrameReader((frame) => {
      responses.push(frame);
    });
    socket.on("connect", () => {
      for (const frame of frames) {
        socket.write(encodeFrame(frame));
      }
    });
    socket.on("data", readFrame);
    socket.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    socket.on("close", () => {
      clearTimeout(timer);
      resolve(responses);
    });
  });
}

module.exports = {
  encodeFrame,
  decodeFrame,
  createFrameReader,
  createTransferServer,
  sendFrames
};
