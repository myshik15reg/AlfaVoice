import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { DictionaryTerm } from '../data/db';

const Dictionary: React.FC = () => {
  const { dictionary, addDictionaryTerm, updateDictionaryTerm, deleteDictionaryTerm } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'az'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<DictionaryTerm>>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get unique categories from the dictionary
  const categories = Array.from(new Set(dictionary.map(term => term.tag)));

  const filteredDictionary = dictionary.filter(term => {
      const matchesSearch = term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             term.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? term.tag === selectedCategory : true;
      return matchesSearch && matchesCategory;
  }).sort((a, b) => {
      if (filterType === 'az') {
          return a.title.localeCompare(b.title);
      }
      return 0; // Default order
  });

  const handleAddTerm = () => {
      const newId = Date.now();
      const newTerm: DictionaryTerm = {
          id: newId,
          title: 'Новый термин',
          tag: 'Общее',
          desc: 'Описание нового термина...',
          example: 'Пример использования термина.'
      };
      addDictionaryTerm(newTerm);
      // Reset filters and start editing immediately
      setSearchQuery('');
      setFilterType('all');
      setSelectedCategory(null);
      startEditing(newTerm);
  };

  const startEditing = (term: DictionaryTerm) => {
    setEditingId(term.id);
    setEditForm(term);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (editingId && editForm.title) {
        const original = dictionary.find(d => d.id === editingId);
        if (original) {
            updateDictionaryTerm({ ...original, ...editForm } as DictionaryTerm);
        }
        setEditingId(null);
        setEditForm({});
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот термин?')) {
        deleteDictionaryTerm(id);
    }
  };

  const handleExport = () => {
      alert("Экспорт словаря начался...");
  };

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Корпоративный словарь</h1>
          <p className="text-text-secondary text-sm max-w-2xl">Единая база терминов и определений для соблюдения Tone of Voice Альфа-Лизинг во всех каналах коммуникации.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5 text-text-main dark:text-gray-200 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm"
          >
            <span className="material-symbols-outlined text-lg mr-2">download</span>
            Экспорт
          </button>
          <button 
            onClick={handleAddTerm}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-xl mr-2">add</span>
            Добавить слово
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-8 border border-gray-200 dark:border-border-dark shadow-sm flex flex-col md:flex-row gap-4 sticky top-0 z-10">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white placeholder-gray-400" 
            placeholder="Поиск термина или определения..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Очистить поиск"
            >
                <span className="material-symbols-outlined text-xl block">close</span>
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-visible pb-1 md:pb-0 z-20">
          <button 
            onClick={() => setFilterType(filterType === 'az' ? 'all' : 'az')}
            className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterType === 'az' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined text-lg mr-2 text-gray-500">sort_by_alpha</span>
            А-Я
          </button>
          
          <div className="relative" ref={categoryDropdownRef}>
            <button 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory ? 'bg-primary/10 border-primary/20 text-primary' : 'border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
                <span className={`material-symbols-outlined text-lg mr-2 ${selectedCategory ? 'text-primary' : 'text-gray-500'}`}>category</span>
                {selectedCategory || 'Категория'}
                <span className={`material-symbols-outlined text-xl ml-1 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}>arrow_drop_down</span>
            </button>

            {isCategoryOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-border-dark z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <div className="p-1.5 space-y-0.5">
                        <button
                            onClick={() => { setSelectedCategory(null); setIsCategoryOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${!selectedCategory ? 'bg-primary/10 text-primary font-bold' : 'text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                            <span className="flex-1">Все категории</span>
                            {!selectedCategory && <span className="material-symbols-outlined text-lg">check</span>}
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-border-dark my-1"></div>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center ${selectedCategory === cat ? 'bg-primary/10 text-primary font-bold' : 'text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                                <span className="flex-1">{cat}</span>
                                {selectedCategory === cat && <span className="material-symbols-outlined text-lg">check</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-10">
        {filteredDictionary.length > 0 ? (
          filteredDictionary.map((term) => (
            <React.Fragment key={term.id}>
            {editingId === term.id ? (
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border-2 border-primary shadow-card dark:shadow-card-dark transition-all relative">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <input 
                                className="flex-1 text-xl font-bold text-text-main dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none py-1 transition-colors"
                                value={editForm.title || ''}
                                onChange={e => setEditForm({...editForm, title: e.target.value})}
                                placeholder="Термин"
                                autoFocus
                            />
                            <input 
                                className="w-full md:w-48 text-xs font-bold uppercase tracking-wide bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded px-3 py-2 outline-none focus:border-primary transition-colors"
                                value={editForm.tag || ''}
                                onChange={e => setEditForm({...editForm, tag: e.target.value})}
                                placeholder="Категория"
                            />
                        </div>
                        <textarea 
                            className="w-full text-gray-600 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:border-primary outline-none resize-none transition-colors"
                            value={editForm.desc || ''}
                            onChange={e => setEditForm({...editForm, desc: e.target.value})}
                            placeholder="Описание"
                            rows={3}
                        />
                        <div className="bg-accent-red-light dark:bg-primary/5 rounded-lg p-3 border-l-4 border-primary">
                            <input 
                                className="w-full text-sm text-gray-800 dark:text-gray-300 italic bg-transparent outline-none"
                                value={editForm.example || ''}
                                onChange={e => setEditForm({...editForm, example: e.target.value})}
                                placeholder="Пример использования (без кавычек)"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-2">
                             <button onClick={cancelEditing} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">Отмена</button>
                             <button onClick={saveEditing} className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition-colors">Сохранить</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="group bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark hover:border-primary/40 dark:hover:border-primary/40 shadow-sm dark:shadow-none hover:shadow-card dark:hover:shadow-card-dark transition-all relative">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-text-main dark:text-white">{term.title}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 tracking-wide border border-gray-200 dark:border-white/10">{term.tag}</span>
                        </div>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                            <button 
                                onClick={() => startEditing(term)}
                                className="p-2 text-gray-400 hover:text-primary rounded-full transition-colors"
                                title="Редактировать"
                            >
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button 
                                onClick={() => handleDelete(term.id)}
                                className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                title="Удалить"
                            >
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{term.desc}</p>
                    <div className="bg-accent-red-light dark:bg-primary/5 rounded-lg p-4 border-l-4 border-primary transition-colors">
                        <p className="text-sm text-gray-800 dark:text-gray-300 italic">
                        <span className="font-bold not-italic text-primary mr-1">Пример:</span>
                        "{term.example}"
                        </p>
                    </div>
                </div>
            )}
            </React.Fragment>
          ))
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
                <p className="text-lg font-medium text-text-main dark:text-white">Ничего не найдено</p>
                <p className="text-text-secondary dark:text-gray-400">Попробуйте изменить запрос или категорию</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dictionary;