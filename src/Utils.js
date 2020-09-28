/**
 * @param {Event} e 
 */
export function cancelEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

/**
 * Computes value for `dropEffect` property of the `DragEvent`.
 * @param {DragEvent} e
 * @return {string} Either `copy` or `move`.
 */
export function computeProjectDropEffect(e) {
  const dt = e.dataTransfer;
  let allowed = dt.effectAllowed;
  if (!allowed) {
    // this 2 operations are supported here
    allowed = 'copyMove';
  }
  allowed = allowed.toLowerCase();
  const type = [...dt.types];
  const isHistory = type.includes('arc/history');
  if ((e.ctrlKey || e.metaKey) && !isHistory && allowed.indexOf('move') !== -1) {
    return 'move';
  }
  return 'copy';
}