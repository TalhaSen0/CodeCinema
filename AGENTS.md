# CodeCinema

Build cinematic 2D films from brief files, with minimal user intervention and no mandatory paid APIs. Default delivery is 1920×1080, 30 FPS, H.264/AAC. This is a film production repository, not a website project.

- Read README.md, docs/production-pipeline.md and review/quality-report.md before continuing production.
- Every film exposes window.__film = {ready, duration, seek(t)}. All scene state is derived from time. Never use frame counters, unseeded randomness or integrated browser timing inside drawing functions.
- Engine primitives live in engine/. Content, rig, sets and production data live in films/<id>/. The Galileo film is 48 seconds. production.mjs is the shared source of narration, storyboard and sound events.
- Rendering adapts the MIT Opus harness in tools/upstream/. tools/setup.mjs reproduces Windows adaptations; preserve attribution. Do not edit generated upstream copies without updating setup.
- Keep camera, object contact, procedural geometry and physics deterministic. Scientific particles slide; they are not rolling balls. Preserve equal diagram axis scales and common endpoints.
- Establish character identity once. Props must follow joint anchors; page and wrist share films/galileo/pages.mjs and motion.mjs.
- Generate draft, inspect contact sheets AND dense temporal strips, record defects, revise, compare, then render final. Never equate passing tests with artistic approval.
- Open actual images with view_image. Inspect decoded final-video frames as well as browser captures. Report untested subjective audio quality honestly.
- Do not force paid generation or install unlimited model weights. Record model licenses separately from runtime licenses.
- Current Piper Turkish DFKI narration in Galileo has a CC BY-NC-SA 4.0 dataset restriction. The Galileo voiced MP4 is delivered for noncommercial use; never claim blanket commercial clearance. Active narrator is locked to Alania d1-02552 (CC BY 4.0 synthetic reference + Chatterbox MIT generation) in assets/voices/codecinema-narrator/voice-lock.json with no automatic Piper fallback.
- Generative-illustration reference repository has no detected license file at the pinned revision; no code copied from it. motion-skills is an index of packs, not a complete animation engine.
- Creative/research stages run in the Codex session. CLI scaffolding does not contain an autonomous local LLM or image model. State this boundary clearly.
- Commands: npm run dev; npm run compare; npm run audio; npm run render:draft; npm run review:frames; npm run render:final; npm run verify. Render targets are organized in renders/<film>/<release>/.
- To start another film: npm run new -- --brief briefs/example.md --id example, then execute its production-request.md in a Codex session. Reuse the engine and generic tools.
- Tests: node --test tests/*.test.mjs; npm run verify checks the actual final MP4 and repeated/cold seek hashes.
- Progress: docs/progress.md. Current outputs: renders/galileo-final-v2.mp4 (48s), renders/salincagin-sirri/2026-10-16-v1/final.mp4 (32s). Evidence: review/, renders/salincagin-sirri/2026-10-16-v1/review/.
- Remaining quality limits: stylized procedural puppet rather than full facial acting; local Chatterbox installation pending (hosted API inference benchmarked and operational); ACE-Step researched but not benchmarked. Do not call these solved without new evidence.

- Page revision baseline: cc2b213. Current implementation: docs/page-surface-implementation.md. Shared geometry: engine/page-surface.mjs, films/galileo/pages.mjs; content: page-content.mjs. Never restore separate small book diagrams or independent portal corners.
- Run local transition clips, verify:surfaces and dense review:transitions before a full render. Review all of 23.5–29.5 s, not just endpoints. A finite mesh is insufficient: check size bounds and decoded temporal continuity. Keep current art/audio; preserve baseline before further edits.
- Current v2 final: renders/galileo-final-v2.mp4; before/after: renders/galileo-before-after.mp4; evidence: review/revision/. Salıncağın Sırrı final: renders/salincagin-sirri/2026-10-16-v1/final.mp4. Older review/final and review/encoded belong to baseline production.
