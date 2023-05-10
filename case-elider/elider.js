import { store, addHandlers } from './storage.js'

export const selector = () => {
  const sel = document.getSelection()
  if (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
    const controls = document.createElement('div')
    controls.classList.add('controls')
    controls.style.top = `${sel.getRangeAt(0).getBoundingClientRect().bottom + window.scrollY}px`
    document.body.append(controls)

    const elideButton = document.createElement('button')
    elideButton.classList.add('elide')
    elideButton.innerText = 'Elide this'
    elideButton.addEventListener('click', () => {
      elider()
    })
    // const annotateButton = document.createElement('button')
    // annotateButton.classList.add('annotate')
    // annotateButton.innerText = 'Add note'
    // annotateButton.addEventListener('click', () => {
    //   annotator()
    // })

    const highlightButton = document.createElement('button')
    highlightButton.classList.add('highlight')
    highlightButton.innerText = 'Highlight'
    highlightButton.addEventListener('click', () => {
      highlighter()
    })

    requestAnimationFrame(() => {
      document.body.addEventListener('click', () => {
        controls.remove()
      })
    })
    controls.append(elideButton, highlightButton)
  }
}
const createRanges = () => {
  const sel = document.getSelection()

  if (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
    let node, foundStart, foundEnd, start, end, startOffset, endOffset

    const containingRange = sel.getRangeAt(0)
    if (!document.querySelector('article.case').contains(containingRange.commonAncestorContainer)) {
      return
    }

    if (sel.anchorNode.compareDocumentPosition(sel.focusNode) === Node.DOCUMENT_POSITION_PRECEDING) {
      start = sel.focusNode
      end = sel.anchorNode

      startOffset = sel.focusOffset
      endOffset = sel.anchorOffset
    } else {
      start = sel.anchorNode
      end = sel.focusNode

      // If we're within a node we may still have dragged backwards so account for that
      if (sel.anchorNode === sel.focusNode) {
        startOffset = Math.min(sel.anchorOffset, sel.focusOffset)
        endOffset = Math.max(sel.focusOffset, sel.anchorOffset)
      } else {
        startOffset = sel.anchorOffset
        endOffset = sel.focusOffset
      }
    }

    const ranges = []

    if (start.nodeType !== Node.TEXT_NODE) {
      start = document.createNodeIterator(start, NodeFilter.SHOW_TEXT).nextNode() || start
    }
    if (end.nodeType !== Node.TEXT_NODE) {
      let lastText

      const endIter = document.createNodeIterator(
        document.querySelector('article'),
        NodeFilter.SHOW_ALL
      )
      while ((node = endIter.nextNode()) && node !== end) {
        if (node.nodeType === Node.TEXT_NODE) {
          lastText = node
        }
      }
      end = lastText
    }
    if (start.nodeType !== Node.TEXT_NODE || end.nodeType !== Node.TEXT_NODE) {
      console.error('Could not find text nodes in one of: ', start, end)
    }

    const iter = document.createNodeIterator(
      containingRange.commonAncestorContainer,
      NodeFilter.SHOW_TEXT
    )

    while ((node = iter.nextNode()) && !foundEnd) {
      if (node === start) {
        foundStart = true
      }
      if (!foundStart) {
        continue
      }

      const range = new Range()

      if (node === start) {
        range.setStart(node, startOffset)
      } else {
        range.setStart(node, 0)
      }

      if (node === end) {
        range.setEnd(node, endOffset)
      } else {
        range.setEnd(node, node.textContent?.length)
      }
      ranges.push(range)

      if (node === end) {
        foundEnd = true
      }
    }
    sel.removeAllRanges()

    return ranges
  }
}

const elider = () => {
  let del

  const ranges = createRanges()
  const elisionId = crypto.randomUUID()

  for (const range of ranges) {
    del = document.createElement('del')
    del.setAttribute('data-selection-id', elisionId)
    del.classList.add('elided-content')
    range.surroundContents(del)
  }

  const ins = document.createElement('ins')
  ins.classList.add('elide-marker', 'removable')
  ins.setAttribute('data-selection-id', elisionId)
  del.insertAdjacentElement('afterend', ins)
  ins.title = 'Click to unelide'

  requestAnimationFrame(() => {
    store()
    addHandlers()
  })
}

const highlighter = () => {
  let mark

  const ranges = createRanges()
  const highlightId = crypto.randomUUID()

  for (const range of ranges) {
    mark = document.createElement('mark')
    mark.setAttribute('data-selection-id', highlightId)
    mark.classList.add('highlighted-content', 'removable')
    mark.title = 'Click to remove highlight'
    range.surroundContents(mark)
  }

  // const ins = document.createElement('ins')
  // ins.classList.add('elide-marker')
  // ins.setAttribute('data-selection-id', elisionId)
  // del.insertAdjacentElement('afterend', ins)
  // ins.title = 'Click to unelide'

  requestAnimationFrame(() => {
    store()
    addHandlers()
  })
}
