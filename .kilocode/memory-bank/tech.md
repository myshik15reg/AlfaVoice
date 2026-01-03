# Tech Stack: AlfaVoice

## Backend (Server)
-   **Language**: Rust 1.78+
-   **Web Framework**: Axum
-   **AI Inference**:
    -   `whisper-rs` (или bindings к whisper.cpp)
    -   `rust-bert` (на базе `tch-rs` / Libtorch) для NLP задач
-   **Database**: PostgreSQL 15+ (sqlx)
-   **Logging**: Tracing
-   **Optimization**: AVX-512, AMX (Intel MKL/OneDNN)

## Frontend (Client)
-   **Framework**: Tauri 1.5+ (Rust core)
-   **UI Library**: SvelteKit (Svelte 4)
-   **Styling**: Tailwind CSS
-   **State Management**: Svelte Stores
-   **Local DB**: SQLite (rusqlite + sqlcipher)

## Models
-   **ASR**: Whisper `large-v3` (quantized Q5_K_M)
-   **NLP**:
    -   `DeepPavlov/rubert-base-cased` (для исправления текста и классификации)
    -   `ai-forever/rugpt3small_based_on_gpt2` (опционально, для генерации ответов)

## DevOps & Tools
-   **Build**: Cargo, NPM
-   **CI/CD**: GitHub Actions / GitLab CI
-   **Monitoring**: Prometheus, Grafana
-   **Containerization**: Docker (для сервера)

## Требования к среде
-   **Server**: Windows/Linux с поддержкой CUDA (NVIDIA GPU, например RTX 3060 Ti / A16).
-   **Client**: Windows 10/11, macOS 12+, Linux.