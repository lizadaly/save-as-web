import { render } from './render.js'

export const store = () => {
  const article = document.querySelector('article.case')
  const { metadata } = article
  const { id } = metadata
  const content = article.innerHTML

  localStorage.setItem(id, JSON.stringify({ metadata, content }))
}

export const retrieve = (id) => {
  const data = localStorage.getItem(id)
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
      store()
    })
  }
}

export function listStoredCases () {
  const storedCases = document.querySelector('.stored-cases')
  storedCases.innerHTML = '<h3>Edited cases:</h3>'

  for (const id of Object.keys(localStorage)) {
    const { metadata } = JSON.parse(localStorage.getItem(id))
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.innerText = metadata.case_name
    a.href = `?result=${id}`
    li.append(a)
    const button = document.createElement('button')
    button.addEventListener('click', () => {
      localStorage.removeItem(id)
      li.remove()
    })
    button.textContent = 'X'
    button.classList.add('delete-result')
    li.append(button)
    storedCases.append(li)
  }
}
