export class SelectionManager {
    constructor(sceneManager, buildingManager) {
        this.sceneManager = sceneManager;
        this.buildingManager = buildingManager;
        this.selectedBuilding = null;
        this.selectionBox = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createSelectionBox();
    }

    setupEventListeners() {
        const canvas = this.sceneManager.renderer.domElement;

        canvas.addEventListener('click', (event) => {
            if (this.sceneManager.drawingManager?.drawingMode) return;

            const building = this.buildingManager.getBuildingAtPosition({
                x: event.clientX,
                y: event.clientY
            });

            if (building) {
                this.selectBuilding(building);
            } else {
                this.deselectBuilding();
            }
        });
    }

    createSelectionBox() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({
            color: 0xffff00,
            linewidth: 3
        });

        this.selectionBox = new THREE.LineSegments(edges, material);
        this.selectionBox.visible = false;
        this.sceneManager.addObject(this.selectionBox);
    }

    selectBuilding(building) {
        if (this.selectedBuilding === building) return;

        this.deselectBuilding();

        this.selectedBuilding = building;
        building.isSelected = true;

        if (building.mesh) {
            const box = new THREE.Box3().setFromObject(building.mesh);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            this.selectionBox.scale.copy(size);
            this.selectionBox.position.copy(center);
            this.selectionBox.visible = true;

            building.addHighlight();
        }

        if (this.onBuildingSelected) {
            this.onBuildingSelected(building);
        }
    }

    deselectBuilding() {
        if (this.selectedBuilding) {
            this.selectedBuilding.isSelected = false;
            this.selectedBuilding.removeHighlight();
            this.selectedBuilding = null;
        }

        this.selectionBox.visible = false;

        if (this.onBuildingDeselected) {
            this.onBuildingDeselected();
        }
    }
}
