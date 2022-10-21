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

// If the user double clicks on the content, make it editable
document.querySelector('article').addEventListener('dblclick', () => {
    const article = document.querySelector('article')
    article.setAttribute('contenteditable', true)
    article.focus()

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
                    db.transaction(["path"], "readwrite").objectStore("path").add({fh: "fh", value: fh})
                }

                // Prep the document for serialization
                document.querySelector('article').removeAttribute('contenteditable')

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