const BASE_URI = "https://www.courtlistener.com";
const SEARCH_ENDPOINT = `${BASE_URI}/api/rest/v3/search/`;
const OPINION_ENDPOINT = `${BASE_URI}/api/rest/v3/opinions/`;

async function search(query) {
  const submit = document.querySelector('input[type="submit"]');
  submit.value = "Searching";

  document.querySelector('.results').replaceChildren()
  document.querySelector('.case').replaceChildren()

  const resp = await fetch(
    `${SEARCH_ENDPOINT}?` + new URLSearchParams({ q: query })
  );

  if (resp.ok) {
    const { results } = await resp.json();
    submit.value = "Search";
    document.querySelector('form').reset()

    const resultsContainer = document.querySelector(".results");
    const list = document.createElement("ol");

    for (const result of results) {
      const { id, caseName, citation, dateFiled } = result;

      const item = document.createElement("li");
      const button = document.createElement("button");
      button.setAttribute("data-id", id);
      button.innerText = "Edit";

      item.innerHTML = `
            ${caseName} <span class="citations">${citation
        .slice(0, 2)
        .join(", ")}</span> 
            <span class="date">(${new Date(dateFiled).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            )})</span>
            `;

      button.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const resp = await fetch(`${OPINION_ENDPOINT}${id}/`);
        if (resp.ok) {
          const { html } = await resp.json();

          const section = document.createElement("section");
          section.innerHTML = html;
          section.addEventListener("mouseup", selector);

          const caseContainer = document.querySelector(".case");
          caseContainer.innerHTML = `
                    <p class="elision-note">Note: only eliding within a single paragraph is currently supported.
                    `;
          caseContainer.append(section);
          resultsContainer.replaceChildren();
        } else {
          console.error(resp);
        }
      });
      item.prepend(button);
      list.append(item);
    }
    resultsContainer.append(list);
  } else {
    console.error(resp);
  }
}

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  search(formData.get("query"));
});

const selector = () => {
  const sel = document.getSelection();
  if (sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
    const range = sel.getRangeAt(0);
    const mark = document.createElement("mark");
    try {
      range.surroundContents(mark);
    } catch (DOMException) {
      console.warn(
        "Only highlighting within a block element is currently supported"
      );
      return;
    }
    const button = document.createElement("button");
    button.classList.add("elide");
    button.innerText = "Elide this";
    button.addEventListener("click", () => elider(mark, button));
    mark.insertAdjacentElement("afterEnd", button);
    sel.removeAllRanges();
  }
};

const elider = (mark, button) => {
  const container = document.createElement("span");
  container.classList.add("elided-content");
  container.innerHTML = mark.innerHTML;
  mark.replaceChildren(" ... ", container);
  mark.title = "Click to unelide";
  mark.addEventListener("click", (e) => {
    mark.insertAdjacentHTML(
      "beforeBegin",
      mark.querySelector(".elided-content").innerHTML
    );
    mark.remove();
  });
  button.remove();
};
