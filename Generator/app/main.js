import { App } from './App.js';

window.addEventListener('load', () => {
    console.log('Страница загружена, запускаем архитектурный редактор...');

    try {
        const app = new App();
        app.start();
        window.app = app;

        console.log('✓ Архитектурный редактор успешно запущен');
        console.log('=== ИНСТРУКЦИЯ ===');
        console.log('1. Кликните на земле чтобы добавить точки полигона');
        console.log('2. Двойной клик или Enter чтобы замкнуть полигон');
        console.log('3. Нажмите "Сгенерировать здания" для создания реалистичных зданий');
        console.log('4. Кликните на здание для детального поэтажного редактирования');
        console.log('5. ESC - отмена рисования полигона');

    } catch (error) {
        console.error('Ошибка запуска редактора:', error);
        alert('Ошибка запуска: ' + error.message);
    }
});
