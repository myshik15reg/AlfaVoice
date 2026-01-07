<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';

  let filter = $state<'all' | 'favorite' | 'archive'>('all');
  let searchQuery = $state('');

  // Editing state
  let editingId = $state<number | null>(null);
  let editForm = $state<Partial<typeof authStore.notes[0]>>({});

  // Autofocus action
  function autofocus(node: HTMLElement) {
    node.focus();
    return {};
  }

  // Filter notes
  const filteredNotes = $derived(() => {
    return authStore.notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            note.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filter === 'favorite') return note.isFavorite;
      if (filter === 'archive') return false; 
      return true; 
    });
  });

  function startEditing(note: typeof authStore.notes[0]) {
    editingId = note.id;
    editForm = note;
  }

  function cancelEditing() {
    editingId = null;
    editForm = {};
  }

  function saveEditing() {
    if (editingId && editForm.title) {
      const original = authStore.notes.find(n => n.id === editingId);
      if (original) {
        authStore.updateNote({ ...original, ...editForm });
      }
      editingId = null;
      editForm = {};
    }
  }

  function handleDelete(id: number) {
    authStore.deleteNote(id);
    if (editingId === id) cancelEditing();
  }

  function handleToggleFavorite(note: typeof authStore.notes[0]) {
    authStore.updateNote({ ...note, isFavorite: !note.isFavorite });
  }

  function handleCreateNote() {
    const newNote = {
      id: Date.now(),
      title: 'Новая заметка',
      content: 'Текст новой заметки...',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: 'Только что',
      isFavorite: false
    };
    authStore.addNote(newNote);
    // Start editing new note immediately
    startEditing(newNote);
    // Switch to 'all' filter if we are in 'favorite' to see new note (it's not favorite by default)
    if (filter === 'favorite') filter = 'all';
  }
</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
    <div>
      <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-1">Заметки</h1>
      <p class="text-text-secondary text-sm">Управляйте черновиками и идеями для контента.</p>
    </div>
    <div class="flex items-center gap-4 w-full md:w-auto">
      <div class="relative group w-full md:w-72">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
        </div>
        <input 
          class="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-border-dark rounded-md leading-5 bg-white dark:bg-surface-dark placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm dark:text-white transition-all shadow-sm" 
          placeholder="Поиск заметок..." 
          type="text"
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button 
            onclick={() => searchQuery = ''}
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            title="Очистить поиск"
          >
            <span class="material-symbols-outlined text-lg block">close</span>
          </button>
        {/if}
      </div>
      <button 
        onclick={handleCreateNote}
        class="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
      >
        <span class="material-symbols-outlined mr-2 text-xl">add</span>
        Создать заметку
      </button>
    </div>
  </div>

  <div class="flex space-x-6 border-b border-gray-200 dark:border-border-dark mb-8">
    <button 
      onclick={() => filter = 'all'}
      class="pb-3 border-b-2 font-medium text-sm transition-colors {filter === 'all' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-text-main dark:hover:text-gray-200'}"
    >
      Все заметки
    </button>
    <button 
      onclick={() => filter = 'favorite'}
      class="pb-3 border-b-2 font-medium text-sm transition-colors {filter === 'favorite' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-text-main dark:hover:text-gray-200'}"
    >
      Избранное
    </button>
    <button 
      onclick={() => filter = 'archive'}
      class="pb-3 border-b-2 font-medium text-sm transition-colors {filter === 'archive' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-text-main dark:hover:text-gray-200'}"
    >
      Архив
    </button>
  </div>

  {#if filteredNotes().length > 0 || filter === 'all'}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {#each filteredNotes() as note (note.id)}
        {#if editingId === note.id}
          <div class="bg-white dark:bg-surface-dark rounded-lg border-2 border-primary shadow-card dark:shadow-card-dark p-6 flex flex-col h-64 relative z-10">
            <input
              class="text-lg font-bold text-text-main dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none w-full mb-3"
              bind:value={editForm.title}
              placeholder="Заголовок"
              use:autofocus
            />
            <textarea
              class="flex-1 w-full resize-none text-sm text-text-secondary dark:text-gray-300 bg-transparent border border-gray-100 dark:border-gray-700 rounded-lg p-2 focus:border-primary outline-none"
              bind:value={editForm.content}
              placeholder="Текст заметки..."
            ></textarea>
            <div class="flex justify-between items-center pt-3 mt-auto">
              <span class="text-xs text-gray-400">Редактирование</span>
              <div class="flex gap-2">
                <button 
                  onclick={() => handleDelete(note.id)} 
                  class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" 
                  title="Удалить"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
                <button 
                  onclick={saveEditing} 
                  class="p-1.5 text-white bg-primary hover:bg-primary-hover rounded shadow-sm transition-colors" 
                  title="Сохранить"
                >
                  <span class="material-symbols-outlined text-lg">check</span>
                </button>
                <button 
                  onclick={cancelEditing} 
                  class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors" 
                  title="Отмена"
                >
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
          </div>
        {:else}
          <div
            onclick={() => startEditing(note)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEditing(note); } }}
            role="button"
            tabindex="0"
            class="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-64 relative cursor-pointer hover:border-primary/30 dark:hover:border-primary/30"
          >
            <div class="flex justify-between items-start mb-3">
              <h3 class="text-lg font-bold text-text-main dark:text-white line-clamp-1 pr-4">{note.title}</h3>
              <button 
                onclick={(e) => { e.stopPropagation(); handleToggleFavorite(note); }}
                class="text-gray-300 hover:text-primary transition-colors {note.isFavorite ? 'text-primary' : ''}"
              >
                <span class="material-symbols-outlined text-xl {note.isFavorite ? 'filled' : ''}">star</span>
              </button>
            </div>
            <p class="text-text-secondary dark:text-gray-300 text-sm mb-4 line-clamp-5 flex-grow leading-relaxed">
              {note.content}
            </p>
            <div class="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-border-dark mt-auto">
              <span class="text-xs text-gray-400 font-medium">{note.date}</span>
              <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onclick={(e) => { e.stopPropagation(); startEditing(note); }}
                  class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button 
                  onclick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                  class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        {/if}
      {/each}
      
      <button 
        onclick={handleCreateNote}
        class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-red-50 dark:hover:bg-gray-800/50 dark:hover:border-primary transition-all group h-64"
      >
        <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
          <span class="material-symbols-outlined text-gray-400 group-hover:text-white text-2xl">add</span>
        </div>
        <span class="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary">Новая заметка</span>
      </button>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center h-64 text-center">
      <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">folder_open</span>
      <p class="text-gray-500 dark:text-gray-400">В этом разделе пока нет заметок</p>
    </div>
  {/if}
</div>
