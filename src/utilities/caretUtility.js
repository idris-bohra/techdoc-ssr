export function getCaretPosition(editableDiv) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editableDiv);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }
  
  export function restoreCaretPosition(editableDiv, position) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(editableDiv, 0);
    range.collapse(true);
    let nodeStack = [editableDiv], charCount = 0, found = false;
  
    while (!found && nodeStack.length > 0) {
      const node = nodeStack.pop();
      if (node.nodeType === 3) {
        const nextCharCount = charCount + node.length;
        if (position <= nextCharCount) {
          range.setStart(node, position - charCount);
          range.collapse(true);
          found = true;
        } else {
          charCount = nextCharCount;
        }
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }
  
    selection.removeAllRanges();
    selection.addRange(range);
  }