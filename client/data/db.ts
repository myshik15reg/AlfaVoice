
// Mock Database Structure

export interface User {
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  role: string;
  avatarUrl?: string;
  stats: {
    daysStreak: number;
    wordsWritten: number;
    speed: number;
  };
}

export interface Activity {
  id: number;
  time: string;
  text: string;
  duration: string;
  date: string;
  audioUrl?: string; // URL to the blob
  isTranscribing?: boolean; // Loading state
}

export interface Snippet {
  id: number;
  title: string;
  category: string;
  content: string;
  color: string;
  cmd: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  isFavorite: boolean;
}

export interface DictionaryTerm {
  id: number;
  title: string;
  tag: string;
  desc: string;
  example: string;
}

export interface NewsItem {
  id: number;
  title: string;
  time: string;
  read: boolean;
}

// Initial Data (Simulating DB records)
export const db = {
  user: {
    firstName: "Евгений",
    lastName: "Ковалев",
    initials: "ЕК",
    email: "e.kovalev@alfaleasing.ru",
    role: "Менеджер по продажам",
    stats: {
      daysStreak: 1,
      wordsWritten: 4017,
      speed: 97
    }
  } as User,

  activities: [
    { id: 1, time: "22:29", text: "А так работает.", duration: "0:06", date: "26 декабря 2025" },
    { id: 2, time: "22:29", text: "Работает или нет?", duration: "0:12", date: "26 декабря 2025" },
    { id: 3, time: "22:10", text: "И внимательно, внимательно разрабатывай, перепроверяй.", duration: "0:12", date: "26 декабря 2025" },
    { id: 4, time: "22:29", text: "Аудио без звука.", duration: "0:12", date: "26 декабря 2025" }
  ] as Activity[],

  snippets: [
    { id: 1, title: "Приветствие клиента", category: "Приветствия", content: "Здравствуйте! Меня зовут Евгений, я персональный менеджер компании Альфа-Лизинг. Благодарю вас за обращение...", color: "bg-primary", cmd: "/hello" },
    { id: 2, title: "Запрос документов", category: "Документы", content: "Для оформления договора лизинга, пожалуйста, пришлите сканы следующих документов: Устав (все страницы), Свидетельство о регистрации (ОГРН/ИНН)...", color: "bg-blue-500", cmd: "/docs_req" },
    { id: 3, title: "Одобрение заявки", category: "Продажи", content: "Рады сообщить, что ваша заявка на лизинг одобрена! Мы готовы перейти к этапу подписания договора. Вам будет удобно...", color: "bg-green-500", cmd: "/approve" },
    { id: 4, title: "Подпись (Стандарт)", category: "Закрытие", content: "С уважением, Команда Альфа-Лизинг. Тел: 8 (800) 123-45-67. alfaleasing.ru", color: "bg-gray-400", cmd: "/sig_std" },
    { id: 5, title: "Проблема решена", category: "Тех. поддержка", content: "Ваш запрос успешно обработан, проблема устранена. Пожалуйста, проверьте работу сервиса и подтвердите, что всё в порядке.", color: "bg-purple-500", cmd: "/solved" },
  ] as Snippet[],

  notes: [
    { id: 1, title: "Принципы Tone of Voice", content: "Наш стиль общения должен быть профессиональным, но дружелюбным...", date: "Только что", isFavorite: false },
    { id: 2, title: "Шаблон приветствия", content: "Добрый день, [Имя Клиента]! Меня зовут Евгений, я персональный менеджер...", date: "2 часа назад", isFavorite: false },
    { id: 3, title: "Список стоп-слов", content: "Слова, которые лучше исключить: 'Доброго времени суток', 'Заранее спасибо'...", date: "Вчера", isFavorite: true },
    { id: 4, title: "Идеи для блога", content: "1. Как ИИ помогает автоматизировать рутину в лизинге. 2. Топ-5 ошибок...", date: "24 дек 2025", isFavorite: false }
  ] as Note[],

  dictionary: [
    { id: 1, title: "Лизингополучатель", tag: "Юр. лица", desc: "Физическое или юридическое лицо, которое в соответствии с договором лизинга принимает предмет лизинга за определенную плату...", example: "Лизингополучатель обязуется своевременно вносить лизинговые платежи согласно графику." },
    { id: 2, title: "Аннуитетный платеж", tag: "Финансы", desc: "Схема погашения задолженности, при которой выплаты осуществляются равными суммами...", example: "Для вашего удобства мы сформировали график с аннуитетными платежами." },
    { id: 3, title: "Выкупная стоимость", tag: "Договор", desc: "Сумма, которую лизингополучатель должен уплатить лизингодателю по окончании срока лизинга...", example: "По завершении договора вам останется внести выкупную стоимость." }
  ] as DictionaryTerm[],

  news: [
    { id: 1, title: "Обновление политики конфиденциальности", time: "10 мин назад", read: false },
    { id: 2, title: "Новые функции в редакторе сниппетов", time: "1 час назад", read: false },
    { id: 3, title: "Технические работы 28 декабря", time: "3 часа назад", read: true },
    { id: 4, title: "Добро пожаловать в AlfaVoice 2.0", time: "Вчера", read: true },
    { id: 5, title: "Ваш отчет за неделю готов", time: "Вчера", read: true },
    { id: 6, title: "Совет дня: используйте горячие клавиши", time: "2 дня назад", read: true },
    { id: 7, title: "Обновление словаря терминов", time: "3 дня назад", read: true },
  ] as NewsItem[]
};
