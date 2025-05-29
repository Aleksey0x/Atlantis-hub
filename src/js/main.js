import Slideout from 'slideout';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { ScrollSmoother } from 'gsap/ScrollSmoother';
// import { TextPlugin } from 'gsap/TextPlugin';
import '../scss/main.scss';

function initializeSlideout() {
	const panelElement = document.getElementById('panel');
	const menuElement = document.getElementById('menu');
	const menuButtonElement = document.getElementById('menu-button');

	if (panelElement && menuElement && menuButtonElement) {
		const slideout = new Slideout({
			panel: panelElement,
			menu: menuElement,
			padding: 256, // ширина меню
			tolerance: 70 // чувствительность свайпа
		});

		// Кнопка открытия/закрытия
		menuButtonElement.addEventListener('click', function () {
			slideout.toggle();
		});

		console.log('Slideout инициализирован.');
	} else {
		console.log('Элементы для Slideout не найдены. Инициализация пропущена.');
	}
}

document.addEventListener('DOMContentLoaded', function () {
	initializeSlideout();
	console.log('js работает');
});