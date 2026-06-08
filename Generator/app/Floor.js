import { ARCHITECTURE } from './constants.js';

export class Floor {
    constructor(number, building) {
        this.number = number;
        this.building = building;
        this.height = this.getDefaultHeight();
        this.geometryType = 'RECTANGULAR';
        this.material = 'CONCRETE';
        this.windowType = 'OFFICE';
        this.hasBalcony = number > 0 && number % 3 === 0;

        this.mesh = null;
        this.windows = [];
        this.balconies = [];
    }

    getDefaultHeight() {
        if (this.number === 0) return ARCHITECTURE.FLOOR_HEIGHTS.BASE;
        if (this.number === this.building.totalFloors - 1) return ARCHITECTURE.FLOOR_HEIGHTS.PENTHOUSE;
        if (this.number % 10 === 0) return ARCHITECTURE.FLOOR_HEIGHTS.COMMERCIAL;
        return ARCHITECTURE.FLOOR_HEIGHTS.STANDARD;
    }

    createMesh() {
        const group = new THREE.Group();
        const width = this.building.baseWidth;
        const depth = this.building.baseDepth;

        let floorGeometry;
        if (this.geometryType === 'CIRCULAR') {
            const radius = Math.min(width, depth) / 2;
            floorGeometry = new THREE.CylinderGeometry(radius, radius, this.height, 32);
        } else {
            floorGeometry = new THREE.BoxGeometry(width, this.height, depth);
        }

        const material = this.getMaterial(this.material);
        const floorMesh = new THREE.Mesh(floorGeometry, material);
        floorMesh.castShadow = true;
        floorMesh.receiveShadow = true;
        floorMesh.position.y = this.height / 2;

        this.createWindows(group, width, depth);

        if (this.hasBalcony) {
            this.createBalconies(group, width, depth);
        }

        group.add(floorMesh);
        this.mesh = group;

        return group;
    }

    createWindows(parent, width, depth) {
        this.windows.forEach(window => {
            if (window.parent) window.parent.remove(window);
        });
        this.windows = [];

        if (this.windowType === 'NONE') return;

        const windowType = ARCHITECTURE.WINDOW_TYPES[this.windowType];
        const windowGeometry = new THREE.BoxGeometry(windowType.width, windowType.height, 0.1);
        const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88CCFF,
            metalness: 0.9,
            roughness: 0.05,
            transparent: true,
            opacity: 0.7
        });

        const spacing = 3.0;
        const offset = 0.15;

        const northCount = Math.floor(width / spacing);
        for (let i = 0; i < northCount; i++) {
            const x = (i - (northCount-1)/2) * spacing;
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(x, 0, depth/2 + offset);
            parent.add(window);
            this.windows.push(window);
        }

        for (let i = 0; i < northCount; i++) {
            const x = (i - (northCount-1)/2) * spacing;
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(x, 0, -depth/2 - offset);
            window.rotation.y = Math.PI;
            parent.add(window);
            this.windows.push(window);
        }

        const eastCount = Math.floor(depth / spacing);
        for (let i = 0; i < eastCount; i++) {
            const z = (i - (eastCount-1)/2) * spacing;
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(width/2 + offset, 0, z);
            window.rotation.y = Math.PI / 2;
            parent.add(window);
            this.windows.push(window);
        }

        for (let i = 0; i < eastCount; i++) {
            const z = (i - (eastCount-1)/2) * spacing;
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-width/2 - offset, 0, z);
            window.rotation.y = -Math.PI / 2;
            parent.add(window);
            this.windows.push(window);
        }
    }

    createBalconies(parent, width, depth) {
        this.balconies.forEach(balcony => {
            if (balcony.parent) balcony.parent.remove(balcony);
        });
        this.balconies = [];

        const balconyGeometry = new THREE.BoxGeometry(width * 0.8, 0.3, 1.5);
        const balconyMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.3,
            roughness: 0.7
        });

        const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
        balcony.position.set(0, -this.height/2 - 0.15, depth/2 + 0.75);
        balcony.castShadow = true;
        parent.add(balcony);
        this.balconies.push(balcony);
    }

    getMaterial(materialType) {
        const matProps = ARCHITECTURE.MATERIALS[materialType];
        return new THREE.MeshStandardMaterial(matProps);
    }

    update() {
        if (this.mesh && this.mesh.parent) {
            const oldPosition = this.mesh.position.clone();
            const oldParent = this.mesh.parent;

            const newMesh = this.createMesh();
            newMesh.position.copy(oldPosition);

            oldParent.remove(this.mesh);
            oldParent.add(newMesh);
            this.mesh = newMesh;
        }
    }

    getInfo() {
        return {
            number: this.number,
            height: this.height,
            geometry: this.geometryType,
            material: this.material,
            windowType: this.windowType,
            hasBalcony: this.hasBalcony
        };
    }
}
