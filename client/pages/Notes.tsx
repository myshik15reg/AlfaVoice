import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Note } from '../data/db';

const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'favorite' | 'archive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Note>>({});

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'favorite') return note.isFavorite;
    if (filter === 'archive') return false; 
    return true; 
  });

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditForm(note);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (editingId && editForm.title) {
        const original = notes.find(n => n.id === editingId);
        if (original) {
            updateNote({ ...original, ...editForm } as Note);
        }
        setEditingId(null);
        setEditForm({});
    }
  };

  const handleDelete = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    deleteNote(id);
    if (editingId === id) cancelEditing();
  };

  const handleToggleFavorite = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    updateNote({ ...note, isFavorite: !note.isFavorite });
  };

  const handleCreateNote = () => {
    const newNote: Note = {
        id: Date.now(),
        title: 'Новая заметка',
        content: 'Текст новой заметки...',
        date: 'Только что',
        isFavorite: false
    };
    addNote(newNote);
    // Start editing the new note immediately
    startEditing(newNote);
    // Switch to 'all' filter if we are in 'favorite' to see the new note (it's not favorite by default)
    if (filter === 'favorite') setFilter('all');
  };

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-1">Заметки</h1>
          <p className="text-text-secondary text-sm">Управляйте черновиками и идеями для контента.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
            </div>
            <input 
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-border-dark rounded-md leading-5 bg-white dark:bg-surface-dark placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm dark:text-white transition-all shadow-sm" 
                placeholder="Поиск заметок..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  title="Очистить поиск"
              >
                  <span className="material-symbols-outlined text-lg block">close</span>
              </button>
            )}
          </div>
          <button 
            onClick={handleCreateNote}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined mr-2 text-xl">add</span>
            Создать заметку
          </button>
        </div>
      </div>

      <div className="flex space-x-6 border-b border-gray-200 dark:border-border-dark mb-8">
        <button 
            onClick={() => setFilter('all')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${filter === 'all' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-text-main dark:hover:text-gray-200'}`}
        >
            Все заметки
        </button>
        <button 
            onClick={() => setFilter('favorite')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${filter === 'favorite' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-text-main dark:hover:text-gray-200'}`}
        >
            Избранное
        </button>
        <button 
            onClick={() => setFilter('archive')}
            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${filter === 'archive' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-text-main dark:hover:text-gray-200'}`}
        >
            Архив
        </button>
      </div>

      {filteredNotes.length > 0 || filter === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <React.Fragment key={note.id}>
              {editingId === note.id ? (
                <div className="bg-white dark:bg-surface-dark rounded-lg border-2 border-primary shadow-card dark:shadow-card-dark p-6 flex flex-col h-64 relative z-10">
                   <input 
                      className="text-lg font-bold text-text-main dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none w-full mb-3"
                      value={editForm.title || ''}
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      placeholder="Заголовок"
                      autoFocus
                  />
                  <textarea 
                      className="flex-1 w-full resize-none text-sm text-text-secondary dark:text-gray-300 bg-transparent border border-gray-100 dark:border-gray-700 rounded-lg p-2 focus:border-primary outline-none"
                      value={editForm.content || ''}
                      onChange={e => setEditForm({...editForm, content: e.target.value})}
                      placeholder="Текст заметки..."
                  />
                  <div className="flex justify-between items-center pt-3 mt-auto">
                    <span className="text-xs text-gray-400">Редактирование</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleDelete(note.id)} 
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" 
                            title="Удалить"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                        <button 
                            onClick={saveEditing} 
                            className="p-1.5 text-white bg-primary hover:bg-primary-hover rounded shadow-sm transition-colors" 
                            title="Сохранить"
                        >
                            <span className="material-symbols-outlined text-lg">check</span>
                        </button>
                        <button 
                            onClick={cancelEditing} 
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors" 
                            title="Отмена"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                    onClick={() => startEditing(note)}
                    className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-64 relative cursor-pointer hover:border-primary/30 dark:hover:border-primary/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-text-main dark:text-white line-clamp-1 pr-4">{note.title}</h3>
                    <button 
                        onClick={(e) => handleToggleFavorite(note, e)}
                        className={`text-gray-300 hover:text-primary transition-colors ${note.isFavorite ? 'text-primary' : ''}`}
                    >
                      <span className={`material-symbols-outlined text-xl ${note.isFavorite ? 'filled' : ''}`}>star</span>
                    </button>
                  </div>
                  <p className="text-text-secondary dark:text-gray-300 text-sm mb-4 line-clamp-5 flex-grow leading-relaxed">
                    {note.content}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-border-dark mt-auto">
                    <span className="text-xs text-gray-400 font-medium">{note.date}</span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEditing(note); }}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
          
          <button 
            onClick={handleCreateNote}
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-red-50 dark:hover:bg-gray-800/50 dark:hover:border-primary transition-all group h-64"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-gray-400 group-hover:text-white text-2xl">add</span>
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary">Новая заметка</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">folder_open</span>
            <p className="text-gray-500 dark:text-gray-400">В этом разделе пока нет заметок</p>
        </div>
      )}
    </div>
  );
};

export default Notes;