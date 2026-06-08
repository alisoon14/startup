import { Floor } from './Floor.js';

export class Building {
    constructor(position, type = 'RESIDENTIAL') {
        this.position = position || new THREE.Vector3(0, 0, 0);
        this.type = type;
        this.floors = [];
        this.totalFloors = this.getDefaultFloorCount();
        this.baseWidth = 15;
        this.baseDepth = 15;
        this.roofType = 'FLAT';

        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        this.isSelected = false;
        this.highlightMesh = null;

        this.createFoundation();
        this.createFloors();
        this.createRoof();
    }

    getDefaultFloorCount() {
        switch(this.type) {
            case 'SKYSCRAPER': return 40;
            case 'RESIDENTIAL': return 12;
            case 'COMMERCIAL': return 8;
            case 'HOUSE': return 3;
            default: return 10;
        }
    }

    createFoundation() {
        const foundationGeometry = new THREE.BoxGeometry(
            this.baseWidth + 2,
            1.5,
            this.baseDepth + 2
        );

        const foundationMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });

        const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
        foundation.position.y = 0.75;
        foundation.receiveShadow = true;
        this.mesh.add(foundation);
    }

    createFloors() {
        this.floors.forEach(floor => {
            if (floor.mesh && floor.mesh.parent) {
                floor.mesh.parent.remove(floor.mesh);
            }
        });
        this.floors = [];

        let currentHeight = 1.5;

        for (let i = 0; i < this.totalFloors; i++) {
            const floor = new Floor(i, this);

            this.configureFloor(floor, i);

            const floorMesh = floor.createMesh();
            floorMesh.position.y = currentHeight + floor.height / 2;
            currentHeight += floor.height;

            this.mesh.add(floorMesh);
            floor.mesh = floorMesh;
            this.floors.push(floor);
        }
    }

    configureFloor(floor, floorNumber) {
        switch(this.type) {
            case 'SKYSCRAPER':
                floor.material = floorNumber < 10 ? 'CONCRETE' : 'GLASS';
                floor.windowType = floorNumber < 5 ? 'RESIDENTIAL' : 'PANORAMIC';
                break;
            case 'RESIDENTIAL':
                floor.material = floorNumber < 3 ? 'BRICK' : 'CONCRETE';
                floor.windowType = 'RESIDENTIAL';
                floor.hasBalcony = floorNumber > 1 && floorNumber % 2 === 0;
                break;
            case 'COMMERCIAL':
                floor.material = 'GLASS';
                floor.windowType = 'PANORAMIC';
                break;
            case 'HOUSE':
                floor.material = floorNumber === 0 ? 'BRICK' : 'WOOD';
                floor.windowType = 'RESIDENTIAL';
                break;
        }
    }

    createRoof() {
        const totalHeight = this.getTotalHeight();
        let roof;

        switch(this.roofType) {
            case 'SLOPED':
                const roofGeometry = new THREE.ConeGeometry(
                    this.baseWidth * 0.8,
                    4,
                    4
                );
                const roofMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8B4513,
                    roughness: 0.8
                });
                roof = new THREE.Mesh(roofGeometry, roofMaterial);
                roof.position.y = totalHeight + 2;
                roof.rotation.y = Math.PI / 4;
                break;
            default:
                const flatGeometry = new THREE.BoxGeometry(
                    this.baseWidth + 0.5,
                    0.5,
                    this.baseDepth + 0.5
                );
                const flatMaterial = new THREE.MeshStandardMaterial({
                    color: 0x444444,
                    roughness: 0.7
                });
                roof = new THREE.Mesh(flatGeometry, flatMaterial);
                roof.position.y = totalHeight + 0.25;
        }

        if (roof) {
            roof.castShadow = true;
            this.mesh.add(roof);
        }
    }

    getTotalHeight() {
        return 1.5 + this.floors.reduce((sum, floor) => sum + floor.height, 0);
    }

    updateBuilding() {
        const oldPosition = this.mesh.position.clone();
        const oldRotation = this.mesh.rotation.clone();

        while(this.mesh.children.length > 0) {
            this.mesh.remove(this.mesh.children[0]);
        }

        this.createFoundation();
        this.createFloors();
        this.createRoof();

        this.mesh.position.copy(oldPosition);
        this.mesh.rotation.copy(oldRotation);

        if (this.isSelected) {
            this.addHighlight();
        }
    }

    updateFloor(floorIndex, updates) {
        const floor = this.floors[floorIndex];
        if (!floor) return;

        Object.assign(floor, updates);

        floor.update();

        let currentHeight = 1.5;
        for (let i = 0; i < this.floors.length; i++) {
            const f = this.floors[i];
            if (f.mesh) {
                f.mesh.position.y = currentHeight + f.height / 2;
                currentHeight += f.height;
            }
        }

        this.updateRoofPosition();
    }

    updateRoofPosition() {
        const totalHeight = this.getTotalHeight();
        const roof = this.mesh.children.find(child =>
            child.geometry &&
            (child.geometry.type === 'ConeGeometry' ||
             (child.geometry.type === 'BoxGeometry' &&
              child.geometry.parameters &&
              child.geometry.parameters.height === 0.5))
        );

        if (roof) {
            if (roof.geometry.type === 'ConeGeometry') {
                roof.position.y = totalHeight + 2;
            } else {
                roof.position.y = totalHeight + 0.25;
            }
        }
    }

    addFloor() {
        this.totalFloors++;
        this.updateBuilding();
    }

    removeFloor() {
        if (this.totalFloors > 1) {
            this.totalFloors--;
            this.updateBuilding();
        }
    }

    addHighlight() {
        if (this.highlightMesh) {
            this.mesh.remove(this.highlightMesh);
        }

        const totalHeight = this.getTotalHeight();
        const geometry = new THREE.BoxGeometry(
            this.baseWidth * 1.05,
            totalHeight * 1.05,
            this.baseDepth * 1.05
        );
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({
            color: 0xffff00,
            linewidth: 3
        });

        this.highlightMesh = new THREE.LineSegments(edges, material);
        this.highlightMesh.position.y = totalHeight / 2;
        this.mesh.add(this.highlightMesh);
    }

    removeHighlight() {
        if (this.highlightMesh && this.mesh) {
            this.mesh.remove(this.highlightMesh);
            this.highlightMesh = null;
        }
    }

    getInfo() {
        return {
            type: this.type,
            floors: this.totalFloors,
            totalHeight: this.getTotalHeight().toFixed(1),
            width: this.baseWidth,
            depth: this.baseDepth,
            roofType: this.roofType
        };
    }

    getFloor(index) {
        return this.floors[index];
    }
}
