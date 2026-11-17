/* ============================================================
   LOCAL STORAGE ADAPTER
   Centralizes safe JSON reads/writes and user-scoped key naming.
   This is the only browser-storage primitive used by repository,
   store, and sync layers.
   ============================================================ */
(function(){
  const NO_USER = '__none__';

  function get(key, fallback){
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function set(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key){
    localStorage.removeItem(key);
  }

  function getText(key, fallback){
    try {
      const value = localStorage.getItem(key);
      return value == null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function setText(key, value){
    localStorage.setItem(key, String(value));
  }

  function forUser(key, userId){
    return key + '::' + (userId ? String(userId) : NO_USER);
  }

  window.MTPStorage = Object.freeze({ get, set, remove, getText, setText, forUser });
})();
