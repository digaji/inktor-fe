# Inktor Frontend

Collaborative peer-to-peer SVG editor frontend utilizing WebAssembly and JavaScript

Made with:

- React
- TypeScript
- WebRTC
- PeerJS

## Local Configuration

1. Build the CRDT libraries for WebAssembly and JavaScript modes from [inktor-crdt](https://github.com/BrynGhiffar/inktor-crdt)

2. Paste the generated `pkg` and `pkg_js` folder into the root directory

3. Run the WebRTC server from [peerjs-demo-peerserver](https://github.com/BrynGhiffar/peerjs-demo-peerserver)

```bash
npm install
npm run dev
```

4. Create the `.env` file from `.env.template` and point it to the WebRTC server

```bash
cp .env.template .env
```

5. Install the node modules and run the frontend

```bash
npm install
npm run dev
```

## Benchmarking

The benchmark presets' creation and manipulation steps are recorded in [BenchmarkPresetsManipulation.md](BenchmarkPresetsManipulation.md) and are editable through [BenchmarkPresets.ts](src/config/BenchmarkPresets.ts)
