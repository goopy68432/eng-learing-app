import '@testing-library/jest-dom';

// Node 25 ships an experimental built-in `localStorage` global that requires
// --localstorage-file and otherwise lacks working methods, shadowing jsdom's
// implementation. Replace both globals with a simple in-memory Storage shim so
// tests get a fully functional Web Storage API.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

const memLocal = new MemoryStorage();
const memSession = new MemoryStorage();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memLocal,
});
Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: memSession,
});
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: memLocal,
  });
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: memSession,
  });
}
