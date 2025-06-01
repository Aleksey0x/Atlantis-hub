import Slideout from 'slideout';
import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { ScrollSmoother } from 'gsap/ScrollSmoother';
// import { TextPlugin } from 'gsap/TextPlugin';
import '../scss/main.scss';

// Загружаем Barba.js из CDN
const script = document.createElement('script');
script.src = 'https://unpkg.com/@barba/core@2.9.7/dist/barba.umd.js';
script.onload = initBarba;
document.head.appendChild(script);

// Функция для нормализации путей
function normalizePath(path) {
	// Убираем параметры запроса и якоря
	const cleanPath = path.split('?')[0].split('#')[0];
	// Убираем лишние слеши и нормализуем путь
	return cleanPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

// Улучшенная функция для определения namespace по URL
function getNamespaceFromUrl(url) {
	let path;
	try {
		// Создаем объект URL для корректной обработки
		const urlObj = new URL(url, window.location.origin);
		path = normalizePath(urlObj.pathname);
	} catch (e) {
		// Если URL относительный, обрабатываем его
		path = normalizePath(url);
	}

	console.log('Определяем namespace для нормализованного пути:', path);

	// Более точное определение namespace
	if (path.includes('/pages/types.html') || path === '/pages/types.html') {
		return 'types';
	} else if (path === '/' || path === '/index.html' || path === '') {
		return 'home';
	}

	return 'default';
}

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

		// Закрытие меню при клике на ссылку
		const menuLinks = menuElement.querySelectorAll('a');
		menuLinks.forEach(link => {
			link.addEventListener('click', () => {
				slideout.close();
			});
		});

		console.log('Slideout инициализирован.');
	} else {
		console.log('Элементы для Slideout не найдены. Инициализация пропущена.');
	}
}

// Инициализация Barba.js после загрузки библиотеки
function initBarba() {
	if (typeof barba === 'undefined') {
		console.error('Barba.js не загружен');
		return;
	}

	// Получаем элемент оверлея
	const overlay = document.getElementById('page-transition-overlay');

	// Инициализация Barba.js
	barba.init({
		// Настройки переходов
		transitions: [
			{
				// Основной переход с оверлеем для всех страниц
				name: 'overlay-transition',

				// Функция выполняется при начале перехода
				async leave(data) {
					console.log('🚀 Начинаем переход с оверлеем');

					// Анимация появления оверлея справа налево
					const overlayAnimation = gsap.fromTo(overlay,
						{
							transform: 'translateX(100%)'
						},
						{
							transform: 'translateX(0%)',
							duration: 0.6,
							ease: "power2.inOut"
						}
					);

					// Одновременно затемняем текущую страницу
					const pageAnimation = gsap.to(data.current.container, {
						opacity: 0,
						duration: 0.6,
						ease: "power2.inOut"
					});

					// Ждем завершения анимации
					await Promise.all([overlayAnimation, pageAnimation]);

					console.log('✅ Оверлей покрыл экран');
				},

				// Функция выполняется при появлении новой страницы
				async enter(data) {
					console.log('🎯 Показываем новую страницу');

					// Сброс скролла в начало страницы
					window.scrollTo(0, 0);

					// Устанавливаем начальное состояние для новой страницы (скрыта)
					gsap.set(data.next.container, {
						opacity: 0,
						y: 20 // Небольшое смещение вниз для эффекта появления
					});

					// Находим основные элементы для анимации
					const mainElements = data.next.container.querySelectorAll('h1, h2, p, .lead, blockquote, ul, ol');
					if (mainElements.length > 0) {
						gsap.set(mainElements, {
							opacity: 0,
							y: 30
						});
					}

					// Небольшая задержка для плавности
					await new Promise(resolve => setTimeout(resolve, 100));

					// Анимация исчезновения оверлея слева направо
					const overlayHide = gsap.to(overlay, {
						transform: 'translateX(-100%)',
						duration: 0.6,
						ease: "power2.inOut"
					});

					// Одновременно плавно показываем новую страницу
					const pageShow = gsap.to(data.next.container, {
						opacity: 1,
						y: 0,
						duration: 0.8,
						delay: 0.2, // Начинаем показ чуть позже начала ухода оверлея
						ease: "power2.out"
					});

					// Анимация появления контента с задержкой
					let contentAnimation = null;
					if (mainElements.length > 0) {
						contentAnimation = gsap.to(mainElements, {
							opacity: 1,
							y: 0,
							duration: 0.6,
							delay: 0.4,
							stagger: 0.1, // Поочередное появление элементов
							ease: "power2.out"
						});
					}

					// Ждем завершения анимации оверлея
					await overlayHide;

					// Возвращаем оверлей в исходное положение для следующего перехода
					gsap.set(overlay, { transform: 'translateX(100%)' });

					// Ждем завершения анимации появления страницы
					await pageShow;

					// Ждем завершения анимации контента, если она есть
					if (contentAnimation) {
						await contentAnimation;
					}

					console.log('🎉 Переход завершен');
				}
			},

			// Специальный быстрый переход для страницы типов касс
			{
				name: 'types-fast-transition',
				to: {
					namespace: ['types']
				},

				async leave(data) {
					console.log('⚡ Быстрый переход на типы касс');

					// Более быстрая анимация для типов касс
					const overlayAnimation = gsap.fromTo(overlay,
						{
							transform: 'translateX(100%)'
						},
						{
							transform: 'translateX(0%)',
							duration: 0.4,
							ease: "power3.inOut"
						}
					);

					const pageAnimation = gsap.to(data.current.container, {
						opacity: 0.2,

						duration: 0.4,
						ease: "power3.inOut"
					});

					await Promise.all([overlayAnimation, pageAnimation]);
				},

				async enter(data) {
					window.scrollTo(0, 0);

					// Устанавливаем начальное состояние для новой страницы (скрыта)
					gsap.set(data.next.container, {
						opacity: 0,
						y: 15 // Меньшее смещение для быстрого перехода
					});

					// Находим основные элементы для быстрой анимации
					const mainElements = data.next.container.querySelectorAll('h1, h2, p, .lead');
					if (mainElements.length > 0) {
						gsap.set(mainElements, {
							opacity: 0,
							y: 20
						});
					}

					await new Promise(resolve => setTimeout(resolve, 80));

					// Анимация исчезновения оверлея слева направо
					const overlayHide = gsap.to(overlay, {
						transform: 'translateX(-100%)',
						duration: 0.4,
						ease: "power3.inOut"
					});

					// Одновременно плавно показываем новую страницу
					const pageShow = gsap.to(data.next.container, {
						opacity: 1,
						y: 0,
						duration: 0.6,
						delay: 0.1,
						ease: "power3.out"
					});

					// Быстрая анимация появления контента
					let contentAnimation = null;
					if (mainElements.length > 0) {
						contentAnimation = gsap.to(mainElements, {
							opacity: 1,
							y: 0,
							duration: 0.4,
							delay: 0.2,
							stagger: 0.05, // Более быстрое поочередное появление
							ease: "power3.out"
						});
					}

					await overlayHide;
					gsap.set(overlay, { transform: 'translateX(100%)' });
					await pageShow;

					if (contentAnimation) {
						await contentAnimation;
					}
				}
			}
		],

		// Хуки для дополнительной логики
		views: [
			{
				// Для главной страницы
				namespace: 'home',
				beforeEnter() {
					console.log('🏠 Вход на главную страницу');
					setTimeout(() => {
						initializeSlideout();
					}, 100);
				}
			},
			{
				// Для страницы типов касс
				namespace: 'types',
				beforeEnter() {
					console.log('📋 Вход на страницу типов касс');
					setTimeout(() => {
						initializeSlideout();
					}, 100);
				}
			}
		],

		// Глобальные хуки
		hooks: {
			// Выполняется перед каждым переходом
			before(data) {
				console.log('🔄 Переход с', data.current.url.href, 'на', data.next.url.href);

				// Предварительно обновляем навигацию
				debouncedUpdateNavigation(data.next.url.href);
			},

			// Выполняется после каждого перехода
			after(data) {
				console.log('✨ Переход завершен на', data.next.url.href);

				// Дополнительная проверка навигации
				setTimeout(() => {
					updateActiveNavigation(data.next.url.href);
				}, 50);
			},

			// Обработка ошибок
			beforeLeave(data) {
				// Убеждаемся, что оверлей в правильном состоянии
				const overlay = document.getElementById('page-transition-overlay');
				if (overlay) {
					gsap.set(overlay, { transform: 'translateX(100%)' });
				}
			}
		}
	});

	console.log('🎭 Barba.js с GSAP-анимацией инициализирован');
}

