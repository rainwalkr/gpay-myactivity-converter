import MyActivityParser from './MyActivityParser';
import './style.css'

initTheme()

document.getElementById('themeBtn').addEventListener('click',(event) => {
    toggleTheme()
})

function initTheme(){
    document.documentElement.classList.toggle(
        THEME_DARK,
        localStorage.theme === THEME_DARK ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches));
    setThemeBtnIcon(getCurrentTheme())
}

function toggleTheme() {
    let currentTheme = getCurrentTheme()
    if ( currentTheme === THEME_SYSTEM) {
        setTheme(THEME_LIGHT)
    } else if (currentTheme === THEME_LIGHT) {
        setTheme(THEME_DARK)
    } else if (currentTheme === THEME_DARK) {
        setTheme(THEME_SYSTEM)
    } else {
        setTheme(THEME_SYSTEM)
    }
}

function setTheme(theme) {
    if (theme === THEME_LIGHT) {
        localStorage.setItem('theme',THEME_LIGHT)
        document.documentElement.classList.remove(THEME_DARK)
        setThemeBtnIcon(THEME_LIGHT) 
    } else if (theme === THEME_DARK) {
        localStorage.setItem('theme',THEME_DARK)
        document.documentElement.classList.add(THEME_DARK)
        setThemeBtnIcon(THEME_DARK)
    } else {
        // system theme
        localStorage.removeItem('theme')
        // use dark theme if OS preference is dark
        document.documentElement.classList.toggle(THEME_DARK,
            localStorage.theme === THEME_DARK || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches));
        setThemeBtnIcon(THEME_SYSTEM)
    }
}

function setThemeBtnIcon(theme) {
    document.querySelector('#themeBtn span').textContent = THEME_ICON_MAPPING[theme] ?? THEME_ICON_MAPPING[THEME_SYSTEM];
}

function getCurrentTheme() {
    return localStorage.getItem('theme') ?? THEME_SYSTEM
}


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