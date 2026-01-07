<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import { browser } from '$app/environment';

  // Search and filter state
  let searchQuery = $state('');
  let filterType = $state<'all' | 'az'>('all');
  let selectedCategory = $state<string | null>(null);
  let isCategoryOpen = $state(false);
  
  // Editing state
  let editingId = $state<number | null>(null);
  let editForm = $state<Partial<typeof authStore.dictionary[0]>>({});

  // Dropdown ref for click outside
  let categoryDropdownRef: HTMLDivElement | undefined;

  // Autofocus action
  function autofocus(node: HTMLElement) {
    node.focus();
    return {};
  }

  // Click outside handler
  $effect(() => {
    if (!browser || !categoryDropdownRef) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef && !categoryDropdownRef.contains(event.target as Node)) {
        isCategoryOpen = false;
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  // Get unique categories
  const categories = $derived(() => Array.from(new Set(authStore.dictionary.map(term => term.tag))));

  // Filter dictionary
  const filteredDictionary = $derived(() => {
    const result = authStore.dictionary.filter(term => {
      const matchesSearch = term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             term.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? term.tag === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
    
    if (filterType === 'az') {
      return result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  });

  function handleAddTerm() {
    const newId = Date.now();
    const newTerm = {
      id: newId,
      title: 'Новый термин',
      tag: 'Общее',
      desc: 'Описание нового термина...',
      example: 'Пример использования термина.'
    };
    authStore.addDictionaryTerm(newTerm);
    searchQuery = '';
    filterType = 'all';
    selectedCategory = null;
    startEditing(newTerm);
  }

  function startEditing(term: typeof authStore.dictionary[0]) {
    editingId = term.id;
    editForm = term;
  }

  function cancelEditing() {
    editingId = null;
    editForm = {};
  }

  function saveEditing() {
    if (editingId && editForm.title) {
      const original = authStore.dictionary.find(d => d.id === editingId);
      if (original) {
        authStore.updateDictionaryTerm({ ...original, ...editForm });
      }
      editingId = null;
      editForm = {};
    }
  }

  function handleDelete(id: number) {
    if (confirm('Вы уверены, что хотите удалить этот термин?')) {
      authStore.deleteDictionaryTerm(id);
    }
  }

  function handleExport() {
    alert("Экспорт словаря начался...");
  }
</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div>
      <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Корпоративный словарь</h1>
      <p class="text-text-secondary text-sm max-w-2xl">Единая база терминов и определений для соблюдения Tone of Voice Альфа-Лизинг во всех каналах коммуникации.</p>
    </div>
    <div class="flex items-center space-x-3">
      <button 
        onclick={handleExport}
        class="bg-white dark:bg-surface-dark border border-gray-300 dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/5 text-text-main dark:text-gray-200 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center shadow-sm"
      >
        <span class="material-symbols-outlined text-lg mr-2">download</span>
        Экспорт
      </button>
      <button 
        onclick={handleAddTerm}
        class="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-md text-sm font-bold flex items-center shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
      >
        <span class="material-symbols-outlined text-xl mr-2">add</span>
        Добавить слово
      </button>
    </div>
  </div>

  <div class="bg-white dark:bg-surface-dark rounded-xl p-4 mb-8 border border-gray-200 dark:border-border-dark shadow-sm flex flex-col md:flex-row gap-4 sticky top-0 z-10">
    <div class="relative flex-1">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
      <input 
        class="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white placeholder-gray-400" 
        placeholder="Поиск термина или определения..." 
        type="text"
        bind:value={searchQuery}
      />
      {#if searchQuery}
        <button 
          onclick={() => searchQuery = ''}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title="Очистить поиск"
        >
          <span class="material-symbols-outlined text-xl block">close</span>
        </button>
      {/if}
    </div>
    <div class="flex gap-3 overflow-visible pb-1 md:pb-0 z-20">
      <button 
        onclick={() => filterType = filterType === 'az' ? 'all' : 'az'}
        class="flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap {filterType === 'az' ? 'bg-primary/10 border-primary/20 text-primary' : 'border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}"
      >
        <span class="material-symbols-outlined text-lg mr-2 text-gray-500">sort_by_alpha</span>
        А-Я
      </button>
      
      <div class="relative" bind:this={categoryDropdownRef}>
        <button 
          onclick={() => isCategoryOpen = !isCategoryOpen}
          class="flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap {selectedCategory ? 'bg-primary/10 border-primary/20 text-primary' : 'border-gray-200 dark:border-border-dark bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}"
        >
          <span class="material-symbols-outlined text-lg mr-2 {selectedCategory ? 'text-primary' : 'text-gray-500'}">category</span>
          {selectedCategory || 'Категория'}
          <span class="material-symbols-outlined text-xl ml-1 transition-transform {isCategoryOpen ? 'rotate-180' : ''}">arrow_drop_down</span>
        </button>

        {#if isCategoryOpen}
          <div class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-border-dark z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
            <div class="p-1.5 space-y-0.5">
              <button
                onclick={() => { selectedCategory = null; isCategoryOpen = false; }}
                class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center {!selectedCategory ? 'bg-primary/10 text-primary font-bold' : 'text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'}"
              >
                <span class="flex-1">Все категории</span>
                {#if !selectedCategory}
                  <span class="material-symbols-outlined text-lg">check</span>
                {/if}
              </button>
              <div class="h-px bg-gray-100 dark:bg-border-dark my-1"></div>
              {#each categories() as cat}
                <button
                  onclick={() => { selectedCategory = cat; isCategoryOpen = false; }}
                  class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center {selectedCategory === cat ? 'bg-primary/10 text-primary font-bold' : 'text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'}"
                >
                  <span class="flex-1">{cat}</span>
                  {#if selectedCategory === cat}
                    <span class="material-symbols-outlined text-lg">check</span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-6 pb-10">
    {#if filteredDictionary().length > 0}
      {#each filteredDictionary() as term (term.id)}
        {#if editingId === term.id}
          <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border-2 border-primary shadow-card dark:shadow-card-dark transition-all relative">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col md:flex-row justify-between gap-4">
                <input
                  class="flex-1 text-xl font-bold text-text-main dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none py-1 transition-colors"
                  bind:value={editForm.title}
                  placeholder="Термин"
                  use:autofocus
                />
                <input 
                  class="w-full md:w-48 text-xs font-bold uppercase tracking-wide bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded px-3 py-2 outline-none focus:border-primary transition-colors"
                  bind:value={editForm.tag}
                  placeholder="Категория"
                />
              </div>
              <textarea
                class="w-full text-gray-600 dark:text-gray-400 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg p-3 focus:border-primary outline-none resize-none transition-colors"
                bind:value={editForm.desc}
                placeholder="Описание"
                rows={3}
              ></textarea>
              <div class="bg-accent-red-light dark:bg-primary/5 rounded-lg p-3 border-l-4 border-primary">
                <input 
                  class="w-full text-sm text-gray-800 dark:text-gray-300 italic bg-transparent outline-none"
                  bind:value={editForm.example}
                  placeholder="Пример использования (без кавычек)"
                />
              </div>
              <div class="flex justify-end gap-3 mt-2">
                <button onclick={cancelEditing} class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">Отмена</button>
                <button onclick={saveEditing} class="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition-colors">Сохранить</button>
              </div>
            </div>
          </div>
        {:else}
          <div class="group bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark hover:border-primary/40 dark:hover:border-primary/40 shadow-sm dark:shadow-none hover:shadow-card dark:hover:shadow-card-dark transition-all relative">
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-3">
                <h3 class="text-xl font-bold text-text-main dark:text-white">{term.title}</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 tracking-wide border border-gray-200 dark:border-white/10">{term.tag}</span>
              </div>
              <div class="flex opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                <button 
                  onclick={() => startEditing(term)}
                  class="p-2 text-gray-400 hover:text-primary rounded-full transition-colors"
                  title="Редактировать"
                >
                  <span class="material-symbols-outlined text-xl">edit</span>
                </button>
                <button 
                  onclick={() => handleDelete(term.id)}
                  class="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                  title="Удалить"
                >
                  <span class="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{term.desc}</p>
            <div class="bg-accent-red-light dark:bg-primary/5 rounded-lg p-4 border-l-4 border-primary transition-colors">
              <p class="text-sm text-gray-800 dark:text-gray-300 italic">
                <span class="font-bold not-italic text-primary mr-1">Пример:</span>
                "{term.example}"
              </p>
            </div>
          </div>
        {/if}
      {/each}
    {:else}
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <span class="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
        <p class="text-lg font-medium text-text-main dark:text-white">Ничего не найдено</p>
        <p class="text-text-secondary dark:text-gray-400">Попробуйте изменить запрос или категорию</p>
      </div>
    {/if}
  </div>
</div>
