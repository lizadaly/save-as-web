const BASE_URI = 'https://www.courtlistener.com'
const SEARCH_ENDPOINT = `${BASE_URI}/api/rest/v3/search/`
const OPINION_ENDPOINT = `${BASE_URI}/api/rest/v3/opinions/`

async function search (query) {
  const submit = document.querySelector('input[type="submit"]')
  submit.value = 'Searching'

  for (const sel of ['.results', 'article', '.case-citation']) {
    document.querySelector(sel).replaceChildren()
  }

  const resp = await fetch(
    `${SEARCH_ENDPOINT}?` +
    new URLSearchParams({ q: query })
  )

  if (resp.ok) {
    const { results } = await resp.json()
    submit.value = 'Search'
    document.querySelector('form').reset()

    const list = document.querySelector('.results')

    for (const result of results) {
      const { id, caseName, citation, dateFiled } = result

      const item = document.createElement('li')
      const button = document.createElement('button')
      button.setAttribute('role', 'button')
      button.classList.add('edit')
      button.setAttribute('data-id', id)
      button.innerText = 'Edit'
      button.addEventListener('click', (e) => {
        const params = new URLSearchParams({ result: id })
        location.href = location.pathname + `?${params.toString()}`
      })

      item.innerHTML = `
            ${caseName} <span class="citations">${citation
          ?.slice(0, 2)
          .join(', ')}</span> 
            <span class="date">(${new Date(dateFiled).toLocaleDateString(
            'en-US',
            { year: 'numeric', month: 'long', day: 'numeric' }
          )})</span>
            `

      item.prepend(button)
      list.append(item)
    }
  } else {
    console.error(resp)
  }
}

async function showResult (id) {
  const resp = await fetch(`${OPINION_ENDPOINT}${id}/`)
  if (resp.ok) {
    const data = await resp.json()
    document.querySelector('button.clip').classList.remove('hidden')
    const section = document.createElement('section')
    section.innerHTML = data.html || data.html_lawbox || data.html_with_citations || data.html_columbia
    document.body.addEventListener('mouseup', selector)
    const article = document.querySelector('article.case')
    article.replaceChildren(section)
    article.insertAdjacentHTML('beforebegin', `
     <a class="courtlistener-url" 
        href="https://courtlistener.com${data.absolute_url}">
        View on CourtListener
     </a>
    `)
  } else {
    console.error(resp)
  }
}

const selector = () => {
  const sel = document.getSelection()
  if (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
    const containingRange = sel.getRangeAt(0)

    if (!document.querySelector('article.case').contains(containingRange.commonAncestorContainer)) {
      return
    }
    let start = sel.anchorNode
    let end = sel.focusNode

    let node, foundStart, foundEnd

    const ranges = []

    if (start.nodeType !== Node.TEXT_NODE) {
      start =
        document.createNodeIterator(start, NodeFilter.SHOW_TEXT).nextNode() ||
        start
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
        range.setStart(node, sel.anchorOffset)
      } else {
        range.setStart(node, 0)
      }

      if (node === end) {
        range.setEnd(node, sel.focusOffset)
      } else {
        range.setEnd(node, node.textContent?.length)
      }
      ranges.push(range)

      if (node === end) {
        foundEnd = true
      }
    }
    let mark
    const elisionId = crypto.randomUUID()

    for (const range of ranges) {
      mark = document.createElement('mark')
      mark.setAttribute('data-selection-id', elisionId)
      range.surroundContents(mark)
    }
    const controls = document.createElement('div')
    controls.classList.add('controls')
    mark.insertAdjacentElement('beforeBegin', controls)

    const elideButton = document.createElement('button')
    elideButton.classList.add('elide')
    elideButton.innerText = 'Elide this'
    elideButton.addEventListener('click', () => elider(elisionId, controls))

    const cancelButton = document.createElement('button')
    cancelButton.classList.add('cancel')
    cancelButton.innerText = 'Cancel'
    cancelButton.addEventListener('click', () => cancel(elisionId, controls))

    requestAnimationFrame(() => {
      // Allow ESC to cancel pending elision
      const canceller = (elisionId, controls, e) => {
        if (e.key === 'Escape') {
          cancel(elisionId, controls)
          document.body.removeEventListener('keydown', canceller)
        }
      }

      document.body.addEventListener('click', () => {
        cancel(elisionId, controls)
        document.body.removeEventListener('keydown', canceller)
      }, { once: true })
      document.body.addEventListener('keydown', canceller.bind(null, elisionId, controls))
    })

    controls.append(elideButton, cancelButton)

    sel.removeAllRanges()
  }
}

const cancel = (uuid, controls) => {
  controls.remove()
  for (const selection of document.querySelectorAll(
      `mark[data-selection-id="${uuid}"]`
  )) {
    selection.insertAdjacentHTML('beforeBegin', selection.innerHTML)
    selection.remove()
  }
}

const elider = (uuid, controls) => {
  let del
  controls.remove()

  for (const mark of document.querySelectorAll(
      `[data-selection-id="${uuid}"]`
  )) {
    del = document.createElement('del')
    del.setAttribute('data-selection-id', uuid)
    del.classList.add('elided-content')
    const range = new Range()
    range.selectNode(mark)
    range.surroundContents(del)
    del.insertAdjacentHTML('afterbegin', mark.innerHTML)
    mark.remove()
  }
  const ins = document.createElement('ins')
  ins.classList.add('elide-marker')
  ins.setAttribute('data-selection-id', uuid)
  del.insertAdjacentElement('afterend', ins)
  ins.title = 'Click to unelide'
  ins.addEventListener('click', () => {
    for (const elision of document.querySelectorAll(
        `del[data-selection-id="${uuid}"]`
    )) {
      elision.insertAdjacentHTML('beforeBegin', elision.innerHTML)
      elision.remove()
    }
    ins.remove()
  })
}

document.querySelector('body')?.addEventListener('mouseup', selector)

// Use the URL for search results
const params = new URL(document.location).searchParams
if (params.get('query')) {
  search(params.get('query'))
} else if (params.get('result')) {
  showResult(params.get('result'))
}

document.querySelector('button.clip').addEventListener('click', (e) => {
  const text = document.querySelector('article.case > section')
  const content = text.innerHTML
  navigator.clipboard.writeText(content)
  e.target.textContent = 'Added!'
  text.classList.add('selected')
  setTimeout(() => {
    e.target.textContent = 'Add case to clipboard'
    text.classList.remove('selected')
  }, 1000)
})
