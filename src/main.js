import './style.css'

document.getElementById("fileInput").addEventListener("change", function (event) {
    console.log('triggered')
    const file = event.target.files[0];
    if (!file) return;

    console.log(file)
    previewSelectedFile(file)

});

document.getElementById('fileDelete').addEventListener('click', function (params) {
    clearSelectedFile()
})

function previewSelectedFile(file) {
    document.getElementById('dropzone').classList.add("hidden")
    const filePreviewElm = document.getElementById('file_preview');
    filePreviewElm.querySelector('#selected_file_name').textContent = file.name
    filePreviewElm.classList.remove("hidden")
}

function clearSelectedFile() {
    document.getElementById("fileInput").value = '';
    document.getElementById('dropzone').classList.remove("hidden")
    document.getElementById('file_preview').classList.add("hidden")
}