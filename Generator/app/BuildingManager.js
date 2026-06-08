import { Building } from './Building.js';
import { MathUtils } from './constants.js';

export class BuildingManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.buildings = [];
        this.polygon = null;
        this.buildingTypes = [
            { type: 'RESIDENTIAL', name: 'Жилой комплекс', weight: 0.4 },
            { type: 'SKYSCRAPER', name: 'Небоскрёб', weight: 0.15 },
            { type: 'COMMERCIAL', name: 'Бизнес-центр', weight: 0.25 },
            { type: 'HOUSE', name: 'Особняк', weight: 0.2 }
        ];
    }

    setPolygon(polygon) {
        this.polygon = polygon;
        console.log('Полигон установлен, точек:', polygon ? polygon.length : 0);
    }

    generateBuildings() {
        if (!this.polygon || this.polygon.length < 3) {
            alert('Сначала нарисуйте полигон (минимум 3 точки)');
            return;
        }

        this.clearBuildings();
        const positions = this.generateBuildingPositions();

        console.log('Доступные позиции для зданий:', positions.length);

        positions.forEach((position, index) => {
            const buildingType = this.selectRandomBuildingType();
            const building = new Building(position, buildingType);

            switch(buildingType) {
                case 'SKYSCRAPER':
                    building.baseWidth = MathUtils.randomFloat(20, 30);
                    building.baseDepth = MathUtils.randomFloat(20, 30);
                    building.roofType = Math.random() > 0.5 ? 'FLAT' : 'SLOPED';
                    break;
                case 'RESIDENTIAL':
                    building.baseWidth = MathUtils.randomFloat(15, 25);
                    building.baseDepth = MathUtils.randomFloat(15, 25);
                    building.roofType = 'SLOPED';
                    break;
                case 'COMMERCIAL':
                    building.baseWidth = MathUtils.randomFloat(25, 40);
                    building.baseDepth = MathUtils.randomFloat(25, 40);
                    building.roofType = 'FLAT';
                    break;
                case 'HOUSE':
                    building.baseWidth = MathUtils.randomFloat(10, 15);
                    building.baseDepth = MathUtils.randomFloat(12, 18);
                    building.roofType = Math.random() > 0.3 ? 'SLOPED' : 'FLAT';
                    break;
            }

            this.sceneManager.addObject(building.mesh);
            this.buildings.push(building);

            console.log(`Создано здание ${index + 1}: ${buildingType} в позиции (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
        });

        console.log(`Всего создано ${this.buildings.length} зданий`);
        this.updateStats();
    }

    generateBuildingPositions() {
        const positions = [];
        if (!this.polygon || this.polygon.length < 3) {
            console.log('Полигон не установлен или меньше 3 точек');
            return positions;
        }

        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        this.polygon.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minZ = Math.min(minZ, point.z);
            maxZ = Math.max(maxZ, point.z);
        });

        console.log('Границы полигона:', { minX, maxX, minZ, maxZ });

        const attempts = 50;
        const minSpacing = 35;

        for (let attempt = 0; attempt < attempts; attempt++) {
            const x = MathUtils.randomFloat(minX + 10, maxX - 10);
            const z = MathUtils.randomFloat(minZ + 10, maxZ - 10);

            if (this.isPointInPolygon(x, z)) {
                let tooClose = false;
                for (const pos of positions) {
                    const dx = x - pos.x;
                    const dz = z - pos.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);

                    if (distance < minSpacing) {
                        tooClose = true;
                        break;
                    }
                }

                if (!tooClose) {
                    positions.push(new THREE.Vector3(x, 0, z));
                    console.log(`Найдена позиция ${positions.length}: (${x.toFixed(1)}, ${z.toFixed(1)})`);

                    if (positions.length >= 6) break;
                }
            }
        }

        return positions;
    }

    isPointInPolygon(x, z) {
        if (!this.polygon || this.polygon.length < 3) return false;

        let inside = false;
        const n = this.polygon.length;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const xi = this.polygon[i].x;
            const zi = this.polygon[i].z;
            const xj = this.polygon[j].x;
            const zj = this.polygon[j].z;

            const intersect = ((zi > z) !== (zj > z)) &&
                (x < (xj - xi) * (z - zi) / (zj - zi) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    }

    selectRandomBuildingType() {
        const totalWeight = this.buildingTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;

        for (const type of this.buildingTypes) {
            if (random < type.weight) {
                return type.type;
            }
            random -= type.weight;
        }

        return 'RESIDENTIAL';
    }

    clearBuildings() {
        this.buildings.forEach(building => {
            if (building.mesh) {
                this.sceneManager.removeObject(building.mesh);
            }
        });
        this.buildings = [];
        this.updateStats();
    }

    getBuildingAtPosition(position) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = (position.x / window.innerWidth) * 2 - 1;
        mouse.y = -(position.y / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, this.sceneManager.camera);

        for (const building of this.buildings) {
            if (!building.mesh) continue;
            const intersects = raycaster.intersectObject(building.mesh, true);
            if (intersects.length > 0) {
                return building;
            }
        }

        return null;
    }

    updateStats() {
        const totalFloors = this.buildings.reduce((sum, b) => sum + b.totalFloors, 0);
        const statsDiv = document.getElementById('stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="stat-row">
                    <span class="stat-label">Здания:</span>
                    <span class="stat-value">${this.buildings.length}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Этажи:</span>
                    <span class="stat-value">${totalFloors}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">FPS:</span>
                    <span id="stat-fps" class="stat-value">60</span>
                </div>
            `;
        }
    }
}
