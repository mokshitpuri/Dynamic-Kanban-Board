// storage.js - wrapper for localStorage persistence (single responsibility)
const STORAGE_KEY = 'dynamic-kanban-v1';

export default class Storage {
  constructor(key = STORAGE_KEY){
    this.key = key;
  }

  load(){
    try{
      const raw = localStorage.getItem(this.key);
      if(!raw) return [];
      return JSON.parse(raw);
    }catch(err){
      console.error('Failed to parse storage', err);
      return [];
    }
  }

  save(tasks){
    try{
      localStorage.setItem(this.key, JSON.stringify(tasks));
    }catch(err){
      console.error('Failed to save to storage', err);
    }
  }
}
