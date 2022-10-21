document.querySelector("#edit").addEventListener('click', async () => {
    // Begin editing
    const dir = await window.showDirectoryPicker()
    const fh = await window.showSaveFilePicker()

    // Get the current content of this HTML file
    const s = new XMLSerializer()
    const d = document
    const out = s.serializeToString(d)
    console.log(out)

})