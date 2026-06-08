export class DrawingManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.points = [];
        this.lines = [];
        this.meshes = [];
        this.drawingMode = true;
        this.currentPolygon = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStatus('Режим рисования: кликните на земле, чтобы добавить точку');
    }

    setupEventListeners() {
        const canvas = this.sceneManager.renderer.domElement;

        canvas.addEventListener('click', (event) => {
            if (!this.drawingMode) return;
            this.addPoint(event.clientX, event.clientY);
        });

        canvas.addEventListener('dblclick', (event) => {
            if (!this.drawingMode || this.points.length < 3) {
                this.updateStatus(`Нужно минимум 3 точки. Сейчас: ${this.points.length}`);
                return;
            }
            this.completePolygon();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.clearPolygon();
            } else if (event.key === 'Enter' && this.points.length >= 3) {
                this.completePolygon();
            }
        });
    }

    addPoint(mouseX, mouseY) {
        const groundPoint = this.sceneManager.getGroundIntersection(mouseX, mouseY);

        if (groundPoint) {
            const pointGeometry = new THREE.SphereGeometry(0.8, 12, 12);
            const pointMaterial = new THREE.MeshStandardMaterial({
                color: 0xff4444,
                emissive: 0x440000,
                emissiveIntensity: 0.3
            });
            const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);

            pointMesh.position.copy(groundPoint);
            pointMesh.position.y = 0.5;
            this.sceneManager.addObject(pointMesh);
            this.meshes.push(pointMesh);

            this.points.push(groundPoint);

            if (this.points.length > 1) {
                this.updateLines();
            }

            this.updateStatus(`Точка ${this.points.length} добавлена`);
        }
    }

    updateLines() {
        this.lines.forEach(line => this.sceneManager.removeObject(line));
        this.lines = [];

        if (this.points.length < 2) return;

        for (let i = 0; i < this.points.length; i++) {
            const nextIndex = (i + 1) % this.points.length;
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                this.points[i],
                this.points[nextIndex]
            ]);

            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x44ff44,
                linewidth: 3
            });

            const line = new THREE.Line(lineGeometry, lineMaterial);
            this.sceneManager.addObject(line);
            this.lines.push(line);
        }
    }

    completePolygon() {
        if (this.points.length < 3) {
            this.updateStatus(`Ошибка: нужно минимум 3 точки (сейчас ${this.points.length})`);
            return false;
        }

        if (this.currentPolygon) {
            this.sceneManager.removeObject(this.currentPolygon);
        }

        const shape = new THREE.Shape();
        shape.moveTo(this.points[0].x, this.points[0].z);

        for (let i = 1; i < this.points.length; i++) {
            shape.lineTo(this.points[i].x, this.points[i].z);
        }

        shape.lineTo(this.points[0].x, this.points[0].z);

        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshStandardMaterial({
            color: 0x226622,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            emissive: 0x113311,
            emissiveIntensity: 0.1
        });

        this.currentPolygon = new THREE.Mesh(geometry, material);
        this.currentPolygon.rotation.x = -Math.PI / 2;
        this.currentPolygon.position.y = 0.05;
        this.currentPolygon.receiveShadow = true;
        this.sceneManager.addObject(this.currentPolygon);

        this.drawingMode = false;
        this.updateStatus(`Полигон создан (${this.points.length} точек). Нажмите "Сгенерировать здания".`);

        if (this.onPolygonComplete) {
            this.onPolygonComplete(this.points);
        }

        document.getElementById('btn-draw-mode').classList.remove('active');
        document.getElementById('btn-edit-mode').classList.add('active');

        return true;
    }

    clearPolygon() {
        this.meshes.forEach(mesh => this.sceneManager.removeObject(mesh));
        this.lines.forEach(line => this.sceneManager.removeObject(line));

        if (this.currentPolygon) {
            this.sceneManager.removeObject(this.currentPolygon);
        }

        this.points = [];
        this.lines = [];
        this.meshes = [];
        this.currentPolygon = null;
        this.drawingMode = true;

        this.updateStatus('Полигон очищен. Режим рисования.');
        document.getElementById('btn-draw-mode').classList.add('active');
        document.getElementById('btn-edit-mode').classList.remove('active');
    }

    setDrawingMode(enabled) {
        this.drawingMode = enabled;
        if (enabled) {
            this.updateStatus('Режим рисования: кликните на земле чтобы добавить точку');
            document.getElementById('btn-draw-mode').classList.add('active');
            document.getElementById('btn-edit-mode').classList.remove('active');
        } else {
            this.updateStatus('Режим редактирования: выберите здание');
            document.getElementById('btn-draw-mode').classList.remove('active');
            document.getElementById('btn-edit-mode').classList.add('active');
        }
    }

    updateStatus(message) {
        document.querySelector('.status-bar').textContent = message;
    }
}
