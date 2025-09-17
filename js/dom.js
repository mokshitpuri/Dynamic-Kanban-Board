// dom.js - rendering and DOM event helpers (separation of concerns)
import { createElementFromHTML } from './util.js';

const COLUMN_IDS = ['todo','inprogress','done'];
const COLUMN_TITLES = {todo: 'To Do', inprogress: 'In Progress', done: 'Done'};

export function buildColumns(){
  // returns element containing columns
  const container = document.createElement('div');
  container.className = 'board-grid';

  COLUMN_IDS.forEach(id => {
    const col = document.createElement('section');
    col.className = 'column';
    col.dataset.column = id;
    col.setAttribute('aria-labelledby', `col-${id}`);
    col.innerHTML = `
      <h3 id="col-${id}">${COLUMN_TITLES[id]} <span class="count" data-count="${id}">0</span></h3>
      <div class="dropzone" data-dropzone="${id}" role="list" aria-live="polite"></div>
    `;
    container.appendChild(col);
  });

  return container;
}

export function createTaskCard(task){
  const html = `
    <article class="card" tabindex="0" draggable="true" data-id="${task.id}" data-status="${task.status}" role="listitem" aria-label="Task: ${escapeHtml(task.title)}">
      <h4>${escapeHtml(task.title)}</h4>
      <p>${escapeHtml(task.desc || '')}</p>
      <div class="meta">
        <div>${new Date(task.createdAt).toLocaleString()}</div>
        <div class="btns">
          <button class="btn edit" data-action="edit" aria-label="Edit task">Edit</button>
          <button class="btn danger delete" data-action="delete" aria-label="Delete task">Delete</button>
        </div>
      </div>
    </article>
  `;
  return createElementFromHTML(html);
}

export function renderBoard(rootEl, tasks){
  // clear root and render columns + cards
  rootEl.innerHTML = '';
  const columnsWrap = buildColumns();
  // columnsWrap holds the columns; append to root
  Array.from(columnsWrap.children).forEach(c => rootEl.appendChild(c));

  // place tasks
  tasks.forEach(task => {
    const card = createTaskCard(task);
    const dropzone = rootEl.querySelector(`.dropzone[data-dropzone="${task.status}"]`);
    if(dropzone) dropzone.appendChild(card);
  });

  // update counts
  ['todo','inprogress','done'].forEach(id => {
    const countEl = rootEl.querySelector(`.count[data-count="${id}"]`);
    const items = rootEl.querySelectorAll(`.dropzone[data-dropzone="${id}"] .card`).length;
    if(countEl) countEl.textContent = items;
    const dz = rootEl.querySelector(`.dropzone[data-dropzone="${id}"]`);
    if(dz && items === 0){
      // placeholder non-interactive element
      dz.innerHTML = `<div class="empty" aria-hidden="true">No tasks</div>`;
    }else if(dz){
      // remove empty placeholder if present
      const empty = dz.querySelector('.empty');
      if(empty) empty.remove();
    }
  });
}

// small XSS escape helper
function escapeHtml(unsafe){
  return (unsafe || '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}
