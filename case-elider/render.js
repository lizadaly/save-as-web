import { store, addHandlers, listStoredCases } from './storage.js'

export const render = (metadata, content) => {
  const { id } = metadata
  const article = document.querySelector('article.case')
  article.innerHTML = content

  article.setAttribute('data-id', id)
  article.metadata = metadata
  document.querySelector('.metadata').innerHTML = `
    ${metadata.case_name}
    <a class="courtlistener-url" 
        href="https://courtlistener.com${metadata.absolute_url}">
        View on CourtListener
    </a>
    `
  addHandlers()
  store()
  listStoredCases()
}
