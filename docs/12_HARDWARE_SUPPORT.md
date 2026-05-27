# 12_HARDWARE_SUPPORT — Hardware Capability Reporting

VYB is designed to support future capability-aware workflows across:
GPU, CPU, RAM, storage, controllers, VR/AR/MR devices, haptics, MIDI/audio/MOCAP, eye/hand tracking, and cloud rendering nodes.

## Current scaffold
- A hardware probe function exists (best-effort in web context).
- UI panel exists to validate the reporting surface.

## Planned path
- Native probes via Rust.
- WebGPU capability queries for renderer backend selection.
- Multi-monitor and spatial input surfaces.

