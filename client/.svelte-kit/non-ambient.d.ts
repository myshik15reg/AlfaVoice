
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/dictionary" | "/help" | "/notes" | "/settings" | "/snippets" | "/style";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/dictionary": Record<string, never>;
			"/help": Record<string, never>;
			"/notes": Record<string, never>;
			"/settings": Record<string, never>;
			"/snippets": Record<string, never>;
			"/style": Record<string, never>
		};
		Pathname(): "/" | "/dictionary" | "/dictionary/" | "/help" | "/help/" | "/notes" | "/notes/" | "/settings" | "/settings/" | "/snippets" | "/snippets/" | "/style" | "/style/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}