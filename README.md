# 🎙️ Discord Voice Node Patcher

**Studio-grade voice for Discord: 48kHz • 400kbps • True Stereo**

![Version](https://img.shields.io/badge/Version-5.0-5865F2?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=flat-square)
![PowerShell](https://img.shields.io/badge/PowerShell-5.1+-5391FE?style=flat-square)

---

## ⬇️ Download & Run

### Option 1: One-click BAT (recommended)

Download the latest release and run the BAT file:
- https://github.com/ProdHallow/Discord-Node-Patcher-Feb-9-2026/releases/latest

It downloads the latest PowerShell patcher and runs it.

### Option 2: One-liner (no download)

```powershell
irm https://raw.githubusercontent.com/ProdHallow/Discord-Node-Patcher-Feb-9-2026/main/Discord_voice_node_patcher.ps1 -OutFile "$env:TEMP\dvp.ps1"; & "$env:TEMP\dvp.ps1"
```

---

## ⚠️ Requirement: You need C++ build tools

This patcher compiles a small native C++ helper at runtime.

| Toolchain | Notes |
| --- | --- |
| **Visual Studio 2022** (recommended) | Install workload: **Desktop development with C++** |
| MinGW-w64 | `g++` must be in PATH |
| LLVM/Clang | `clang++` must be in PATH |

### 🚨 The #1 cause of "compile failed"

**VS Code is not a compiler.**

- VS Code = editor (no compiler)
- Visual Studio = IDE + MSVC compiler (when you install the C++ workload)

Recommended Visual Studio setup:
- Workload: **Desktop development with C++**
- Components: **MSVC v143** (x64/x86) and **Windows 10/11 SDK**

---

## ✨ What it does

| Before | After |
|:--:|:--:|
| 24 kHz | **48 kHz** |
| ~64 kbps | **400 kbps** |
| Mono | **True Stereo** |
| Fixed gain | **1x–10x adjustable** |

Supported clients:
- Discord Stable, Canary, PTB, Development
- BetterDiscord, Vencord, Equicord, BetterVencord, Lightcord

---

## 🖥️ Usage

### GUI

```powershell
.\Discord_voice_node_patcher.ps1
```

### CLI

```powershell
.\Discord_voice_node_patcher.ps1 -FixAll
.\Discord_voice_node_patcher.ps1 -FixClient "Canary"
.\Discord_voice_node_patcher.ps1 -AudioGainMultiplier 3
.\Discord_voice_node_patcher.ps1 -Restore
.\Discord_voice_node_patcher.ps1 -ListBackups
.\Discord_voice_node_patcher.ps1 -SkipUpdateCheck
```

---

## 🧠 How it works

1. Detect installed Discord clients.
2. Download known-compatible voice module backup files from GitHub.
3. Stop Discord processes.
4. Back up current `discord_voice.node` (unless skipped).
5. Replace voice module files with the compatible backup set.
6. Generate native C++ patcher sources from script config.
7. Compile and run the native patcher.
8. Apply all binary patches with bounds checks.
9. Verify bitrate bytes and integer values after patching.
10. Optionally relaunch Discord.

---

## 🔬 400kbps technical notes

Bitrate target:
- Decimal: `400000`
- Hex: `0x61A80`
- Little-endian bytes: `80 1A 06 00`

Primary bitrate patch bytes:
- 3-byte constant: `80 1A 06`
- 4-byte constant: `80 1A 06 00`
- 5-byte constant: `80 1A 06 00 00`

Bitrate-related offsets (Feb 9, 2026 build):

```text
0x53886A  EmulateBitrateModified           → 80 1A 06
0x53A691  SetsBitrateBitrateValue          → 80 1A 06 00 00
0x53A699  SetsBitrateBitwiseOr             → 90 90 90
0x53D750  DuplicateEmulateBitrateModified  → 80 1A 06
0x3A737E  EncoderConfigInit1               → 80 1A 06 00
0x3A6C87  EncoderConfigInit2               → 80 1A 06 00
```

---

## 🛡️ Safety checks

- File size gate (12 MB to 18 MB)
- Pre-patch byte validation across multiple code sections
- Already-patched detection with safe re-patch behavior
- Per-write bounds checks before every patch write
- Post-patch bitrate byte verification at all bitrate sites
- Post-patch integer readback verification (`400000` expected)
- Partial read/write detection during file IO

If validation fails, patching aborts without applying unsafe writes.

---

## 🧾 Logs, backups, and restore

Locations:
- Logs + temp: `%TEMP%\DiscordVoicePatcher\`
- Backups: `%TEMP%\DiscordVoicePatcher\Backups\`

View logs:

```powershell
notepad "$env:TEMP\DiscordVoicePatcher\patcher.log"
```

Restore:
- Use the GUI "Restore" button, or run with `-Restore`.

---

## 🔧 Troubleshooting

- "No compiler found"
  - Install Visual Studio with **Desktop development with C++**.
- "I have VS Code but it still says no compiler / compile failed"
  - Expected: VS Code does not include MSVC build tools.
  - Install Visual Studio (or Visual Studio Build Tools) with the C++ workload and Windows SDK.
- "Binary validation failed"
  - Your `discord_voice.node` does not match the expected Feb 2026 build.
- "Access denied" / cannot open file
  - Close Discord fully and run as Administrator.
- "No effect after patch"
  - Fully restart Discord.
- Distorted audio
  - Reduce gain to 1x or 2x.

---

## 📋 Changelog summary (v5.0)

- 400 kbps patching across all known bitrate paths
- Duplicate bitrate path patched
- Encoder config constructors patched for 400 kbps hot-start
- Updated offsets for the Feb 9, 2026 build
- Improved binary validation and patch safety checks

Releases:
- https://github.com/ProdHallow/Discord-Node-Patcher-Feb-9-2026/releases

---

## ⚖️ Disclaimer

Modifies Discord client files. Use at your own risk.
Re-run after Discord updates. Not affiliated with Discord Inc.
