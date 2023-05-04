
import { store } from './storage.js'

const BASE_URI = 'https://www.courtlistener.com'
const SEARCH_ENDPOINT = `${BASE_URI}/api/rest/v3/search/`
const OPINION_ENDPOINT = `${BASE_URI}/api/rest/v3/opinions/`

export async function search (query) {
  const submit = document.querySelector('input[type="submit"]')
  submit.value = 'Searching'

  for (const sel of ['.results', 'article', '.case-citation']) {
    document.querySelector(sel).replaceChildren()
  }

  const resp = await fetch(`${SEARCH_ENDPOINT}?` + new URLSearchParams({
    q: query
  }))

  if (resp.ok) {
    const {
      results
    } = await resp.json()
    submit.value = 'Search'
    document.querySelector('form').reset()

    const list = document.querySelector('.results')

    for (const result of results) {
      const {
        id,
        caseName,
        citation,
        dateFiled
      } = result

      const item = document.createElement('li')
      const button = document.createElement('button')
      button.setAttribute('role', 'button')
      button.classList.add('edit')
      button.setAttribute('data-id', id)
      button.innerText = 'Edit'
      button.addEventListener('click', (e) => {
        const params = new URLSearchParams({
          result: id
        })
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

export async function showResult (id) {
  const resp = await fetch(`${OPINION_ENDPOINT}${id}/`)
  if (resp.ok) {
    const data = await resp.json()
    const section = document.createElement('section')
    section.innerHTML = data.html || data.html_lawbox || data.html_with_citations || data.html_columbia
    const article = document.querySelector('article.case')
    article.replaceChildren(section)
    store(id, section.outerHTML)

    article.setAttribute('data-id', id)
    document.querySelector('.case-citation').insertAdjacentHTML('beforebegin', `
     <a class="courtlistener-url" 
        href="https://courtlistener.com${data.absolute_url}">
        View on CourtListener
     </a>
    `)
  } else {
    console.error(resp)
  }
}
