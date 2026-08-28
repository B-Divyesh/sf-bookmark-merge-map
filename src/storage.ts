import type { SavedProject } from './types';

const STORE = 'projects';
export type StorageSpace = 'real' | 'demo';

export function databaseName(space: StorageSpace): string {
  return space === 'demo' ? 'demo:bookmark-merge-map' : 'bookmark-merge-map';
}

function open(space: StorageSpace): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(space), 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: SavedProject, space: StorageSpace = 'real'): Promise<void> {
  const db = await open(space);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(project, 'active');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadProject(space: StorageSpace = 'real'): Promise<SavedProject | undefined> {
  const db = await open(space);
  const result = await new Promise<SavedProject | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get('active');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export async function clearProject(space: StorageSpace = 'real'): Promise<void> {
  const db = await open(space);
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).delete('active');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
