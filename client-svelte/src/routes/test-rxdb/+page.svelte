<script lang="ts">
  import { dbStore } from '$lib/stores/db.svelte';
  import type { Snippet } from '$lib/types';

  let testSnippet: Snippet = {
    id: Date.now(),
    title: 'Тестовый сниппет',
    category: 'Тест',
    content: 'Это тестовый сниппет для проверки RxDB',
    tags: ['тест', 'rxdb'],
    color: 'bg-red-500',
    cmd: '/test',
    createdAt: new Date().toISOString()
  };

  let statusMessage = '';

  async function testAddSnippet() {
    try {
      await dbStore.addSnippet(testSnippet);
      statusMessage = `✅ Сниппет добавлен! ID: ${testSnippet.id}`;
      // Generate new ID for next test
      testSnippet.id = Date.now();
    } catch (error) {
      statusMessage = `❌ Ошибка: ${error}`;
      console.error('Error adding snippet:', error);
    }
  }

  async function testClearDatabase() {
    try {
      const snippets = dbStore.snippets;
      for (const snippet of snippets) {
        await dbStore.deleteSnippet(snippet.id);
      }
      statusMessage = '✅ База данных очищена';
    } catch (error) {
      statusMessage = `❌ Ошибка: ${error}`;
      console.error('Error clearing database:', error);
    }
  }
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold mb-6">Тест RxDB</h1>
  
  <div class="mb-6">
    <h2 class="text-xl font-semibold mb-2">Статус базы данных</h2>
    <p class="mb-2">Инициализирована: {dbStore.isInitialized ? '✅ Да' : '❌ Нет'}</p>
    <p class="mb-2">Количество сниппетов: {dbStore.snippets.length}</p>
    <p class="mb-2">Количество заметок: {dbStore.notes.length}</p>
    <p class="mb-2">Количество терминов словаря: {dbStore.dictionary.length}</p>
  </div>

  <div class="mb-6">
    <h2 class="text-xl font-semibold mb-2">Тестовые операции</h2>
    <div class="flex gap-4 mb-4">
      <button
        on:click={testAddSnippet}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Добавить тестовый сниппет
      </button>
      <button
        on:click={testClearDatabase}
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Очистить базу данных
      </button>
    </div>
    {#if statusMessage}
      <p class="p-4 bg-gray-100 rounded">{statusMessage}</p>
    {/if}
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-2">Текущие сниппеты</h2>
    {#if dbStore.snippets.length === 0}
      <p>Нет сниппетов</p>
    {:else}
      <ul class="space-y-2">
        {#each dbStore.snippets as snippet}
          <li class="p-3 bg-gray-100 rounded">
            <strong>{snippet.title}</strong> ({snippet.category})
            <br />
            <small>ID: {snippet.id}</small>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
