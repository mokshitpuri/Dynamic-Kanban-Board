// util.js - small reusable helper functions
export const q = (sel, ctx = document) => ctx.querySelector(sel);
export const qAll = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

export function uid(prefix = 'id'){
  // simple unique id generator
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

// simple templating - returns element from html string
export function createElementFromHTML(html){
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}
