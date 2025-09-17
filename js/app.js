// app.js - wires everything together: event handling, app logic
import Storage from './storage.js';
import { renderBoard } from './dom.js';
import { uid } from './util.js';
import { initDragAndDrop } from './dragdrop.js';

const storage = new Storage();
const root = document.getElementById('board');
const form = document.getElementById('task-form');

// UI elements (added for improved UX)
const announcer = document.getElementById('announcer');
const themeToggle = document.getElementById('theme-toggle');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTitle = document.getElementById('edit-title');
const editDesc = document.getElementById('edit-desc');
const editCancel = document.getElementById('edit-cancel');
let editingId = null;
const popupRoot = document.getElementById('popup-root');

// in-app popup helpers (returns a promise)
function createPopup(message, {confirm=false, okText='OK', cancelText='Cancel'} = {}){
  if(!popupRoot) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'popup';
  const p = document.createElement('p');
  p.textContent = message;
  wrapper.appendChild(p);
  const actions = document.createElement('div');
  actions.className = 'popup-actions';
  if(confirm){
    const cancel = document.createElement('button');
    cancel.className = 'btn';
    cancel.textContent = cancelText;
    cancel.addEventListener('click', () => {
      cleanup(false);
    });
    const ok = document.createElement('button');
    ok.className = 'btn primary';
    ok.textContent = okText;
    ok.addEventListener('click', () => {
      cleanup(true);
    });
    actions.appendChild(cancel);
    actions.appendChild(ok);
  }else{
    const ok = document.createElement('button');
    ok.className = 'btn primary';
    ok.textContent = okText;
    ok.addEventListener('click', () => cleanup(true));
    actions.appendChild(ok);
  }
  wrapper.appendChild(actions);
  popupRoot.appendChild(wrapper);

  function cleanup(result){
    wrapper.remove();
    popupRoot.setAttribute('aria-hidden','true');
    resolvePromise(result);
  }

  popupRoot.setAttribute('aria-hidden','false');
  let resolvePromise = () => {};
  const pPromise = new Promise(res => { resolvePromise = res; });
  return pPromise;
}

function appAlert(message){
  return createPopup(message, {confirm:false, okText:'OK'});
}

function appConfirm(message){
  return createPopup(message, {confirm:true, okText:'Yes', cancelText:'No'});
}

let tasks = [];

function loadAndRender(){
  tasks = storage.load();
  renderBoard(root, tasks);
}

function persistAndRender(){
  storage.save(tasks);
  renderBoard(root, tasks);
}

function createTask(title, desc){
  const task = {
    id: uid('task'),
    title: title.trim(),
    desc: desc.trim(),
    status: 'todo',
    createdAt: Date.now()
  };
  tasks.unshift(task); // newest on top
  persistAndRender();
  // announce and animate newly added card
  announce(`Task created: ${task.title}`);
  // add a small 'adding' animation after render
  setTimeout(() => {
    const card = root.querySelector(`.card[data-id="${task.id}"]`);
    if(card) card.classList.add('adding');
    setTimeout(() => card && card.classList.remove('adding'), 400);
  }, 40);
}

function deleteTask(id){
  const t = tasks.find(x => x.id === id);
  if(!t){
    return;
  }
  const card = root.querySelector(`.card[data-id="${id}"]`);
  if(card){
    card.classList.add('removing');
    // wait for CSS animation to finish then remove
    setTimeout(() => {
      tasks = tasks.filter(x => x.id !== id);
      persistAndRender();
      announce(`Task deleted: ${t.title}`);
    }, 200);
  }else{
    tasks = tasks.filter(x => x.id !== id);
    persistAndRender();
    announce(`Task deleted: ${t.title}`);
  }
}

function updateTaskStatus(id, newStatus){
  const t = tasks.find(x => x.id === id);
  if(t){
    t.status = newStatus;
    persistAndRender();
  }
}

function editTask(id){
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  // open edit modal
  editingId = id;
  editTitle.value = t.title;
  editDesc.value = t.desc || '';
  editModal.setAttribute('aria-hidden','false');
  editTitle.focus();
}

// delegate click for edit/delete
root.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const card = e.target.closest('.card');
  if(!card) return;
  const id = card.dataset.id;
  const action = btn.dataset.action;
  if(action === 'delete'){
    const ok = await appConfirm('Delete this task?');
    if(ok) deleteTask(id);
  }else if(action === 'edit'){
    editTask(id);
  }
});

// form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const desc = document.getElementById('desc').value;
  if(!title.trim()){
    await appAlert('Title required');
    document.getElementById('title').focus();
    return;
  }
  createTask(title, desc);
  form.reset();
  document.getElementById('title').focus();
});

// initialize drag and drop
initDragAndDrop(root, (id, newStatus) => {
  updateTaskStatus(id, newStatus);
  const t = tasks.find(x => x.id === id);
  if(t) announce(`${t.title} moved to ${newStatus}`);
});

// modal handlers
if(editCancel){
  editCancel.addEventListener('click', () => closeModal());
}
if(editForm){
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!editingId) return closeModal();
    const t = tasks.find(x => x.id === editingId);
    if(!t) return closeModal();
    t.title = editTitle.value.trim() || t.title;
    t.desc = editDesc.value.trim();
    persistAndRender();
    announce(`Task updated: ${t.title}`);
    closeModal();
  });
}

function closeModal(){
  if(editModal) editModal.setAttribute('aria-hidden','true');
  editingId = null;
  document.getElementById('title').focus();
}

if(editModal){
  editModal.addEventListener('click', (e) => {
    if(e.target.dataset && e.target.dataset.close === 'true') closeModal();
  });
}

// announcer helper
function announce(msg){
  if(!announcer) return;
  announcer.textContent = '';
  setTimeout(() => { announcer.textContent = msg; }, 50);
}

// theme toggle
if(themeToggle){
  themeToggle.addEventListener('click', () => {
    const rootEl = document.documentElement;
    const isDark = rootEl.getAttribute('data-theme') === 'dark';
    if(isDark){
      rootEl.removeAttribute('data-theme');
      themeToggle.setAttribute('aria-pressed','false');
      themeToggle.textContent = '🌙';
    }else{
      rootEl.setAttribute('data-theme','dark');
      themeToggle.setAttribute('aria-pressed','true');
      themeToggle.textContent = '☀️';
    }
  });
}

// keyboard support: delete focused card with Delete or Backspace
root.addEventListener('keydown', (e) => {
  const targetCard = document.activeElement && document.activeElement.closest && document.activeElement.closest('.card');
  if(!targetCard) return;
  const id = targetCard.dataset.id;
  if((e.key === 'Delete' || e.key === 'Backspace')){
    appConfirm('Delete this task?').then(ok => { if(ok) deleteTask(id); });
  }else if(e.key === 'Enter'){
    // focus pressed Enter on card -> open edit
    editTask(id);
  }
});

// listen for storage changes (another tab)
window.addEventListener('storage', (e) => {
  if(e.key === storage.key){
    // reload tasks from storage and render
    loadAndRender();
  }
});

// initial load
loadAndRender();

// put focus on title field on load for faster entry
document.getElementById('title').focus();
