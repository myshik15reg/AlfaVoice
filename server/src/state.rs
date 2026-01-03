use std::sync::Arc;
use tokio::sync::RwLock;

use crate::whisper::WhisperModel;
use crate::llm::LlmModel;

#[cfg(feature = "nlp")]
use crate::nlp::BertModel;

/// Общее состояние приложения
#[derive(Clone)]
pub struct AppState {
    pub clients: Arc<RwLock<Vec<ClientInfo>>>,
    pub whisper_model: Option<Arc<WhisperModel>>,
    pub llm_model: Arc<LlmModel>,
    #[cfg(feature = "nlp")]
    pub bert_model: Option<Arc<BertModel>>,
}

/// Информация о подключенном клиенте
#[derive(Debug, Clone)]
pub struct ClientInfo {
    pub id: String,
    pub connected_at: chrono::DateTime<chrono::Utc>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            clients: Arc::new(RwLock::new(Vec::new())),
            whisper_model: None,
            llm_model: Arc::new(LlmModel::default()),
            #[cfg(feature = "nlp")]
            bert_model: None,
        }
    }

    pub fn with_whisper_model(whisper_model: Arc<WhisperModel>) -> Self {
        Self {
            clients: Arc::new(RwLock::new(Vec::new())),
            whisper_model: Some(whisper_model),
            llm_model: Arc::new(LlmModel::default()),
            #[cfg(feature = "nlp")]
            bert_model: None,
        }
    }

    pub fn with_llm_model(llm_model: Arc<LlmModel>) -> Self {
        Self {
            clients: Arc::new(RwLock::new(Vec::new())),
            whisper_model: None,
            llm_model,
            #[cfg(feature = "nlp")]
            bert_model: None,
        }
    }

    pub fn with_models(whisper_model: Option<Arc<WhisperModel>>, llm_model: Arc<LlmModel>) -> Self {
        Self {
            clients: Arc::new(RwLock::new(Vec::new())),
            whisper_model,
            llm_model,
            #[cfg(feature = "nlp")]
            bert_model: None,
        }
    }

    #[cfg(feature = "nlp")]
    pub fn with_bert_model(bert_model: Arc<BertModel>) -> Self {
        Self {
            clients: Arc::new(RwLock::new(Vec::new())),
            whisper_model: None,
            llm_model: Arc::new(LlmModel::default()),
            bert_model: Some(bert_model),
        }
    }

    #[cfg(feature = "nlp")]
    pub fn with_all_models(
        whisper_model: Option<Arc<WhisperModel>>,
        llm_model: Arc<LlmModel>,
        bert_model: Option<Arc<BertModel>>,
    ) -> Self {
        Self {
            clients: Arc::new(RwLock::new(Vec::new())),
            whisper_model,
            llm_model,
            bert_model,
        }
    }

    /// Добавляет клиента в список
    pub async fn add_client(&self, client_id: String) {
        let mut clients = self.clients.write().await;
        clients.push(ClientInfo {
            id: client_id,
            connected_at: chrono::Utc::now(),
        });
    }

    /// Удаляет клиента из списка
    pub async fn remove_client(&self, client_id: &str) {
        let mut clients = self.clients.write().await;
        clients.retain(|c| c.id != client_id);
    }

    /// Возвращает количество подключенных клиентов
    pub async fn client_count(&self) -> usize {
        self.clients.read().await.len()
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
