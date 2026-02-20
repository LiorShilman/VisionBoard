let images = [];
let currentZoom = 1;
let isFitScreen = false;
let currentOrientation = 'horizontal';
let currentColumns = 4;
let currentBorderColor = '#000000';

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function updateBorderColor() {
    currentBorderColor = document.getElementById('borderColorPicker').value;
    const newImages = document.querySelectorAll('.image-container img.new-image');
    newImages.forEach(image => {
        image.style.border = `3px solid ${currentBorderColor}`;
        image.classList.remove('new-image');
    });
}

function updateBackgroundColor() {
    const currentBackgroundColor = document.getElementById('backgroundColorPicker').value;
    const boardGrid = document.querySelector('#boardGrid');
    boardGrid.style.backgroundColor = currentBackgroundColor;
}

function saveCurrentPositions() {
    const containers = document.querySelectorAll('.image-container');
    containers.forEach(container => {
        const rect = container.getBoundingClientRect();
        const grid = document.querySelector('.board-grid');
        const gridRect = grid.getBoundingClientRect();
        container.setAttribute('data-current-x', rect.left - gridRect.left);
        container.setAttribute('data-current-y', rect.top - gridRect.top);
        container.setAttribute('data-current-width', rect.width);
        container.setAttribute('data-current-height', rect.height);
    });
}

function applyAbsolutePositions() {
    const containers = document.querySelectorAll('.image-container');
    containers.forEach(container => {
        const x = container.getAttribute('data-current-x');
        const y = container.getAttribute('data-current-y');
        const width = container.getAttribute('data-current-width');
        const height = container.getAttribute('data-current-height');
        container.style.position = 'absolute';
        container.style.left = x + 'px';
        container.style.top = y + 'px';
        container.style.width = width + 'px';
        container.style.height = height + 'px';
    });
}

