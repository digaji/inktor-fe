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

## Features

### SVG Editing

Circle

https://github.com/digaji/inktor-fe/assets/71363607/5dd25b34-8818-4fc6-9b05-ebd6c5316897

Rectangle

https://github.com/digaji/inktor-fe/assets/71363607/63ed5004-0972-4d73-8923-c030f4394fe6

Path

https://github.com/digaji/inktor-fe/assets/71363607/ada342e5-3d50-47a0-b09f-accbd0991ee3

Benchmarking

https://github.com/digaji/inktor-fe/assets/71363607/3ee64767-5be4-472e-bc8e-0f76178f4257

### Realtime Collab

https://github.com/digaji/inktor-fe/assets/71363607/08740ca6-f545-4979-adc4-e243455e8bef

https://github.com/digaji/inktor-fe/assets/71363607/8863ad57-1fbb-4a41-8795-014e273b654f
