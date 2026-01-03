

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/notes/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/5.Cam2LFS7.js"];
export const stylesheets = [];
export const fonts = [];