function resetToColumns() {
    const containers = document.querySelectorAll('.image-container');
    containers.forEach(container => {
        container.style.position = '';
        container.style.left = '';
        container.style.top = '';
        container.style.transform = '';
        container.style.width = '';
        container.style.height = '';
        container.removeAttribute('data-current-x');
        container.removeAttribute('data-current-y');
        container.removeAttribute('data-current-width');
        container.removeAttribute('data-current-height');
    });
    setColumns(4);
    document.getElementById('resetToColumnsBtn').classList.add('active');
    document.getElementById('boardGrid').classList.remove('resize');
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    images.push({
                        src: e.target.result,
                        width: this.width,
                        height: this.height,
                        ratio: this.width / this.height,
                        borderColor: currentBorderColor
                    });
                    updateBoard();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function updateSize() {
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const board = document.getElementById('visionBoard');
    const width = parseInt(widthInput.value, 10);
    const height = parseInt(heightInput.value, 10);
    board.style.width = `${width}px`;
    board.style.height = `${height}px`;
    if (isFitScreen) {
        setTimeout(fitToScreen, 100);
    }
    updateBoard();
}

function setColumns(num) {
    document.querySelectorAll('.col-btn-group button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`col${num}`).classList.add('active');
    const grid = document.getElementById('boardGrid');
    grid.classList.remove('columns-2', 'columns-3', 'columns-4');
    grid.classList.add(`columns-${num}`);
    grid.setAttribute('data-columns', num);
    updateBoard();
}

function setOrientation(orientation) {
    document.querySelectorAll('#horizontalBtn, #verticalBtn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${orientation}Btn`).classList.add('active');
    const board = document.getElementById('visionBoard');
    board.className = `vision-board ${orientation}`;
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    if (orientation === 'horizontal') {
        widthInput.value = '1200';
        heightInput.value = '800';
        board.style.width = '1200px';
        board.style.height = '800px';
    } else {
        widthInput.value = '800';
        heightInput.value = '1200';
        board.style.width = '800px';
        board.style.height = '1200px';
    }
    if (isFitScreen) {
        setTimeout(fitToScreen, 100);
    }
    updateBoard();
}

function shuffleImages() {
    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    images = shuffled;
    updateBoard();
}

function updateBoard() {
    const grid = document.getElementById('boardGrid');
    grid.innerHTML = '';
    updateBackgroundColor();
    updateBorderColor();
    if (images.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                </div>
                <div class="empty-state-title">ה-Vision Board שלך ריק</div>
                <div class="empty-state-desc">העלה תמונות כדי להתחיל ליצור את לוח החזון שלך. גרור, שנה גודל וסדר את התמונות כרצונך.</div>
            </div>`;
        return;
    }
    images.forEach((image, index) => {
        const container = document.createElement('div');
        container.className = 'image-container';
        const img = document.createElement('img');
        img.src = image.src;
        img.style.border = `5px solid ${image.borderColor}`;
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteImage(index);
        };
        container.appendChild(img);
        container.appendChild(deleteBtn);
        grid.appendChild(container);
    });
    if (isFitScreen) {
        setTimeout(fitToScreen, 100);
    }
}

function deleteImage(index) {
    images.splice(index, 1);
    updateBoard();
}

function fitToScreen() {
    const wrapper = document.querySelector('.vision-board-wrapper');
    const board = document.getElementById('visionBoard');
    const padding = 40;
    const wrapperWidth = wrapper.clientWidth - padding;
    const wrapperHeight = wrapper.clientHeight - padding;
    const boardWidth = board.scrollWidth;
    const boardHeight = board.scrollHeight;
    const scaleX = wrapperWidth / boardWidth;
    const scaleY = wrapperHeight / boardHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    currentZoom = scale;
    board.style.transform = `scale(${scale})`;
    updateZoomLevel();
}

function toggleFitScreen() {
    isFitScreen = !isFitScreen;
    const btn = document.getElementById('fitScreenBtn');
    const board = document.getElementById('visionBoard');
    const grid = document.getElementById('boardGrid');
    if (isFitScreen) {
        btn.classList.add('active');
        board.classList.add('fit-screen');
        fitToScreen();
    } else {
        btn.classList.remove('active');
        grid.classList.add('can-scroll');
        board.classList.remove('fit-screen');
        board.style.transform = 'none';
        currentZoom = 1;
        updateZoomLevel();
    }
}

function adjustZoom(delta) {
    if (isFitScreen) return;
    currentZoom = Math.max(0.1, Math.min(2, currentZoom + delta));
    const board = document.getElementById('visionBoard');
    board.style.transform = `scale(${currentZoom})`;
    updateZoomLevel();
}

function updateZoomLevel() {
    document.getElementById('zoomLevel').textContent = `${Math.round(currentZoom * 100)}%`;
}

function downloadBoard() {
    const boardGrid = document.querySelector('#boardGrid');
    const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: getComputedStyle(boardGrid).backgroundColor,
        logging: false,
        windowWidth: boardGrid.scrollWidth,
        windowHeight: boardGrid.scrollHeight,
        width: boardGrid.offsetWidth,
        height: boardGrid.offsetHeight,
        scrollX: 0,
        scrollY: 0
    };
    html2canvas(boardGrid, options).then(canvas => {
        try {
            const image = canvas.toDataURL('image/png', 1.0);
            const downloadLink = document.createElement('a');
            downloadLink.href = image;
            downloadLink.download = 'vision-board.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (error) {
            console.error('Error saving board:', error);
            alert('אירעה שגיאה בשמירת הלוח. אנא נסה שנית.');
        }
    }).catch(error => {
        console.error('Error creating image:', error);
        alert('אירעה שגיאה ביצירת התמונה. אנא נסה שנית.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setColumns(4);
    setOrientation('horizontal');
    initializeInteractions();
});

window.addEventListener('resize', () => {
    if (isFitScreen) {
        fitToScreen();
    }
});

let highestZIndex = 1000;

function initializeInteractions() {
    interact('.image-container')
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrict({
                    restriction: '.board-grid',
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                })
            ],
            listeners: {
                start(event) {
                    const grid = document.querySelector('.board-grid');
                    document.querySelectorAll('.col-btn-group button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.getElementById('resetToColumnsBtn').classList.remove('active');
                    if (!grid.classList.contains('resizing')) {
                        saveCurrentPositions();
                        grid.classList.add('resizing');
                    }
                    const target = event.target;
                    highestZIndex++;
                    target.setAttribute('data-z-index', highestZIndex);
                    target.style.zIndex = highestZIndex;
                },
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            }
        })
        .resizable({
            edges: { left: true, bottom: true },
            listeners: {
                start(event) {
                    const target = event.target;
                    const grid = document.querySelector('.board-grid');
                    document.querySelectorAll('.col-btn-group button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.getElementById('resetToColumnsBtn').classList.remove('active');
                    if (!grid.classList.contains('resizing')) {
                        saveCurrentPositions();
                        grid.classList.add('resizing');
                    }
                    const aspectRatio = target.offsetWidth / target.offsetHeight;
                    target.setAttribute('data-aspect-ratio', aspectRatio);
                    if (!target.getAttribute('data-z-index')) {
                        highestZIndex++;
                        target.setAttribute('data-z-index', highestZIndex);
                    }
                    target.style.zIndex = target.getAttribute('data-z-index');
                },
                move(event) {
                    const target = event.target;
                    const aspectRatio = parseFloat(target.getAttribute('data-aspect-ratio'));
                    const newWidth = event.rect.width;
                    const newHeight = newWidth / aspectRatio;
                    const x = parseFloat(target.getAttribute('data-x')) || 0;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.deltaRect.top;
                    Object.assign(target.style, {
                        width: `${newWidth}px`,
                        height: `${newHeight}px`,
                        transform: `translate(${x}px, ${y}px)`
                    });
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            }
        });
}
