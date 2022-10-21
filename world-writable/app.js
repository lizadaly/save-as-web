document.querySelector("#edit").addEventListener('click', async () => {
    // Begin editing
    const dir = await window.showDirectoryPicker()
    const fh = await window.showSaveFilePicker({startIn: dir})

    // Get the current content of this HTML file
    const s = new XMLSerializer()
    const d = document
    const contents = s.serializeToString(d)


    const writable = await fh.createWritable();
    await writable.write(contents);
    await writable.close();

    // Refresh
    location.reload()
})