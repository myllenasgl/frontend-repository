type Listener = (active: boolean) => void;

let active = false;
const listeners = new Set<Listener>();

export function isMockModeActive(): boolean {
  return active;
}

export function setMockModeActive(): void {
  if (active) return;
  active = true;
  listeners.forEach((listener) => listener(active));
}

export function subscribeMockMode(listener: Listener): () => void {
  listeners.add(listener);
  listener(active);
  return () => listeners.delete(listener);
}
