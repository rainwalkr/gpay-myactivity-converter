import MyActivityParser from './MyActivityParser';
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
    // reset metrics
    previewMetrics({})
})

document.getElementById('convertBtn').addEventListener('click', function (params) {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;

    const myActivityParser = new MyActivityParser();
    myActivityParser.parseFile(file)
        .then(result => {
            previewMetrics(result?.metrics);
        })
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

function previewMetrics(metrics) {
    document.querySelector('#metric-total').textContent = metrics?.total ?? 0
    document.querySelector('#metric-matched').textContent = metrics?.matched ?? 0
    document.querySelector('#metric-unmatched').textContent = metrics?.unmatched ?? 0
}