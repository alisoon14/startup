import App from './app/App.js';

class Main {
    constructor() {
        this.app = new App();
        this.init();
    }

    init() {
        console.log('3D City Generator запущен!');
        this.app.start();
        
        this.setupStats();
    }

    setupStats() {
        setInterval(() => {
            const statsDiv = document.getElementById('stats');
            const buildings = this.app.buildingManager?.buildings?.length || 0;
            const mode = this.app.drawingManager?.drawingMode ? 'Рисование' : 'Редактирование';
            
            statsDiv.innerHTML = `
                <div>Режим: <strong>${mode}</strong></div>
                <div>Здания: <strong>${buildings}</strong></div>
                <div>FPS: <strong>${Math.round(this.app.sceneManager?.renderer?.info.render.fps || 0)}</strong></div>
            `;
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Main();
});