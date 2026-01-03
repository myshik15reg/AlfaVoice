

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/help/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/4.BhCTo2Sj.js"];
export const stylesheets = [];
export const fonts = [];
