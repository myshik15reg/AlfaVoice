

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/style/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/8.CsJNo9a5.js"];
export const stylesheets = [];
export const fonts = [];
