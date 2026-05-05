export type Action =
  | { type: 'focus-next' }
  | { type: 'focus-prev' }
  | { type: 'set-stage'; stage: 0 | 1 | 2 }
  | { type: 'expand-all' }
  | { type: 'collapse-all' }
  | { type: 'toggle-bookmark' }
  | { type: 'toggle-read' }
  | { type: 'toggle-help' }
  | { type: 'font-size'; direction: 1 | -1 };

export function keyToAction(key: string): Action | null {
  switch (key) {
    case 'j': return { type: 'focus-next' };
    case 'k': return { type: 'focus-prev' };
    case '0': return { type: 'set-stage', stage: 0 };
    case '1': return { type: 'set-stage', stage: 1 };
    case '2': return { type: 'set-stage', stage: 2 };
    case 'e': return { type: 'expand-all' };
    case 'c': return { type: 'collapse-all' };
    case 'b': return { type: 'toggle-bookmark' };
    case ' ': return { type: 'toggle-read' };
    case '?': return { type: 'toggle-help' };
    case '+': case '=': return { type: 'font-size', direction: 1 };
    case '-': case '_': return { type: 'font-size', direction: -1 };
    default: return null;
  }
}
