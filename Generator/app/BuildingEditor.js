import { ARCHITECTURE } from './constants.js';

export class BuildingEditor {
    constructor(buildingManager) {
        this.buildingManager = buildingManager;
        this.currentBuilding = null;
        this.currentFloor = null;
        this.container = document.getElementById('editor-container');
    }

    show(building) {
        this.currentBuilding = building;
        this.currentFloor = null;
        this.updateUI();
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
        this.currentBuilding = null;
        this.currentFloor = null;
    }

    updateUI() {
        if (!this.currentBuilding) return;

        const building = this.currentBuilding;
        const typeNames = {
            'RESIDENTIAL': 'Жилой комплекс',
            'SKYSCRAPER': 'Небоскрёб',
            'COMMERCIAL': 'Бизнес-центр',
            'HOUSE': 'Особняк'
        };

        const html = `
            <h3 style="margin: 0 0 12px 0; color: #64b5f6; border-bottom: 1px solid rgba(100, 181, 246, 0.3); padding-bottom: 6px;">
                🏢 Редактор: ${typeNames[building.type] || building.type}
            </h3>

            <!-- Основные параметры здания -->
            <div style="margin-bottom: 15px; background: rgba(64, 156, 255, 0.1); padding: 10px; border-radius: 5px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <div>
                        <div style="color: #8a9ba8; font-size: 11px;">Этажи</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button id="btn-remove-floor" style="padding: 4px 8px; font-size: 16px; background: rgba(255,255,255,0.1); border: none; color: white; border-radius: 3px; cursor: pointer;">-</button>
                            <span style="font-weight: 600; min-width: 30px; text-align: center;">${building.totalFloors}</span>
                            <button id="btn-add-floor" style="padding: 4px 8px; font-size: 16px; background: rgba(255,255,255,0.1); border: none; color: white; border-radius: 3px; cursor: pointer;">+</button>
                        </div>
                    </div>
                    <div>
                        <div style="color: #8a9ba8; font-size: 11px;">Высота</div>
                        <div style="font-weight: 600;">${building.getTotalHeight().toFixed(1)} м</div>
                    </div>
                </div>

                <div class="slider-container">
                    <div class="slider-label">
                        <span>Ширина здания</span>
                        <span id="width-value" class="slider-value">${building.baseWidth.toFixed(1)} м</span>
                    </div>
                    <input type="range" id="width-slider" min="10" max="50" step="0.5"
                           value="${building.baseWidth}" style="width: 100%;">
                </div>

                <div class="slider-container">
                    <div class="slider-label">
                        <span>Глубина здания</span>
                        <span id="depth-value" class="slider-value">${building.baseDepth.toFixed(1)} м</span>
                    </div>
                    <input type="range" id="depth-slider" min="10" max="50" step="0.5"
                           value="${building.baseDepth}" style="width: 100%;">
                </div>
            </div>

            <!-- Список этажей -->
            <h4 style="margin: 15px 0 8px 0; color: #a0c8ff;">Редактирование этажей</h4>
            <div id="floors-list" style="margin-bottom: 15px;">
                ${this.renderFloorsList()}
            </div>

            <!-- Редактор выбранного этажа -->
            <div id="floor-editor" style="display: ${this.currentFloor ? 'block' : 'none'};">
                ${this.currentFloor ? this.renderFloorEditor() : ''}
            </div>

            <!-- Управление -->
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <button id="btn-delete" style="width: 100%; padding: 10px; background: rgba(244, 67, 54, 0.2);
                        border: 1px solid rgba(244, 67, 54, 0.3); border-radius: 5px; color: #ff8a80;
                        font-weight: 500; cursor: pointer; font-size: 13px;">
                    🗑️ Удалить это здание
                </button>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupEventListeners();
    }

    renderFloorsList() {
        if (!this.currentBuilding) return '';

        let html = '';
        for (let i = 0; i < this.currentBuilding.floors.length; i++) {
            const floor = this.currentBuilding.floors[i];
            const isActive = this.currentFloor && this.currentFloor.number === i;

            html += `
                <div class="floor-item ${isActive ? 'active' : ''}" data-floor="${i}">
                    <div class="floor-header">
                        <span class="floor-number">Этаж ${i}</span>
                        <span class="floor-height">${floor.height.toFixed(1)} м</span>
                    </div>
                    <div style="font-size: 11px; color: #8a9ba8;">
                        ${floor.material} • ${this.getWindowName(floor.windowType)}
                    </div>
                </div>
            `;
        }
        return html;
    }

    renderFloorEditor() {
        if (!this.currentFloor) return '';

        const floor = this.currentFloor;

        return `
            <div style="background: rgba(35, 35, 50, 0.8); padding: 12px; border-radius: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #a0c8ff;">Этаж ${floor.number}</h4>
                    <button id="btn-close-floor" style="background: none; border: none; color: #8a9ba8; cursor: pointer; font-size: 16px;">×</button>
                </div>

                <div class="slider-container">
                    <div class="slider-label">
                        <span>Высота этажа</span>
                        <span id="floor-height-value" class="slider-value">${floor.height.toFixed(1)} м</span>
                    </div>
                    <input type="range" id="floor-height-slider" min="2.5" max="5" step="0.1"
                           value="${floor.height}" style="width: 100%;">
                </div>

                <div style="margin: 12px 0;">
                    <div style="color: #8a9ba8; font-size: 11px; margin-bottom: 6px;">Геометрия этажа</div>
                    <div style="display: flex; gap: 6px;">
                        ${['RECTANGULAR', 'CIRCULAR'].map(type => `
                            <button class="geometry-btn ${floor.geometryType === type ? 'active' : ''}"
                                    data-geometry="${type}"
                                    style="flex: 1; padding: 6px; font-size: 11px; background: ${floor.geometryType === type ? 'rgba(100, 181, 246, 0.3)' : 'rgba(255,255,255,0.1)'}; border: 1px solid ${floor.geometryType === type ? 'rgba(100, 181, 246, 0.5)' : 'rgba(255,255,255,0.2)'}; color: white; border-radius: 3px; cursor: pointer;">
                                ${this.getGeometryName(type)}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div style="margin: 12px 0;">
                    <div style="color: #8a9ba8; font-size: 11px; margin-bottom: 6px;">Материал фасада</div>
                    <div class="material-selector">
                        ${Object.keys(ARCHITECTURE.MATERIALS).map(mat => `
                            <div class="material-option ${floor.material === mat ? 'active' : ''}"
                                 data-material="${mat}"
                                 style="background: #${ARCHITECTURE.MATERIALS[mat].color.toString(16).padStart(6, '0')};">
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="margin: 12px 0;">
                    <div style="color: #8a9ba8; font-size: 11px; margin-bottom: 6px;">Тип окон</div>
                    <div style="display: flex; gap: 6px;">
                        ${Object.keys(ARCHITECTURE.WINDOW_TYPES).map(type => `
                            <button class="window-btn ${floor.windowType === type ? 'active' : ''}"
                                    data-window="${type}"
                                    style="flex: 1; padding: 6px; font-size: 11px; background: ${floor.windowType === type ? 'rgba(100, 181, 246, 0.3)' : 'rgba(255,255,255,0.1)'}; border: 1px solid ${floor.windowType === type ? 'rgba(100, 181, 246, 0.5)' : 'rgba(255,255,255,0.2)'}; color: white; border-radius: 3px; cursor: pointer;">
                                ${this.getWindowName(type)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getGeometryName(type) {
        const names = {
            'RECTANGULAR': 'Прямоугольная',
            'CIRCULAR': 'Круглая'
        };
        return names[type] || type;
    }

    getWindowName(type) {
        const names = {
            'OFFICE': 'Офисные',
            'RESIDENTIAL': 'Жилые',
            'PANORAMIC': 'Панорамные',
            'SMALL': 'Малые'
        };
        return names[type] || type;
    }

    setupEventListeners() {
        if (!this.currentBuilding) return;

        const btnAddFloor = document.getElementById('btn-add-floor');
        const btnRemoveFloor = document.getElementById('btn-remove-floor');

        if (btnAddFloor) {
            btnAddFloor.addEventListener('click', () => {
                this.currentBuilding.addFloor();
                this.currentFloor = null;
                this.updateUI();
            });
        }

        if (btnRemoveFloor) {
            btnRemoveFloor.addEventListener('click', () => {
                this.currentBuilding.removeFloor();
                this.currentFloor = null;
                this.updateUI();
            });
        }

        const widthSlider = document.getElementById('width-slider');
        const depthSlider = document.getElementById('depth-slider');

        if (widthSlider) {
            widthSlider.addEventListener('input', (e) => {
                const newWidth = parseFloat(e.target.value);
                this.currentBuilding.baseWidth = newWidth;
                document.getElementById('width-value').textContent = newWidth.toFixed(1) + ' м';
                this.currentBuilding.updateBuilding();
            });
        }

        if (depthSlider) {
            depthSlider.addEventListener('input', (e) => {
                const newDepth = parseFloat(e.target.value);
                this.currentBuilding.baseDepth = newDepth;
                document.getElementById('depth-value').textContent = newDepth.toFixed(1) + ' м';
                this.currentBuilding.updateBuilding();
            });
        }

        document.querySelectorAll('.floor-item').forEach(item => {
            item.addEventListener('click', () => {
                const floorIndex = parseInt(item.dataset.floor);
                this.currentFloor = this.currentBuilding.getFloor(floorIndex);
                this.updateUI();
            });
        });

        if (this.currentFloor) {
            const btnCloseFloor = document.getElementById('btn-close-floor');
            if (btnCloseFloor) {
                btnCloseFloor.addEventListener('click', () => {
                    this.currentFloor = null;
                    this.updateUI();
                });
            }

            const heightSlider = document.getElementById('floor-height-slider');
            if (heightSlider) {
                heightSlider.addEventListener('input', (e) => {
                    const newHeight = parseFloat(e.target.value);
                    this.currentFloor.height = newHeight;
                    document.getElementById('floor-height-value').textContent = newHeight.toFixed(1) + ' м';

                    this.currentBuilding.updateFloor(this.currentFloor.number, {
                        height: newHeight
                    });
                });
            }

            document.querySelectorAll('.geometry-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const geometry = btn.dataset.geometry;
                    this.currentFloor.geometryType = geometry;
                    this.currentBuilding.updateFloor(this.currentFloor.number, {
                        geometryType: geometry
                    });
                    this.updateUI();
                });
            });

            document.querySelectorAll('.material-option').forEach(option => {
                option.addEventListener('click', () => {
                    const material = option.dataset.material;
                    this.currentFloor.material = material;
                    this.currentBuilding.updateFloor(this.currentFloor.number, {
                        material: material
                    });
                    this.updateUI();
                });
            });

            document.querySelectorAll('.window-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const windowType = btn.dataset.window;
                    this.currentFloor.windowType = windowType;
                    this.currentBuilding.updateFloor(this.currentFloor.number, {
                        windowType: windowType
                    });
                    this.updateUI();
                });
            });
        }

        const btnDelete = document.getElementById('btn-delete');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => {
                if (confirm('Удалить это здание?')) {
                    const index = this.buildingManager.buildings.indexOf(this.currentBuilding);
                    if (index > -1) {
                        this.buildingManager.sceneManager.removeObject(this.currentBuilding.mesh);
                        this.buildingManager.buildings.splice(index, 1);
                        this.buildingManager.updateStats();
                    }
                    this.hide();
                }
            });
        }
    }
}
