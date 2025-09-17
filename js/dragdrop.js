// dragdrop.js - handles native HTML5 drag & drop and notifies caller when a task moved

export function initDragAndDrop(rootEl, onMove){
  let dragged = null;

  rootEl.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.card');
    if(!card) return;
    dragged = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    // store id
    e.dataTransfer.setData('text/plain', card.dataset.id);
  });

  rootEl.addEventListener('dragend', (e) => {
    if(dragged) dragged.classList.remove('dragging');
    dragged = null;
  });

  // dragover on dropzones
  rootEl.addEventListener('dragover', (e) => {
    if(!e.target) return;
    const dz = e.target.closest('.dropzone');
    if(dz){
      e.preventDefault(); // allow drop
      dz.classList.add('drag-over');
      e.dataTransfer.dropEffect = 'move';
    }
  });

  rootEl.addEventListener('dragleave', (e) => {
    const dz = e.target.closest('.dropzone');
    if(dz) dz.classList.remove('drag-over');
  });

  rootEl.addEventListener('drop', (e) => {
    const dz = e.target.closest('.dropzone');
    if(!dz) return;
    e.preventDefault();
    dz.classList.remove('drag-over');

    const id = e.dataTransfer.getData('text/plain');
    const card = rootEl.querySelector(`.card[data-id="${id}"]`);
    if(!card) return;

    // append card to dropzone
    dz.appendChild(card);

    // notify caller that item moved
    const newStatus = dz.dataset.dropzone;
    const cardId = card.dataset.id;
    if(typeof onMove === 'function') onMove(cardId, newStatus);
  });
}
