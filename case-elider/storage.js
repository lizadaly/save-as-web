export const store = (id, content) => {
  if (!content) {
    content = document.querySelector('article.case')?.innerHTML
    if (!content) {
      console.warn(`Tried to serialize content for ${id} but there wasn't any content`)
    }
  }
  localStorage.setItem(`result-${id}`, content)
}

export const retrieve = (id) => {
  const content = localStorage.getItem(`result-${id}`)
  if (!content) {
    return false
  }
  const article = document.querySelector('article.case')
  article.setAttribute('data-id', id)
  article.innerHTML = content
  addHandlers(id)
  return true
}
export const addHandlers = (id) => {
  // Find all the elide handlers and refresh them
  for (const ins of document.querySelectorAll('article.case ins')) {
    const uuid = ins.getAttribute('data-selection-id')
    ins.addEventListener('click', () => {
      for (const elision of document.querySelectorAll(
                `del[data-selection-id="${uuid}"]`)) {
        elision.insertAdjacentHTML('beforeBegin', elision.innerHTML)
        elision.remove()
      }
      ins.remove()
      store(id)
    })
  }
}
