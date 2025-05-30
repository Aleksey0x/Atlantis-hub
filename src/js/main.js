import Slideout from 'slideout';
import gsap from 'gsap';
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
	const frame = document.getElementById("transition-frame");
	const links = document.querySelectorAll(".transition-link");

	// Уход со страницы
	links.forEach(link => {
		link.addEventListener("click", (e) => {
			e.preventDefault();
			const href = link.getAttribute("href");

			gsap.to(frame, {
				top: 0,
				duration: 0.7,
				ease: "power2.inOut",
				onComplete: () => {
					window.location.href = href;
				}
			});
		});
	});

	// Появление новой страницы
	window.addEventListener("DOMContentLoaded", () => {
		gsap.fromTo(frame,
			{ top: 0 },
			{
				top: "-100%",
				duration: 0.7,
				ease: "power2.inOut"
			}
		);
	});
	initializeSlideout();
	console.log('js работает');
});