import { SceneManager } from './SceneManager.js';
import { DrawingManager } from './DrawingManager.js';
import { BuildingManager } from './BuildingManager.js';
import { SelectionManager } from './SelectionManager.js';
import { ControlPanel } from './ControlPanel.js';
import { BuildingEditor } from './BuildingEditor.js';

export class App {
    constructor() {
        console.log('Запуск архитектурного редактора...');

        this.sceneManager = new SceneManager();
        this.drawingManager = new DrawingManager(this.sceneManager);
        this.buildingManager = new BuildingManager(this.sceneManager);
        this.selectionManager = new SelectionManager(this.sceneManager, this.buildingManager);
        this.controlPanel = new ControlPanel(this);
        this.buildingEditor = new BuildingEditor(this.buildingManager);

        this.sceneManager.drawingManager = this.drawingManager;
        this.setupEventListeners();
        this.setupFPSCounter();

        console.log('Редактор инициализирован');
    }

    setupEventListeners() {
        this.drawingManager.onPolygonComplete = (polygon) => {
            console.log('Полигон завершен, точек:', polygon.length);
            this.buildingManager.setPolygon(polygon);
            this.controlPanel.updateMode('editing');
        };

        this.selectionManager.onBuildingSelected = (building) => {
            console.log('Здание выбрано:', building.type);
            this.buildingEditor.show(building);
        };

        this.selectionManager.onBuildingDeselected = () => {
            console.log('Здание отменено');
            this.buildingEditor.hide();
        };
    }

    start() {
        this.sceneManager.animate();
        this.controlPanel.render();
        console.log('Редактор запущен');
    }

    setupFPSCounter() {
        let frameCount = 0;
        let lastTime = performance.now();

        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                const fpsElement = document.getElementById('stat-fps');
                if (fpsElement) {
                    fpsElement.textContent = fps;
                }
                frameCount = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(updateFPS);
        };

        updateFPS();
    }

    clearScene() {
        this.buildingManager.clearBuildings();
        this.drawingManager.clearPolygon();
        this.selectionManager.deselectBuilding();
        this.buildingEditor.hide();
        console.log('Сцена очищена');
    }

    generateBuildings() {
        console.log('Генерация реалистичных зданий...');
        this.buildingManager.generateBuildings();
        this.controlPanel.updateMode('editing');
    }
}
