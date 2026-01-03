

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/snippets/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/7.DLZbnOS3.js"];
export const stylesheets = [];
export const fonts = [];
