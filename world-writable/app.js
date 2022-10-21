document.querySelector('article').addEventListener('dblclick', () => {

    const article = document.querySelector('article')
    article.setAttribute('contenteditable', true)
    article.focus()

})

document.querySelector("#save").addEventListener('click', async () => {
    // Begin editing
    const fh = await window.showSaveFilePicker()

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
})