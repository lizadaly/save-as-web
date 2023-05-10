import { render } from './render.js'

export const store = () => {
  const article = document.querySelector('article.case')
  const { metadata } = article
  const { id } = metadata
  const content = article.innerHTML

  localStorage.setItem(id, JSON.stringify({ metadata, content }))
}

export const retrieve = (id) => {
  const data = localStorage.getItem(`${id}`)
  if (!data) {
    return false
  }
  const { metadata, content } = JSON.parse(data)
  render(metadata, content)
  return true
}

export const addHandlers = () => {
  // Find all the annotation handlers and refresh them
  for (const el of document.querySelectorAll('article.case .removable[data-selection-id]')) {
    const uuid = el.getAttribute('data-selection-id')
    el.addEventListener('click', () => {
      for (const match of document.querySelectorAll(`[data-selection-id="${uuid}"]`)) {
        match.insertAdjacentHTML('beforeBegin', match.innerHTML)
        match.remove()
      }
      store()
    })
  }
  for (const el of document.querySelectorAll('article.case [data-annotation-remover]')) {
    const uuid = el.getAttribute('data-selection-id')
    el.addEventListener('click', () => {
      for (const match of document.querySelectorAll(`mark[data-selection-id="${uuid}"]`)) {
        match.insertAdjacentHTML('beforeBegin', match.innerHTML)
        match.remove()
      }
      el.closest('.annotation-marker').remove()
      store()
    })
  }
  // Note handlers too
  for (const el of document.querySelectorAll('article.case .annotation-marker aside')) {
    el.addEventListener('blur', () => {
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
