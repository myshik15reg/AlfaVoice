<script lang="ts">
  import { page } from '$app/stores';
  import { t } from '$lib/i18n';
  
  interface Props {
    isCollapsed: boolean;
  }
  
  const { isCollapsed }: Props = $props();

  const NAV_ITEMS = [
    { path: '/dictionary', icon: 'menu_book', label: t('dictionary') },
    { path: '/snippets', icon: 'content_cut', label: t('snippets') },
    { path: '/notes', icon: 'note_alt', label: t('notes') },
    { path: '/test-rxdb', icon: 'database', label: 'Test RxDB' },
  ];
  
  const BOTTOM_NAV_ITEMS = [
    { path: '/settings', icon: 'settings', label: t('settings'), isSettings: true },
    { path: '/support', icon: 'help', label: t('support') },
  ];

  function isActive(path: string, isSettings = false): boolean {
    const currentPath = $page.url.pathname;
    if (isSettings && currentPath.startsWith('/settings') && path === '/settings') {
      return true;
    }
    return currentPath === path;
  }
</script>

<aside 
  class={`${isCollapsed ? 'w-20' : 'w-64'} bg-background-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col h-full flex-shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden`}
>
  <a 
    href="/"
    class="h-20 flex items-center cursor-pointer transition-all duration-300 ease-in-out pl-6"
    aria-label={t('goToHome')}
  >
    <span class="material-symbols-outlined text-primary text-3xl font-bold flex-shrink-0">graphic_eq</span>
    <span 
      class={`${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-2'} text-2xl font-bold tracking-tight text-text-main dark:text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out`}
    >
      {t('appName')}
    </span>
  </a>

  <nav class="flex-1 px-2 space-y-1 mt-2 overflow-y-auto overflow-x-hidden">
    {#each NAV_ITEMS as item (item.path)}
      <a
        href={item.path}
        class={`w-full flex items-center py-3 text-lg font-medium rounded-md group transition-all duration-300 ease-in-out ${isActive(item.path) 
          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white relative' 
          : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-main dark:hover:text-white'
        } ${isCollapsed ? 'pl-5' : 'pl-4'}`}
        title={isCollapsed ? item.label : undefined}
      >
        <!-- Active Indicator -->
        <div 
          class={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r transition-opacity duration-300 ${isActive(item.path) 
            ? 'opacity-100' 
            : 'opacity-0'
          } ${isCollapsed ? 'opacity-0' : ''}`}
        ></div>
        
        <span 
          class={`material-symbols-outlined flex-shrink-0 transition-all duration-300 text-2xl ${isActive(item.path) 
            ? '' 
            : 'group-hover:text-primary transition-colors'
          }`}
        >
          {item.icon}
        </span>
        
        <span 
          class={`${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'} whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out`}
        >
          {item.label}
        </span>
      </a>
    {/each}
  </nav>

  <div class="px-2 py-4 space-y-1 border-t border-border-light dark:border-border-dark mt-auto">
    {#each BOTTOM_NAV_ITEMS as item (item.path)}
      <a
        href={item.path}
        class={`w-full flex items-center py-3 text-lg font-medium rounded-md group transition-all duration-300 ease-in-out ${isActive(item.path, item.isSettings) 
          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white relative' 
          : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-main dark:hover:text-white'
        } ${isCollapsed ? 'pl-5' : 'pl-4'}`}
        title={isCollapsed ? item.label : undefined}
      >
        <!-- Active Indicator -->
        <div 
          class={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r transition-opacity duration-300 ${isActive(item.path, item.isSettings) 
            ? 'opacity-100' 
            : 'opacity-0'
          } ${isCollapsed ? 'opacity-0' : ''}`}
        ></div>
        
        <span 
          class={`material-symbols-outlined flex-shrink-0 transition-all duration-300 text-2xl ${isActive(item.path, item.isSettings) 
            ? '' 
            : 'group-hover:text-primary transition-colors'
          }`}
        >
          {item.icon}
        </span>
        
        <span 
          class={`${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'} whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out`}
        >
          {item.label}
        </span>
      </a>
    {/each}
  </div>
</aside>
