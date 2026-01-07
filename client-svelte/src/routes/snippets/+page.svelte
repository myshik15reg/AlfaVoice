<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import { browser } from '$app/environment';

  let search = $state('');
  let category = $state('Все');
  let isDropdownOpen = $state(false);
  let dropdownRef: HTMLDivElement | undefined;

  // Editing state
  let editingId = $state<number | null>(null);
  let editForm = $state<Partial<typeof authStore.snippets[0]>>({});

  // Autofocus action
  function autofocus(node: HTMLElement) {
    node.focus();
    return {};
  }

  // Click outside handler
  $effect(() => {
    if (!browser || !dropdownRef) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        isDropdownOpen = false;
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  // Categories
  const categories = $derived(() => {
    const unique = Array.from(new Set(authStore.snippets.map(s => s.category)));
    return ['Все', ...unique];
  });

  // Filter snippets
  const filteredSnippets = $derived(() => {
    return authStore.snippets.filter(snippet => {
      const matchesSearch = snippet.title.toLowerCase().includes(search.toLowerCase()) || 
                            snippet.content.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = category === 'Все' || snippet.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  function startEditing(snippet: typeof authStore.snippets[0]) {
    editingId = snippet.id;
    editForm = snippet;
  }

  function cancelEditing() {
    editingId = null;
    editForm = {};
  }

  function saveEditing() {
    if (editingId && editForm.title) {
      const original = authStore.snippets.find(s => s.id === editingId);
      if (original) {
        authStore.updateSnippet({ ...original, ...editForm });
      }
      editingId = null;
      editForm = {};
    }
  }

  function handleDelete(id: number) {
    authStore.deleteSnippet(id);
    if (editingId === id) {
      editingId = null;
      editForm = {};
    }
  }

  function handleCreateSnippet() {
    const newSnippet = {
      id: Date.now(),
      title: 'Новый сниппет',
      category: 'Общее',
      content: 'Текст вашего нового сниппета...',
      tags: [],
      color: 'bg-gray-400',
      cmd: '/new',
      createdAt: new Date().toISOString()
    };
    authStore.addSnippet(newSnippet);
    search = '';
    category = 'Все';
    startEditing(newSnippet);
  }

  function handleResetFilters() {
    category = 'Все';
    search = '';
  }
</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div>
      <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Библиотека сниппетов</h1>
      <p class="text-text-secondary dark:text-gray-400 text-sm max-w-2xl">Управляйте часто используемыми текстовыми блоками для быстрой вставки в письма и чаты. Сохраняйте единый корпоративный стиль общения.</p>
    </div>
    <button 
      onclick={handleCreateSnippet}
      class="flex items-center justify-center space-x-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
    >
      <span class="material-symbols-outlined text-xl">add</span>
      <span class="font-bold text-sm">Создать сниппет</span>
    </button>
  </div>

  <div class="bg-white dark:bg-surface-dark rounded-xl p-4 mb-6 border border-gray-200 dark:border-border-dark shadow-sm flex flex-col md:flex-row gap-4 items-center">
    <div class="relative flex-1 w-full">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
      <input 
        class="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow placeholder-gray-400" 
        placeholder="Поиск сниппетов по названию или содержанию..." 
        type="text"
        bind:value={search}
      />
      {#if category !== 'Все' || search.length > 0}
        <button
          onclick={handleResetFilters}
          class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title="Сбросить фильтры"
        >
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
      {/if}
    </div>
    
    <div class="flex items-center gap-3 w-full md:w-auto">
      <div class="relative w-full md:w-auto flex-1" bind:this={dropdownRef}>
        <button 
          onclick={() => isDropdownOpen = !isDropdownOpen}
          class="w-full md:w-auto flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-lg text-sm text-text-main dark:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-colors min-w-[200px]"
        >
          <span class="flex items-center gap-2 truncate">
            <span class="material-symbols-outlined text-gray-400 text-xl">filter_list</span>
            <span class="truncate">{category}</span>
          </span>
          <span class="material-symbols-outlined text-gray-400 transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}">expand_more</span>
        </button>
        
        {#if isDropdownOpen}
          <div class="absolute right-0 top-full mt-2 w-full md:w-64 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-border-dark z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
            {#each categories() as cat}
              <button
                onclick={() => { category = cat; isDropdownOpen = false; }}
                class="w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between {category === cat ? 'bg-primary/5 text-primary font-bold' : 'text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'}"
              >
                <span class="truncate">{cat}</span>
                {#if category === cat}
                  <span class="material-symbols-outlined text-lg flex-shrink-0">check</span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <div
      onclick={handleCreateSnippet}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCreateSnippet(); } }}
      role="button"
      tabindex="0"
      class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group h-64"
    >
      <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
        <span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-2xl">add</span>
      </div>
      <h3 class="text-base font-bold text-text-main dark:text-white mb-1">Новый сниппет</h3>
      <p class="text-xs text-text-secondary dark:text-gray-500">Добавить часто используемую фразу</p>
    </div>

    {#each filteredSnippets() as snippet (snippet.id)}
      {#if editingId === snippet.id}
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border-2 border-primary shadow-card dark:shadow-card-dark transition-all relative flex flex-col h-64 z-10">
          <div class="flex justify-between items-start mb-2 gap-2">
            <input
              class="font-bold text-lg text-text-main dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none w-full"
              bind:value={editForm.title}
              placeholder="Название"
              use:autofocus
            />
            <input 
              class="text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none w-24 text-right"
              bind:value={editForm.category}
              placeholder="Категория"
            />
          </div>
          <textarea
            class="flex-1 w-full resize-none text-sm text-text-secondary dark:text-gray-400 bg-transparent border border-gray-100 dark:border-gray-700 rounded-lg p-2 focus:border-primary outline-none"
            bind:value={editForm.content}
            placeholder="Текст сниппета..."
          ></textarea>
          <div class="mt-2 flex justify-between items-center pt-2">
            <input 
              class="text-xs text-gray-400 font-mono bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary outline-none w-20"
              bind:value={editForm.cmd}
              placeholder="/cmd"
            />
            <div class="flex gap-2">
              <button 
                type="button"
                onclick={() => handleDelete(snippet.id)} 
                class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" 
                title="Удалить"
              >
                <span class="material-symbols-outlined text-lg">delete</span>
              </button>
              <button 
                type="button"
                onclick={saveEditing} 
                class="p-1.5 text-white bg-primary hover:bg-primary-hover rounded shadow-sm transition-colors" 
                title="Сохранить"
              >
                <span class="material-symbols-outlined text-lg">check</span>
              </button>
              <button 
                type="button"
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
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-card transition-all cursor-pointer group flex flex-col h-64 relative overflow-hidden">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-2">
              <span class="w-2 h-8 {snippet.color} rounded-full"></span>
              <div>
                <h3 class="text-lg font-bold text-text-main dark:text-white leading-tight">{snippet.title}</h3>
                <span class="text-[10px] uppercase tracking-wider font-bold text-gray-400">{snippet.category}</span>
              </div>
            </div>
            <button class="text-gray-400 hover:text-primary transition-colors p-1">
              <span class="material-symbols-outlined text-xl">star</span>
            </button>
          </div>
          <div class="flex-1 overflow-hidden relative">
            <p class="text-sm text-text-secondary dark:text-gray-400 leading-relaxed font-normal">
              {snippet.content}
            </p>
            <div class="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-surface-dark to-transparent"></div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span class="text-xs text-gray-400 font-mono">{snippet.cmd}</span>
            <div class="flex gap-2">
              <button class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-primary transition-colors" title="Копировать" onclick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(snippet.content); }}>
                <span class="material-symbols-outlined text-lg">content_copy</span>
              </button>
              <button onclick={(e) => { e.stopPropagation(); startEditing(snippet); }} class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-text-main dark:hover:text-white transition-colors" title="Редактировать">
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
            </div>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <div class="bg-accent-red-light dark:bg-surface-dark rounded-xl p-8 border border-primary/10 dark:border-border-dark flex flex-col md:flex-row items-center justify-between gap-6">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
        <span class="material-symbols-outlined text-2xl">auto_fix_high</span>
      </div>
      <div>
        <h3 class="text-lg font-bold text-text-main dark:text-white">Нужна помощь с формулировками?</h3>
        <p class="text-sm text-text-secondary dark:text-gray-400">Используйте AlfaVoice AI для автоматического создания профессиональных ответов в корпоративном стиле.</p>
      </div>
    </div>
    <button class="whitespace-nowrap bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-text-main dark:text-white px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-bold shadow-sm transition-colors">
      Попробовать AI помощник
    </button>
  </div>
</div>
