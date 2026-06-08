export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.ground = null;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.Fog(0x050510, 100, 500);

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.set(100, 80, 100);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.8;

        const container = document.getElementById('app-container');
        container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 500;

        this.setupLighting();

        this.createGround();

        this.createGrid();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(200, 300, 200);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.left = -200;
        sunLight.shadow.camera.right = 200;
        sunLight.shadow.camera.top = 200;
        sunLight.shadow.camera.bottom = -200;
        this.scene.add(sunLight);

        const hemisphereLight = new THREE.HemisphereLight(0x4488ff, 0x224422, 0.5);
        this.scene.add(hemisphereLight);

        const groundLight = new THREE.HemisphereLight(0x443322, 0x111122, 0.3);
        this.scene.add(groundLight);

        const fillLight = new THREE.DirectionalLight(0xaaaaff, 0.3);
        fillLight.position.set(-100, 100, -100);
        this.scene.add(fillLight);
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(500, 500, 50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a4a5c,
            roughness: 1,
            metalness: 0,
            side: THREE.DoubleSide
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
    }

    createGrid() {
        const size = 500;
        const divisions = 50;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
        gridHelper.position.y = 0.1;
        this.scene.add(gridHelper);
    }

    addObject(object) {
        this.scene.add(object);
    }

    removeObject(object) {
        this.scene.remove(object);
    }

    getGroundIntersection(mouseX, mouseY) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        mouse.x = (mouseX / window.innerWidth) * 2 - 1;
        mouse.y = -(mouseY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObject(this.ground);

        return intersects.length > 0 ? intersects[0].point : null;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
