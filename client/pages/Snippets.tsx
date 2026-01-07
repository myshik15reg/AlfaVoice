import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Snippet } from '../data/db';

const Snippets: React.FC = () => {
  const { snippets, addSnippet, updateSnippet, deleteSnippet } = useAppContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Snippet>>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(snippets.map(s => s.category)));
    return ['Все', ...unique];
  }, [snippets]);

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(search.toLowerCase()) || 
                          snippet.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === 'Все' || snippet.category === category;

    return matchesSearch && matchesCategory;
  });

  const startEditing = (snippet: Snippet) => {
    setEditingId(snippet.id);
    setEditForm(snippet);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (editingId && editForm.title) {
        const original = snippets.find(s => s.id === editingId);
        if (original) {
            updateSnippet({ ...original, ...editForm } as Snippet);
        }
        setEditingId(null);
        setEditForm({});
    }
  };

  const handleDelete = (id: number) => {
    deleteSnippet(id);
    if (editingId === id) {
        setEditingId(null);
        setEditForm({});
    }
  };

  const handleCreateSnippet = () => {
    const newSnippet: Snippet = {
        id: Date.now(),
        title: 'Новый сниппет',
        category: 'Общее',
        content: 'Текст вашего нового сниппета...',
        color: 'bg-gray-400',
        cmd: '/new'
    };
    addSnippet(newSnippet);
    setSearch('');
    setCategory('Все');
    startEditing(newSnippet);
  };

  const handleResetFilters = () => {
    setCategory('Все');
    setSearch('');
  };

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Библиотека сниппетов</h1>
          <p className="text-text-secondary dark:text-gray-400 text-sm max-w-2xl">Управляйте часто используемыми текстовыми блоками для быстрой вставки в письма и чаты. Сохраняйте единый корпоративный стиль общения.</p>
        </div>
        <button 
            onClick={handleCreateSnippet}
            className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          <span className="font-bold text-sm">Создать сниппет</span>
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-6 border border-gray-200 dark:border-border-dark shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow placeholder-gray-400" 
            placeholder="Поиск сниппетов по названию или содержанию..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {(category !== 'Все' || search.length > 0) && (
            <button 
                onClick={handleResetFilters}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Сбросить фильтры"
            >
                <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto flex-1" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full md:w-auto flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-text-main dark:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-colors min-w-[200px]"
                >
                    <span className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-gray-400 text-xl">filter_list</span>
                        <span className="truncate">{category}</span>
                    </span>
                    <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                
                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-full md:w-64 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-border-dark z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setCategory(cat); setIsDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${category === cat ? 'bg-primary/5 text-primary font-bold' : 'text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                                <span className="truncate">{cat}</span>
                                {category === cat && <span className="material-symbols-outlined text-lg flex-shrink-0">check</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div 
            onClick={handleCreateSnippet}
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group h-64"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-2xl">add</span>
          </div>
          <h3 className="text-base font-bold text-text-main dark:text-white mb-1">Новый сниппет</h3>
          <p className="text-xs text-text-secondary dark:text-gray-500">Добавить часто используемую фразу</p>
        </div>

        {filteredSnippets.map((snippet) => (
          <React.Fragment key={snippet.id}>
          {editingId === snippet.id ? (
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border-2 border-primary shadow-card dark:shadow-card-dark transition-all relative flex flex-col h-64 z-10">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <input 
                        className="font-bold text-lg text-text-main dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none w-full"
                        value={editForm.title || ''}
                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                        placeholder="Название"
                        autoFocus
                    />
                    <input 
                        className="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none w-24 text-right"
                        value={editForm.category || ''}
                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                        placeholder="Категория"
                    />
                </div>
                <textarea 
                    className="flex-1 w-full resize-none text-sm text-text-secondary dark:text-gray-400 bg-transparent border border-gray-100 dark:border-gray-700 rounded-lg p-2 focus:border-primary outline-none"
                    value={editForm.content || ''}
                    onChange={e => setEditForm({...editForm, content: e.target.value})}
                    placeholder="Текст сниппета..."
                />
                <div className="mt-2 flex justify-between items-center pt-2">
                    <input 
                        className="text-xs text-gray-400 font-mono bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none w-20"
                        value={editForm.cmd || ''}
                        onChange={e => setEditForm({...editForm, cmd: e.target.value})}
                        placeholder="/cmd"
                    />
                    <div className="flex gap-2">
                        <button 
                            type="button"
                            onClick={() => handleDelete(snippet.id)} 
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" 
                            title="Удалить"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); saveEditing(); }} 
                            className="p-1.5 text-white bg-primary hover:bg-primary-hover rounded shadow-sm transition-colors" 
                            title="Сохранить"
                        >
                            <span className="material-symbols-outlined text-lg">check</span>
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); cancelEditing(); }} 
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors" 
                            title="Отмена"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-card transition-all cursor-pointer group flex flex-col h-64 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-8 ${snippet.color} rounded-full`}></span>
                    <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight">{snippet.title}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{snippet.category}</span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-primary transition-colors p-1">
                    <span className="material-symbols-outlined text-xl">star</span>
                </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed font-normal">
                {snippet.content}
                </p>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-surface-dark to-transparent"></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-mono">{snippet.cmd}</span>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-primary transition-colors" title="Копировать" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(snippet.content); }}>
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); startEditing(snippet); }} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-text-main dark:hover:text-white transition-colors" title="Редактировать">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                </div>
                </div>
            </div>
          )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-accent-red-light dark:bg-surface-dark rounded-xl p-8 border border-primary/10 dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">auto_fix_high</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-main dark:text-white">Нужна помощь с формулировками?</h3>
            <p className="text-sm text-text-secondary dark:text-gray-400">Используйте AlfaVoice AI для автоматического создания профессиональных ответов в корпоративном стиле.</p>
          </div>
        </div>
        <button className="whitespace-nowrap bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-text-main dark:text-white px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-bold shadow-sm transition-colors">
          Попробовать AI помощник
        </button>
      </div>
    </div>
  );
};

export default Snippets;