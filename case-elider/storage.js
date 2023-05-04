import { render } from './render.js'

export const store = () => {
  const article = document.querySelector('article.case')
  const { metadata } = article
  const { id } = metadata
  const content = article.innerHTML

  localStorage.setItem(id, JSON.stringify({ metadata, content }))
}

export const retrieve = (id) => {
  const data = localStorage.getItem(`result-${id}`)
  if (!data) {
    return false
  }
  const { metadata, content } = JSON.parse(data)
  render(metadata, content)
  return true
}
export const addHandlers = () => {
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
    })
  }
}
