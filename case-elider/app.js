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




