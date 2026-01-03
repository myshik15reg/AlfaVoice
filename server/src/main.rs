mod ws;
mod state;
mod whisper;
mod llm;
mod config;

#[cfg(feature = "nlp")]
mod nlp;

use axum::{
    extract::State,
    response::Json,
    routing::get,
    Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tracing::{info, error, warn};
use tracing_subscriber;
use rayon;

#[derive(serde::Serialize)]
struct HealthResponse {
    status: String,
    version: String,
}

/// Логирует характеристики системы
fn log_system_info() {
    info!("========================================");
    info!("AlfaVoice Server - System Information");
    info!("========================================");
    
    // CPU информация
    let available_threads = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);
    info!("Available CPU threads: {}", available_threads);
    info!("Physical CPU cores: {}", num_cpus::get_physical());
    info!("Logical CPU cores: {}", num_cpus::get());
    
    // GPU информация (если доступна через whisper-rs)
    #[cfg(feature = "cuda")]
    {
        info!("CUDA support: ENABLED");
    }
    #[cfg(not(feature = "cuda"))]
    {
        info!("CUDA support: DISABLED (CPU-only mode)");
    }
    
    // Память
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    let total_mem_mb = sys.total_memory() / 1024 / 1024;
    let available_mem_mb = sys.available_memory() / 1024 / 1024;
    info!("Total memory: {} MB", total_mem_mb);
    info!("Available memory: {} MB", available_mem_mb);
    
    // Рекомендации по конфигурации
    if total_mem_mb < 4096 {
        warn!("⚠️  Мало памяти (менее 4GB). Рекомендуется использовать модель small или base.");
    } else if total_mem_mb < 8192 {
        info!("Оптимально использовать модель medium или large-v3-q5_0.");
    } else {
        info!("Достаточно памяти для модели large-v3.");
    }
    
    info!("========================================");
}

/// Настраивает Rayon global thread pool для параллельных задач
///
/// Примечание: Whisper использует свою собственную систему потоков через n_threads.
/// Rayon предназначен для других параллельных задач (например, пакетная обработка).
fn setup_rayon_thread_pool() {
    let available_threads = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(4);
    
    // Используем 1/3 доступных потоков для Rayon (оставляем место для Whisper и Tokio)
    // Минимум 2 потока, максимум 8 для избежания oversubscription
    let rayon_threads = (available_threads / 3).clamp(2, 8);
    
    rayon::ThreadPoolBuilder::new()
        .num_threads(rayon_threads)
        .thread_name(|index| format!("rayon-worker-{}", index))
        .build_global()
        .expect("Failed to initialize Rayon thread pool");
    
    info!("Rayon thread pool initialized with {} threads", rayon_threads);
    info!("Thread distribution: Tokio (async), Whisper (n_threads), Rayon ({} threads)", rayon_threads);
}

/// Обработчик проверки здоровья сервера
async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tokio::main]
async fn main() {
    // Инициализируем логирование
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "alfavoice_server=debug,tower_http=debug,axum=debug".into()),
        )
        .init();

    // Логируем характеристики системы
    log_system_info();

    // Настраиваем Rayon global thread pool для Whisper
    setup_rayon_thread_pool();

    // Настраиваем пути к моделям
    let model_paths = config::ModelPaths::default();
    
    // Проверяем наличие моделей перед запуском
    info!("Проверка наличия моделей...");
    if let Err(e) = model_paths.check_models_exist() {
        error!("{}", e);
        error!("Сервер не может быть запущен без Whisper модели.");
        std::process::exit(1);
    }
    info!("Все необходимые модели найдены.");

    // Настраиваем конфигурацию инференса Whisper
    // Используем дефолтные настройки (оптимальный баланс скорость/качество)
    let whisper_config = config::WhisperConfig::default();
    info!("Whisper конфигурация: threads={}, beam_size={}, beam_search={}",
        whisper_config.n_threads, whisper_config.beam_size, whisper_config.use_beam_search);

    // Загружаем Whisper модель
    let whisper_model = match whisper::WhisperModel::load(&model_paths.whisper_model, Some(whisper_config)) {
        Ok(model) => {
            info!("Whisper модель успешно загружена из {}", model_paths.whisper_model);
            Some(Arc::new(model))
        }
        Err(e) => {
            error!("Не удалось загрузить Whisper модель: {}", e);
            error!("Сервер не может работать без транскрипции.");
            std::process::exit(1);
        }
    };

    // Загружаем LLM модель для постобработки
    let llm_model_path = model_paths.llm_model.as_deref();
    let llm_model = match llm::LlmModel::new(llm_model_path, true) {
        Ok(model) => {
            if model.is_enabled() {
                info!("LLM модель для постобработки загружена");
            } else {
                info!("LLM постобработка отключена");
            }
            Arc::new(model)
        }
        Err(e) => {
            warn!("Не удалось инициализировать LLM модель: {}", e);
            warn!("Сервер будет работать без постобработки");
            Arc::new(llm::LlmModel::default())
        }
    };

    // Загружаем BERT модель для NLP (если включен feature nlp)
    #[cfg(feature = "nlp")]
    let bert_model = {
        let bert_config = nlp::BertConfig::default();
        let mut model = nlp::BertModel::new(bert_config);
        
        match model.initialize() {
            Ok(_) => {
                info!("BERT модель успешно загружена");
                Some(Arc::new(model))
            }
            Err(e) => {
                warn!("Не удалось инициализировать BERT модель: {}", e);
                warn!("Сервер будет работать без BERT постобработки");
                None
            }
        }
    };

    // Создаём состояние приложения
    #[cfg(feature = "nlp")]
    let app_state = Arc::new(state::AppState::with_all_models(whisper_model, llm_model, bert_model));
    
    #[cfg(not(feature = "nlp"))]
    let app_state = Arc::new(state::AppState::with_models(whisper_model, llm_model));

    // Создаем роутер
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/ws", get(ws::websocket_handler))
        .layer(CorsLayer::permissive())
        .with_state(app_state);

    // Запускаем сервер
    let addr = SocketAddr::from(([127, 0, 0, 1], 8081));
    let listener = TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    info!("AlfaVoice Server listening on {}", addr);
    info!("WebSocket endpoint: ws://{}", addr);

    if let Err(e) = axum::serve(listener, app).await {
        error!("Server error: {}", e);
    }
}
