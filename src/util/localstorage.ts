export interface LocalStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

class LocalStorageBackend implements LocalStorage {
  public getItem(key: string) {
    return window.localStorage.getItem(key);
  }

  public setItem(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }
}

class MockLocalStorageBackend implements LocalStorage {
  private _storage: {};

  public constructor() {
    this._storage = {};
  }

  public getItem(key: string) {
    return this._storage[key];
  }

  public setItem(key: string, value: string) {
    this._storage[key] = value;
  }
}

export default (function() {
  try {
    let storage = window.localStorage;
    let testKey = '__test__';
    storage.setItem(testKey, '');
    storage.removeItem(testKey);
    return new LocalStorageBackend();
  } catch (e) {
    return new MockLocalStorageBackend();
  }
})();
