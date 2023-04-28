const BASE_URI = "https://www.courtlistener.com"
const SEARCH_ENDPOINT = `${BASE_URI}/api/rest/v3/search/`
const OPINION_ENDPOINT = `${BASE_URI}/api/rest/v3/opinions/`

async function search(query) {
  const submit = document.querySelector('input[type="submit"]')
  submit.value = "Searching"

  for (const sel of [".results", "article", ".case-citation"]) {
    document.querySelector(sel).replaceChildren()
  }

  const resp = await fetch(
    `${SEARCH_ENDPOINT}?` +
    new URLSearchParams({
      q: query,
    })
  )

  if (resp.ok) {
    const {
      results
    } = await resp.json()
    submit.value = "Search"
    document.querySelector("form").reset()

    const list = document.querySelector(".results")

    for (const result of results) {
      const {
        id,
        caseName,
        citation,
        dateFiled
      } = result

      const item = document.createElement("li")
      const button = document.createElement("button")
      button.classList.add('edit')
      button.setAttribute("data-id", id)
      button.innerText = "Edit"

      item.innerHTML = `
            ${caseName} <span class="citations">${citation
          .slice(0, 2)
          .join(", ")}</span> 
            <span class="date">(${new Date(dateFiled).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "long", day: "numeric" }
          )})</span>
            `

      // Get the selected case 
      button.addEventListener("click", async (e) => {
        const button = e.target
        const id = button.getAttribute("data-id")
        const item = button.closest('li')

        const resp = await fetch(`${OPINION_ENDPOINT}${id}/`)
        if (resp.ok) {
          const {
            html,
            html_lawbox,
            html_with_citations,
            absolute_url
          } = await resp.json()

          const section = document.createElement("section")
          section.innerHTML = html || html_lawbox || html_with_citations
          document.body.addEventListener("mouseup", selector)
          const article = document.querySelector("article.case")
          article.replaceChildren(section)
          list.replaceChildren()
          document.querySelector('.case-citation').append(item)
          item.classList.add('selected')
          //article.prepend(item)
          item.insertAdjacentHTML("afterend", `
          <a class="courtlistener-url" href="https://courtlistener.com${absolute_url}">View on CourtListener</a>
          `)

        } else {
          console.error(resp)
        }
      })
      item.prepend(button)
      list.append(item)
    }
  } else {
    console.error(resp)
  }
}

const form = document.querySelector("form")

form?.addEventListener("submit", (e) => {
  e.preventDefault()
  const formData = new FormData(form)
  search(formData.get("query"))
})

const selector = () => {
  const sel = document.getSelection()
  if (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
    const containingRange = sel.getRangeAt(0)
    let start = sel.anchorNode
    let end = sel.focusNode

    let node, foundStart, foundEnd

    const ranges = []

    if (start.nodeType != Node.TEXT_NODE) {
      start =
        document.createNodeIterator(start, NodeFilter.SHOW_TEXT).nextNode() ||
        start
    }
    if (end.nodeType != Node.TEXT_NODE) {
      let lastText

      const endIter = document.createNodeIterator(
        document.querySelector("article"),
        NodeFilter.SHOW_ALL
      )
      while ((node = endIter.nextNode()) && node != end) {
        if (node.nodeType === Node.TEXT_NODE) {
          lastText = node
        }
      }
      end = lastText
    }
    if (start.nodeType != Node.TEXT_NODE || end.nodeType != Node.TEXT_NODE) {
      console.error("Could not find text nodes in one of: ", start, end)
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
      mark = document.createElement("mark")
      mark.setAttribute("data-selection-id", elisionId)
      range.surroundContents(mark)
    }
    const button = document.createElement("button")
    button.classList.add("elide")
    button.innerText = "Elide this"
    button.addEventListener("click", () => elider(elisionId, button))
    mark.insertAdjacentElement("afterEnd", button)

    sel.removeAllRanges()
  }
}

const elider = (uuid, button) => {
  let del
  for (const mark of document.querySelectorAll(
      `[data-selection-id="${uuid}"]`
    )) {
    del = document.createElement("del")
    del.setAttribute("data-selection-id", uuid)
    del.classList.add("elided-content")
    const range = new Range()
    range.selectNode(mark)
    range.surroundContents(del)
    del.insertAdjacentHTML("afterbegin", mark.innerHTML)
    mark.remove()
  }
  const ins = document.createElement("ins")
  ins.classList.add("elide-marker")
  ins.setAttribute("data-selection-id", uuid)
  del.insertAdjacentElement("afterend", ins)
  ins.title = "Click to unelide"
  ins.addEventListener("click", () => {
    for (const elision of document.querySelectorAll(
        `del[data-selection-id="${uuid}"]`
      )) {
      elision.insertAdjacentHTML("beforeBegin", elision.innerHTML)
      elision.remove()
    }
    ins.remove()
  })
  button.remove()
}

document.querySelector("body")?.addEventListener("mouseup", selector)