import { selector } from './elider.js'
import { retrieve, listStoredCases } from './storage.js'
import { search, showResult } from './search.js'

document.querySelector('article.case')?.addEventListener('selectstart', () => {
  document.querySelector('article.case').addEventListener('mouseup', selector, { once: true })
})

// Use the URL for search results
const params = new URL(document.location).searchParams
if (params.get('query')) {
  search(params.get('query'))
} else if (params.get('result')) {
  const cached = retrieve(params.get('result'))
  if (!cached) {
    showResult(params.get('result'))
  }
}

document.querySelector('button.clip').addEventListener('click', (e) => {
  const text = document.querySelector('article.case')

  const data = new ClipboardItem({
    'text/plain': new Blob(
      [text.innerText], {
        type: 'text/plain'
      }
    ),
    'text/html': new Blob(
      [text.outerHTML], {
        type: 'text/html'
      }
    )
  })

  navigator.clipboard.write([data]).then(
    () => {
      e.target.textContent = 'Added!'
      text.classList.add('selected')
      setTimeout(() => {
        e.target.textContent = 'Add case to clipboard'
        text.classList.remove('selected')
      }, 1000)
    },
    (err) => {
      console.error(err)
    }
  )
})

document.querySelector('button.download-html').addEventListener('click', (e) => {
  download('text/html', 'HTML', e.target)
})
document.querySelector('button.download-text').addEventListener('click', (e) => {
  download('text/plain', 'text', e.target)
})

const download = (type, label, button) => {
  const text = document.querySelector('article.case')
  const id = text.getAttribute('data-id')
  const content = type === 'text/html' ? text.innerHTML : text.textContent
  const blob = new Blob([content], {
    type
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `courtlistener-${id}`
  link.href = url
  document.body.append(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  button.textContent = 'Downloading...'
  setTimeout(() => {
    button.textContent = `Download as ${label}`
  }, 1000)
}

if (Object.keys(localStorage).length > 0) {
  listStoredCases()
}
