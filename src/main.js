import MyActivityParser from './MyActivityParser';
import './style.css'

document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    showSelectedFile(file);
});

document.getElementById('fileDelete').addEventListener('click', function (params) {
    clearSelectedFile()
    // reset
    setMetrics({});
    clearResultFile();
})

document.getElementById('convertBtn').addEventListener('click', function (params) {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;

    const myActivityParser = new MyActivityParser();
    myActivityParser.parseFile(file)
        .then(result => {
            setMetrics(result?.fileMetrics);
            if (result?.transactions.length) {
                let csvString = collectionToCsv(result?.transactions);
                prepareResultFile(csvString,generateResultFileName(result?.transactionMetrics));
            }
        })
})

function showSelectedFile(file) {
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

function setMetrics(metrics) {
    document.querySelector('#metric-total').textContent = metrics?.total ?? 0
    document.querySelector('#metric-matched').textContent = metrics?.matched ?? 0
    document.querySelector('#metric-unmatched').textContent = metrics?.unmatched ?? 0
}

function collectionToCsv(collection) {
    if (!collection || !collection.length) {
        return '';
    }
    let header = Object.keys(collection[0]).join(',');
    let rows = [];
    for (let index = 1; index < collection.length; index++) {
        const entry = collection[index];
        rows.push(Object.values(entry).join(','))
    }
    return [header, ...rows].join('\n');
}

function generateResultFileName(transactionMetrics) {
    if (!transactionMetrics?.firstDate || !transactionMetrics?.lastDate) {
        return 'My Activity.csv'
    }
    return `My Activity__${transactionMetrics.firstDate.slice(0, 10)}_${transactionMetrics.lastDate.slice(0, 10)}.csv`
}

function prepareResultFile(csvString, filename = 'export.csv') {
    // Create a Blob with UTF-8 encoding
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.getElementById('resultFileLink');
    link.href = url;
    link.setAttribute('download', filename);

    document.querySelector('#resultFileLink span').textContent = filename

    document.getElementById('resultFile').classList.remove("hidden")
    document.getElementById('noResultFile').classList.add("hidden")
}

function clearResultFile() {
    const link = document.getElementById('resultFileLink');
    link.href = '#';
    link.removeAttribute('download');

    document.getElementById('resultFile').classList.add("hidden")
    document.getElementById('noResultFile').classList.remove("hidden")
}