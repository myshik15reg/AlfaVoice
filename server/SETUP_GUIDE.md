# AlfaVoice Server Setup Guide

## Overview

This guide explains how to set up and run the AlfaVoice server with Libtorch (PyTorch C++ library).

## Prerequisites

1. **Rust** - Install from https://rustup.rs/
2. **LLVM/Clang** - Install from https://releases.llvm.org/
   - Required for Rust bindgen
   - Default path: `C:\Program Files\LLVM\bin`
3. **CUDA 12.4** (optional, for GPU acceleration)
   - Install from https://developer.nvidia.com/cuda-downloads

## Setup Options

### Option 1: Manual Download (Recommended)

**Best for:** Most users, fastest setup

1. Download Libtorch manually:
   - Visit: https://pytorch.org/get-started/locally/
   - Select: Stable > Windows > Libtorch > C++ > CUDA 12.4
   - Download: `libtorch-win-shared-with-deps-2.5.1+cu124.zip` (~700MB)

2. Place the file in the `server/` directory:
   ```
   AlfaVoice/
   └── server/
       └── libtorch.zip
   ```

3. Run the setup script:
   ```cmd
   cd server
   setup_and_run.bat
   ```

The script will:
- Check if `libtorch.zip` exists
- Extract it to `server/libtorch/`
- Set environment variables
- Run `cargo run --features nlp`

### Option 2: vcpkg (Package Manager)

**Best for:** Developers who prefer package managers

1. Install vcpkg:
   ```cmd
   git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg
   C:\vcpkg\bootstrap-vcpkg.bat
   ```

2. Add vcpkg to PATH:
   ```cmd
   set PATH=C:\vcpkg;%PATH%
   ```

3. Run the vcpkg setup script:
   ```cmd
   cd server
   setup_and_run_vcpkg.bat
   ```

The script will:
- Install libtorch via vcpkg (30-60 minutes)
- Set environment variables
- Run `cargo run --features nlp`

### Option 3: Python Download (Experimental)

**Best for:** Users who want to try automatic download

Note: PyTorch servers often block automated downloads (403 Forbidden).

1. Ensure Python 3.8+ is installed:
   ```cmd
   python --version
   ```

2. Run the Python downloader:
   ```cmd
   cd server
   python download_libtorch.py
   ```

3. If successful, run the main script:
   ```cmd
   setup_and_run.bat
   ```

## Environment Variables

The scripts automatically set these variables:

- `LIBTORCH` - Path to Libtorch installation
- `LIBCLANG_PATH` - Path to LLVM bin directory
- `PATH` - Updated to include Libtorch and LLVM

## Troubleshooting

### Error: "LLVM not found"

Install LLVM from https://releases.llvm.org/ and ensure it's at:
```
C:\Program Files\LLVM\bin
```

### Error: "CUDA not found"

Either:
1. Install CUDA 12.4 from NVIDIA
2. Or use CPU-only Libtorch (change URL in download script)

### Error: "Libtorch not found"

Ensure:
1. `libtorch.zip` is in the `server/` directory
2. File size is ~700MB (not a few KB)
3. File name is exactly `libtorch.zip`

### Error: "cargo build failed"

Check:
1. Rust is installed: `rustc --version`
2. LLVM is installed and in PATH
3. Libtorch version matches Cargo.toml requirements

### Error: "Access Denied" (403)

This is expected when using automatic download. Use manual download (Option 1).

## Project Structure

```
AlfaVoice/
├── server/
│   ├── setup_and_run.bat          # Main setup script (manual download)
│   ├── setup_and_run_vcpkg.bat   # vcpkg setup script
│   ├── download_libtorch.py       # Python downloader (experimental)
│   ├── libtorch/                 # Created by setup script
│   ├── src/                      # Rust source code
│   └── Cargo.toml               # Rust dependencies
└── .kilocode/                  # Project documentation
```

## Quick Start

```cmd
# 1. Download Libtorch manually from PyTorch website
# 2. Place libtorch.zip in server/ directory
# 3. Run:
cd server
setup_and_run.bat
```

## Support

For issues:
1. Check this guide's troubleshooting section
2. Review `.kilocode/memory-bank/` for project context
3. Check Cargo.toml for exact dependency versions
