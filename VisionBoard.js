 let images = [];
        let currentZoom = 1;
        let isFitScreen = false;
        let currentOrientation = 'horizontal';
        let currentColumns = 3;
		let currentBorderColor = '#000000'; // צבע ברירת מחדל למסגרת (שחור)

        // מאזין לשינויים בקובץ
        document.getElementById('fileInput').addEventListener('change', handleFileSelect);


		// עדכון צבע המסגרת לפי בחירה בקלט
		function updateBorderColor() {
			currentBorderColor = document.getElementById('borderColorPicker').value;
			
			// עדכן רק תמונות חדשות עם צבע המסגרת הנבחר
			const newImages = document.querySelectorAll('.image-container img.new-image');
			newImages.forEach(image => {
				image.style.border = `3px solid ${currentBorderColor}`;
				image.classList.remove('new-image'); // הסר את המחלקה כדי לא לעדכן שוב
			});
		}
		
		// עדכון צבע המסגרת לפי בחירה בקלט
		function updateBackgroundColor() {
			const currentBackgroundColor = document.getElementById('backgroundColorPicker').value;
			
			// עדכן את צבע הרקע של boardGrid
			const boardGrid = document.querySelector('#boardGrid');
			boardGrid.style.backgroundColor = currentBackgroundColor;
		}
	

        // טיפול בהעלאת תמונות
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
								borderColor: currentBorderColor // שמירה של צבע המסגרת הנוכחי
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

			// Update the width and height of the vision board
			const width = parseInt(widthInput.value, 10);
			const height = parseInt(heightInput.value, 10);

			board.style.width = `${width}px`;
			board.style.height = `${height}px`;

			// Update the display if 'fit to screen' mode is active
			if (isFitScreen) {
				setTimeout(fitToScreen, 100);
			}

			// Adjust image display after resizing
			updateBoard();
		}

       // עדכון פונקציית setColumns
		function setColumns(num) {
			// עדכון כפתורים
			document.querySelectorAll('.column-controls button').forEach(btn => {
				btn.classList.remove('active');
			});
			document.getElementById(`col${num}`).classList.add('active');
			
			// עדכון הגריד
			const grid = document.getElementById('boardGrid');
			
			// הסרת כל ה-classes הקודמים של העמודות
			grid.classList.remove('columns-2', 'columns-3', 'columns-4');
			
			// הוספת ה-class החדש
			grid.classList.add(`columns-${num}`);
			
			// אם אתה משתמש ב-data attributes, הוסף גם אותם
			grid.setAttribute('data-columns', num);
			
			// עדכון התצוגה
			updateBoard();
		}

        // החלפת כיוון
        function setOrientation(orientation) {
			// עדכון כפתורים
			document.querySelectorAll('#horizontalBtn, #verticalBtn').forEach(btn => {
				btn.classList.remove('active');
			});
			document.getElementById(`${orientation}Btn`).classList.add('active');
			
			const board = document.getElementById('visionBoard');
			board.className = `vision-board ${orientation}`;
			
			// עדכון שדות הקלט
			const widthInput = document.getElementById('widthInput');
			const heightInput = document.getElementById('heightInput');
			
			if (orientation === 'horizontal') {
				widthInput.value = '1200';
				heightInput.value = '800';
				board.style.width = '1200px';
				board.style.height = '800px';
			} else { // vertical
				widthInput.value = '800';
				heightInput.value = '1200';
				board.style.width = '800px';
				board.style.height = '1200px';
			}
			
			// אם במצב התאמה למסך, עדכן את הסקיילינג
			if (isFitScreen) {
				setTimeout(fitToScreen, 100);
			}
			
			// עדכון תצוגת התמונות
			updateBoard();
		}

        // ערבוב תמונות
        function shuffleImages() {
            // יצירת עותק של המערך
            const shuffled = [...images];

            // Fisher-Yates shuffle algorithm
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            images = shuffled;
            updateBoard();
        }

        // עדכון הלוח
        // עדכון פונקציית updateBoard
		function updateBoard() {
			const grid = document.getElementById('boardGrid');
			grid.innerHTML = '';
			
			updateBackgroundColor();
			updateBorderColor();
			
			if (images.length === 0) {
				grid.innerHTML = '<div class="empty-state">העלה תמונות כדי להתחיל ליצור את ה-Vision Board שלך</div>';
				return;
			}
			
			images.forEach((image, index) => {
				const container = document.createElement('div');
				container.className = 'image-container';
				
				const img = document.createElement('img');
				img.src = image.src;
				img.style.border = `5px solid ${image.borderColor}`; // החלת צבע המסגרת השמור
				
				const deleteBtn = document.createElement('button');
				deleteBtn.className = 'delete-btn';
				deleteBtn.innerHTML = '×';
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

        // מחיקת תמונה
        function deleteImage(index) {
            images.splice(index, 1);
            updateBoard();
        }

		
        // התאמה למסך
        function fitToScreen() {
			const wrapper = document.querySelector('.vision-board-wrapper');
			const board = document.getElementById('visionBoard');
			
			const padding = 40; // רווח ביטחון
			const wrapperWidth = wrapper.clientWidth - padding;
			const wrapperHeight = wrapper.clientHeight - padding;
			
			const boardWidth = board.scrollWidth;
			const boardHeight = board.scrollHeight;
			
			// חישוב יחס הקטנה/הגדלה
			const scaleX = wrapperWidth / boardWidth;
			const scaleY = wrapperHeight / boardHeight;
			const scale = Math.min(scaleX, scaleY, 1); // לא להגדיל מעבר לגודל המקורי
			
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


        // עדכון זום
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
			// מציג אינדיקציה שהשמירה בתהליך
			//const saveButton = document.querySelector('.save-image-btn');
			//const originalText = saveButton.innerHTML;
			//saveButton.innerHTML = 'שומר...';
			//saveButton.disabled = true;

			// מקבל את אלמנט הלוח
			const boardGrid = document.querySelector('#boardGrid');
			
			// הגדרות מתקדמות ל-html2canvas
			const options = {
				scale: 2, // איכות גבוהה יותר
				useCORS: true, // תמיכה בתמונות מדומיינים חיצוניים
				allowTaint: true,
				backgroundColor: getComputedStyle(boardGrid).backgroundColor,
				logging: false,
				windowWidth: boardGrid.scrollWidth,
				windowHeight: boardGrid.scrollHeight,
				// שומר על הגדרות הגודל המקוריות של הלוח
				width: boardGrid.offsetWidth,
				height: boardGrid.offsetHeight,
				// מונע שבירת תוכן
				scrollX: 0,
				scrollY: 0
			};

			// יצירת התמונה
			html2canvas(boardGrid, options).then(canvas => {
				try {
					// יצירת תמונה באיכות מקסימלית
					const image = canvas.toDataURL('image/png', 1.0);
					
					// יצירת אלמנט הורדה
					const downloadLink = document.createElement('a');
					downloadLink.href = image;
					downloadLink.download = 'vision-board.png';
					
					// הורדה אוטומטית
					document.body.appendChild(downloadLink);
					downloadLink.click();
					document.body.removeChild(downloadLink);
					
					// החזרת הכפתור למצב הרגיל
					//saveButton.innerHTML = originalText;
					//saveButton.disabled = false;
				} catch (error) {
					console.error('שגיאה בשמירת הלוח:', error);
					alert('אירעה שגיאה בשמירת הלוח. אנא נסה שנית.');
					saveButton.innerHTML = originalText;
					saveButton.disabled = false;
				}
			}).catch(error => {
				console.error('שגיאה ביצירת התמונה:', error);
				alert('אירעה שגיאה ביצירת התמונה. אנא נסה שנית.');
				saveButton.innerHTML = originalText;
				saveButton.disabled = false;
			});
		}
			
        // אתחול
        document.addEventListener('DOMContentLoaded', () => {
            setColumns(4);
            setOrientation('horizontal');
        });
		
		// הוספת האזנה לשינויי גודל חלון
		window.addEventListener('resize', () => {
			if (isFitScreen) {
				fitToScreen();
			}
		});

    document.addEventListener('DOMContentLoaded', () => {
        initializeInteractions();
    });

    let highestZIndex = 1000; // משתנה גלובלי לזיהוי ה-z-index הגבוה ביותר

    function initializeInteractions() {
        interact('.image-container')
            .draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrict({
                        restriction: '.board-grid',
                        elementRect: {
                            top: 0,
                            left: 0,
                            bottom: 1,
                            right: 1
                        }
                    })
                ],
                listeners: {
                    start(event) {
                        const target = event.target;
                        
                        // עדכון ה-z-index לגבוה ביותר בעת כל התחלת גרירה
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

						// שמור על יחס הרוחב/גובה המקורי
						const aspectRatio = target.offsetWidth / target.offsetHeight;
						target.setAttribute('data-aspect-ratio', aspectRatio);

						// אם אין z-index שמור, עדכן אותו
						if (!target.getAttribute('data-z-index')) {
							highestZIndex++;
							target.setAttribute('data-z-index', highestZIndex);
						}

						// תמיד להשתמש ב-z-index הגבוה ביותר מהתכונה
						target.style.zIndex = target.getAttribute('data-z-index');
					},
					move(event) {
						const target = event.target;

						// קבל את יחס הרוחב/גובה המקורי
						const aspectRatio = parseFloat(target.getAttribute('data-aspect-ratio'));

						// שמור על יחס הרוחב/גובה
						const newWidth = event.rect.width;
						const newHeight = newWidth / aspectRatio;  // מחשבים את הגובה בהתאם ליחס

						// שמור על מיקום ה-X המקורי
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
	</script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js"></script>