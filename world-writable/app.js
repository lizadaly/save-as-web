let db

// FileHandle objects can only be re-serialized by IndexedDB so create a whole-ass DB for this
const request = window.indexedDB.open("FileHandleDB")
request.onsuccess = (event) => {
    db = event.target.result
}
request.onupgradeneeded = (event) => {
    db = event.target.result
    db.createObjectStore("path", {
        keyPath: "fh"
    })
}

const article = document.querySelector('article')

// If the user double clicks on the content, make it editable
article.addEventListener('click', () => {
    article.setAttribute('contenteditable', true)
    article.focus()
})
// Let ESC cancel the editable selection
article.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        article.removeAttribute('contenteditable')
    }
})

// If the user selects something, make it a persistent highlight
article.addEventListener('mouseup', (event) => {
    const sel = document.getSelection()
    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        const mark = document.createElement('mark')
        try {
            range.surroundContents(mark)
        } catch (DOMException) {
            console.warn("Only highlighting within a block element is currently supported")
        }
        article.setAttribute("contenteditable", true)
        mark.addEventListener('mouseover', () => deletePrompt(mark))
        mark.addEventListener('mouseleave', deleteTimeout)
    }
})

const deletePrompt = (mark) => {
    setTimeout(() => {
        let modal

        modal = document.querySelector('#delete-modal')
        if (!modal) {
            modal = document.createElement('button')
            modal.classList.add('modal')
            modal.id = 'delete-modal'
            modal.textContent = 'Delete this highlight?'
        }
        modal.addEventListener('click', () => {
            const parent = mark.parentNode
            while (mark.firstChild) {
                parent.insertBefore(mark.firstChild, mark)
            }
            mark.remove()
            modal.remove()
            article.setAttribute("contenteditable", true)
        })
        mark.insertAdjacentElement("afterend", modal)
    }, 1000)
}

const deleteTimeout = () => {
    setTimeout(() => {
        document.querySelector('#delete-modal')?.remove()
    }, 5000)
}

document.querySelectorAll('mark').forEach((mark) => {
    mark.addEventListener('mouseover', () => deletePrompt(mark))
    mark.addEventListener('mouseleave', deleteTimeout)
})

document.querySelector("#save").addEventListener('click', async () => {

    let fh
    const store = db.transaction(["path"], "readwrite").objectStore("path")
    const req = store.get("fh")

    // If the user previously picked the file, don't make them go through the
    // picker again, but instead re-use the file handle from IndexedDB
    req.onsuccess = async () => {
        if (req.result) {

            // The user will be prompted to re-confirm that they allow write access here
            fh = req.result.value
        } else {
            // There's no cached file handle so ask the user to navigate to the
            // application directory and pre-fill the content page for them.
            fh = await window.showSaveFilePicker({
                suggestedName: 'index.html',
                types: [{
                    description: 'Index page for this website',
                    accept: {
                        'text/html': ['.html'],
                    },
                }],
            })
            db.transaction(["path"], "readwrite").objectStore("path").add({
                fh: "fh",
                value: fh
            })
        }

        // Prep the document for serialization
        document.querySelector('article').removeAttribute('contenteditable')
        document.querySelector('#delete-modal')?.remove()

        // Get the current content of this HTML file
        const s = new XMLSerializer()
        const d = document
        const contents = s.serializeToString(d)

        // Write it back out
        const writable = await fh.createWritable();
        await writable.write(contents);
        await writable.close();

        // Refresh
        location.reload()
    }
})