// Функция для дебаунсинга обновления навигации
function debounce(func, wait) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

// Дебаунсированная версия обновления навигации
const debouncedUpdateNavigation = debounce(updateActiveNavigation, 100);

// Улучшенная функция для обновления активного состояния навигации
function updateActiveNavigation(currentUrl) {
	try {
		const navLinks = document.querySelectorAll('.nav-menu__item');
		if (navLinks.length === 0) {
			console.warn('Навигационные ссылки не найдены');
			return;
		}

		const currentNamespace = getNamespaceFromUrl(currentUrl);
		console.log('Обновляем навигацию для namespace:', currentNamespace);

		navLinks.forEach(link => {
			const linkUrl = link.getAttribute('href');
			if (!linkUrl) return;

			const linkNamespace = getNamespaceFromUrl(linkUrl);
			console.log('Ссылка:', linkUrl, 'Namespace:', linkNamespace, 'Текущий:', currentNamespace);

			// Удаляем активный класс
			link.classList.remove('active');

			// Добавляем активный класс для текущей страницы
			if (linkNamespace === currentNamespace) {
				link.classList.add('active');
				console.log('✅ Добавлен активный класс для:', linkUrl);
			}
		});
	} catch (error) {
		console.error('Ошибка при обновлении навигации:', error);
	}
}

// Функция для предзагрузки страниц (опционально)
function preloadPages() {
	// Предзагружаем ключевые страницы для быстрых переходов
	const importantPages = [
		'/pages/types.html',
		'/index.html',
		'/'
	];

	importantPages.forEach(page => {
		const link = document.createElement('link');
		link.rel = 'prefetch';
		link.href = page;
		document.head.appendChild(link);
	});

	console.log('📦 Предзагрузка страниц инициализирована');
}

// Функция для более точного определения активной ссылки при загрузке
function setInitialActiveNavigation() {
	// Небольшая задержка для корректной работы с Barba
	setTimeout(() => {
		updateActiveNavigation(window.location.href);

		// Дополнительная проверка через 500ms для надежности
		setTimeout(() => {
			updateActiveNavigation(window.location.href);
		}, 500);
	}, 100);
}

document.addEventListener('DOMContentLoaded', function () {
	// Инициализируем slideout для текущей страницы
	initializeSlideout();

	// Предзагружаем страницы
	preloadPages();

	// Устанавливаем активное состояние навигации при загрузке
	setInitialActiveNavigation();

	console.log('Основной JS загружен');
});