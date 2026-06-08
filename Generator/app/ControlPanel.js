export class ControlPanel {
    constructor(app) {
        this.app = app;
    }

    render() {
        const container = document.getElementById('ui-container');

        container.innerHTML = `
            <a href="../frontend/index.html" style="display: inline-flex; align-items: center; gap: 6px;
                    margin-bottom: 14px; color: #8a9ba8; text-decoration: none; font-size: 12px;
                    transition: color 0.2s ease;"
               onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#8a9ba8'">
                ← На сайт MapTim
            </a>

            <div class="control-section">
                <h3>Режимы</h3>
                <div class="mode-indicator">
                    <span id="mode-text">📐 Режим рисования</span>
                </div>
                <div class="compact-row">
                    <button id="btn-draw-mode" class="active">
                        <span class="icon">✏️</span> Рисовать
                    </button>
                    <button id="btn-edit-mode">
                        <span class="icon">🏢</span> Редактировать
                    </button>
                </div>
            </div>

            <div class="control-section">
                <h3>Генерация</h3>
                <div class="btn-group">
                    <button id="btn-generate" class="warning">
                        <span class="icon">🏗️</span> Сгенерировать здания
                    </button>
                    <button id="btn-clear" class="danger">
                        <span class="icon">🗑️</span> Очистить сцену
                    </button>
                </div>
            </div>

            <div class="control-section">
                <h3>Управление</h3>
                <div class="instruction">
                    <p><span class="hotkey">ЛКМ</span> - добавить точку</p>
                    <p><span class="hotkey">Двойной клик</span> или <span class="hotkey">Enter</span> - завершить полигон</p>
                    <p><span class="hotkey">ESC</span> - отмена рисования</p>
                    <p><span class="hotkey">ЛКМ + движение</span> - вращение камеры</p>
                    <p><span class="hotkey">ПКМ + движение</span> - панорамирование</p>
                    <p><span class="hotkey">Колесо</span> - масштабирование</p>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('btn-draw-mode').addEventListener('click', () => {
            this.app.drawingManager.setDrawingMode(true);
            this.app.selectionManager.deselectBuilding();
            document.getElementById('editor-container').style.display = 'none';
            this.updateMode('drawing');
        });

        document.getElementById('btn-edit-mode').addEventListener('click', () => {
            this.app.drawingManager.setDrawingMode(false);
            this.updateMode('editing');
        });

        document.getElementById('btn-generate').addEventListener('click', () => {
            this.app.generateBuildings();
        });

        document.getElementById('btn-clear').addEventListener('click', () => {
            if (confirm('Очистить всю сцену?')) {
                this.app.clearScene();
                this.updateMode('drawing');
                document.getElementById('editor-container').style.display = 'none';
            }
        });
    }

    updateMode(mode) {
        const modeText = document.getElementById('mode-text');
        const btnDraw = document.getElementById('btn-draw-mode');
        const btnEdit = document.getElementById('btn-edit-mode');

        if (mode === 'drawing') {
            modeText.textContent = '📐 Режим рисования';
            btnDraw.classList.add('active');
            btnEdit.classList.remove('active');
        } else {
            modeText.textContent = '🏢 Режим редактирования';
            btnDraw.classList.remove('active');
            btnEdit.classList.add('active');
        }
    }
}
