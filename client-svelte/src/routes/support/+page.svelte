<script lang="ts">
  import { SUPPORT_FAQS } from '$lib/stores/auth.svelte';

  let openIndex = $state<number | null>(null);

  function toggleAccordion(index: number) {
    openIndex = openIndex === index ? null : index;
  }
</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Поддержка</h1>
    <p class="text-text-secondary text-sm mb-8">Мы здесь, чтобы помочь вам с любыми вопросами по AlfaVoice.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-card dark:hover:shadow-card-dark transition-all">
        <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <span class="material-symbols-outlined text-2xl">chat</span>
        </div>
        <h3 class="text-lg font-bold text-text-main dark:text-white mb-2">Чат с поддержкой</h3>
        <p class="text-sm text-text-secondary dark:text-gray-400 mb-4">Напишите нам в реальном времени. Мы отвечаем в течение 5 минут.</p>
        <button class="text-primary font-bold text-sm hover:underline flex items-center">
          Начать чат <span class="material-symbols-outlined text-base ml-1">arrow_forward</span>
        </button>
      </div>

      <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-card dark:hover:shadow-card-dark transition-all">
         <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
          <span class="material-symbols-outlined text-2xl">mail</span>
        </div>
        <h3 class="text-lg font-bold text-text-main dark:text-white mb-2">Email</h3>
        <p class="text-sm text-text-secondary dark:text-gray-400 mb-4">Для сложных вопросов и предложений. support@alfavoice.ru</p>
        <button class="text-primary font-bold text-sm hover:underline flex items-center">
          Написать письмо <span class="material-symbols-outlined text-base ml-1">arrow_forward</span>
        </button>
      </div>
    </div>

    <div class="mt-8 bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm">
       <h3 class="text-lg font-bold text-text-main dark:text-white mb-4">Часто задаваемые вопросы</h3>
       <div class="space-y-4">
         {#each SUPPORT_FAQS as item, i}
           <div class="rounded-lg overflow-hidden border border-gray-100 dark:border-white/5 transition-all">
             <button
                class="flex items-center justify-between p-4 w-full text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group {openIndex === i ? 'bg-gray-50 dark:bg-white/5' : 'bg-white dark:bg-transparent'}"
                onclick={() => toggleAccordion(i)}
                onkeydown={(e) => e.key === 'Enter' && toggleAccordion(i)}
                aria-expanded={openIndex === i}
             >
                <span class="text-sm font-medium text-text-main dark:text-gray-200 group-hover:text-primary transition-colors">{item.question}</span>
                <span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-transform duration-300 {openIndex === i ? 'rotate-180' : ''}">expand_more</span>
             </button>
             <div class="overflow-hidden transition-all duration-300 ease-in-out {openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}">
                <div class="p-4 pt-0 text-sm text-text-secondary dark:text-gray-400 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                    {item.answer}
                </div>
             </div>
           </div>
         {/each}
       </div>
    </div>
  </div>
</div>
