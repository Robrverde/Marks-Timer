let timer;
let isRunning = false;
let startTime;
let elapsedTime = 0;

const timerDisplay = document.getElementById('timer');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const highlightBtn = document.getElementById('highlightBtn');
const correctionBtn = document.getElementById('correctionBtn');
const savePdfBtn = document.getElementById('savePdfBtn');
const highlightList = document.getElementById('highlightList');
const correctionList = document.getElementById('correctionList');
const pdfTitleInput = document.getElementById('pdfTitle');

startStopBtn.addEventListener('click', startStopTimer);
resetBtn.addEventListener('click', confirmReset);
highlightBtn.addEventListener('click', () => markTime('highlight'));
correctionBtn.addEventListener('click', () => markTime('correction'));
savePdfBtn.addEventListener('click', createPdf);
document.addEventListener('keydown', handleKeyPress);

function startStopTimer() {
    if (isRunning) {
        clearInterval(timer);
        elapsedTime += Date.now() - startTime;
        startStopBtn.textContent = 'Start';
    } else {
        startTime = Date.now();
        timer = setInterval(updateTimer, 1000);
        startStopBtn.textContent = 'Stop';
    }
    isRunning = !isRunning;
}

function confirmReset() {
    const totalMarkers = highlightList.children.length + correctionList.children.length;
    if (totalMarkers > 10) {
        const confirmed = confirm("Hay más de 10 marcadores creados. ¿Estás seguro de que deseas resetear el cronómetro?");
        if (confirmed) {
            resetTimer();
        }
    } else {
        resetTimer();
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = 0;
    timerDisplay.textContent = '00:00:00';
    startStopBtn.textContent = 'Start';
    highlightList.innerHTML = '';
    correctionList.innerHTML = '';
    localStorage.removeItem('highlightMarks');
    localStorage.removeItem('correctionMarks');
}

function updateTimer() {
    const totalElapsedTime = elapsedTime + (Date.now() - startTime);
    const hours = Math.floor(totalElapsedTime / 3600000);
    const minutes = Math.floor((totalElapsedTime % 3600000) / 60000);
    const seconds = Math.floor((totalElapsedTime % 60000) / 1000);
    
    timerDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
    return number.toString().padStart(2, '0');
}

function markTime(type) {
    if (!isRunning) return;
    
    const totalElapsedTime = elapsedTime + (Date.now() - startTime);
    const hours = Math.floor(totalElapsedTime / 3600000);
    const minutes = Math.floor((totalElapsedTime % 3600000) / 60000);
    const seconds = Math.floor((totalElapsedTime % 60000) / 1000);
    
    const timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    const listItem = document.createElement('li');
    listItem.classList.add(type);
    
    const timeSpan = document.createElement('span');
    timeSpan.textContent = timeString;
    
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = 'Escribe una nota...';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar';
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.style.display = 'none';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';

    noteInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            saveNote();
            event.preventDefault();
        }
    });

    noteInput.addEventListener('focus', () => {
        document.removeEventListener('keydown', handleKeyPress);
    });

    noteInput.addEventListener('blur', () => {
        document.addEventListener('keydown', handleKeyPress);
    });

    function saveNote() {
        noteInput.disabled = true;
        saveBtn.style.display = 'none';
        editBtn.style.display = 'inline';
    }

    saveBtn.addEventListener('click', saveNote);
    
    editBtn.addEventListener('click', () => {
        noteInput.disabled = false;
        saveBtn.style.display = 'inline';
        editBtn.style.display = 'none';
        noteInput.focus();
    });

    deleteBtn.addEventListener('click', () => {
        listItem.remove();
    });
    
    listItem.appendChild(timeSpan);
    listItem.appendChild(noteInput);
    listItem.appendChild(saveBtn);
    listItem.appendChild(editBtn);
    listItem.appendChild(deleteBtn);
    
    if (type === 'highlight') {
        highlightList.appendChild(listItem);
    } else if (type === 'correction') {
        correctionList.appendChild(listItem);
    }

    // Auto-focus the input field for editing
    noteInput.focus();
    noteInput.value = '';  // Ensure the input field is empty
}

function saveMarksToLocalStorage() {
    const highlightMarks = [];
    highlightList.querySelectorAll('li').forEach(item => {
        const time = item.querySelector('span').textContent;
        const note = item.querySelector('input').value;
        highlightMarks.push({ time, note });
    });
    
    const correctionMarks = [];
    correctionList.querySelectorAll('li').forEach(item => {
        const time = item.querySelector('span').textContent;
        const note = item.querySelector('input').value;
        correctionMarks.push({ time, note });
    });
    
    localStorage.setItem('highlightMarks', JSON.stringify(highlightMarks));
    localStorage.setItem('correctionMarks', JSON.stringify(correctionMarks));
}

function loadMarksFromLocalStorage() {
    // Intentionally left blank to not load previous session marks
}

function addMarkToList(type, time, note) {
    const listItem = document.createElement('li');
    listItem.classList.add(type);
    
    const timeSpan = document.createElement('span');
    timeSpan.textContent = time;
    
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.value = note;
    noteInput.disabled = true;
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar';
    saveBtn.style.display = 'none';
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    
    editBtn.addEventListener('click', () => {
        noteInput.disabled = false;
        saveBtn.style.display = 'inline';
        editBtn.style.display = 'none';
        noteInput.focus();
    });

    noteInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            saveNote();
            event.preventDefault();
        }
    });

    noteInput.addEventListener('focus', () => {
        document.removeEventListener('keydown', handleKeyPress);
    });

    noteInput.addEventListener('blur', () => {
        document.addEventListener('keydown', handleKeyPress);
    });

    function saveNote() {
        noteInput.disabled = true;
        saveBtn.style.display = 'none';
        editBtn.style.display = 'inline';
    }

    saveBtn.addEventListener('click', saveNote);

    deleteBtn.addEventListener('click', () => {
        listItem.remove();
    });
    
    listItem.appendChild(timeSpan);
    listItem.appendChild(noteInput);
    listItem.appendChild(saveBtn);
    listItem.appendChild(editBtn);
    listItem.appendChild(deleteBtn);
    
    if (type === 'highlight') {
        highlightList.appendChild(listItem);
    } else if (type === 'correction') {
        correctionList.appendChild(listItem);
    }
}

function createPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pdfTitle = pdfTitleInput.value || 'Podcast Time Marks';

    doc.setFontSize(16);
    doc.text(pdfTitle, 10, 10);

    doc.setFontSize(12);
    doc.text('Highlights', 10, 20);
    let yOffset = 30;
    highlightList.querySelectorAll('li').forEach(item => {
        const time = item.querySelector('span').textContent;
        const note = item.querySelector('input').value;
        doc.text(`${time}: ${note}`, 10, yOffset);
        yOffset += 10;
    });

    doc.text('Correcciones', 10, yOffset + 10);
    yOffset += 20;
    correctionList.querySelectorAll('li').forEach(item => {
        const time = item.querySelector('span').textContent;
        const note = item.querySelector('input').value;
        doc.text(`${time}: ${note}`, 10, yOffset);
        yOffset += 10;
    });

    doc.save(`${pdfTitle}.pdf`);
}

function handleKeyPress(event) {
    if (document.activeElement.tagName.toLowerCase() !== 'input') {
        if (event.key === '1') {
            event.preventDefault();
            markTime('highlight');
        } else if (event.key === '2') {
            event.preventDefault();
            markTime('correction');
        }
    }
}

