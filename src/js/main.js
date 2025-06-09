import Slideout from 'slideout';
import '../scss/main.scss';

function initializeSlideout() {
	const panelElement = document.getElementById('panel');
	const menuElement = document.getElementById('menu');
	const menuButtonElement = document.getElementById('menu-button');

	if (panelElement && menuElement && menuButtonElement) {
		const slideout = new Slideout({
			panel: panelElement,
			menu: menuElement,
			padding: 320, // ширина меню
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

/**
 * Инициализация навигации по секциям с учетом липкого хедера
 * Обеспечивает плавную прокрутку между секциями и корректное определение текущей секции
 */
function initializeSectionNavigation() {
	// Получаем все секции статьи
	const sections = Array.from(document.querySelectorAll('article.container > section'));
	// Получаем кнопки навигации (обновлено для БЭМ)
	const prevButton = document.getElementById('prev-section');
	const nextButton = document.getElementById('next-section');

	// Индекс текущей активной секции
	let currentSectionIndex = 0;
	// Флаг для предотвращения обновления индекса во время программной прокрутки
	let isScrolling = false;
	// Таймер для throttling обработчика прокрутки
	let scrollTimeout = null;

	// Кэшируем высоту липкого хедера для оптимизации
	let stickyHeaderHeight = 0;

	/**
	 * Получает высоту липкого хедера
	 * @returns {number} Высота хедера в пикселях
	 */
	function getStickyHeaderHeight() {
		// Ищем липкий хедер по новому БЭМ селектору
		const header = document.querySelector('.navigation__toggle-wrapper');

		// Если хедер найден, возвращаем его высоту
		if (header) {
			const rect = header.getBoundingClientRect();
			return rect.height;
		}

		// Если хедер не найден, возвращаем 0
		return 0;
	}

	/**
	 * Инициализация: проверка наличия необходимых элементов
	 */
	if (!sections.length || !prevButton || !nextButton) {
		console.log('Элементы для навигации по секциям не найдены.');
		// Скрываем панель навигации, если элементы отсутствуют
		const sectionNavPanel = document.querySelector('.section-nav');
		if (sectionNavPanel) {
			sectionNavPanel.style.display = 'none';
		}
		return;
	}

	// Кэшируем высоту хедера при инициализации
	stickyHeaderHeight = getStickyHeaderHeight();

	/**
	 * Обновляет состояние кнопок навигации (активные/неактивные)
	 */
	function updateButtonStates() {
		// Отключаем кнопку "Назад" на первой секции
		prevButton.disabled = currentSectionIndex === 0;
		// Отключаем кнопку "Далее" на последней секции
		nextButton.disabled = currentSectionIndex === sections.length - 1;
	}

	/**
	 * Выполняет плавную прокрутку к указанной секции
	 * @param {number} index - Индекс целевой секции
	 */
	function scrollToSection(index) {
		// Проверяем валидность индекса
		if (index < 0 || index >= sections.length) {
			return;
		}

		// Устанавливаем флаг программной прокрутки
		isScrolling = true;

		// Получаем целевую секцию
		const targetSection = sections[index];
		// Получаем позицию секции относительно документа
		const sectionTop = targetSection.offsetTop;
		// Вычисляем финальную позицию с учетом липкого хедера и небольшого отступа
		// const finalScrollPosition = sectionTop - stickyHeaderHeight;
		const finalScrollPosition = sectionTop;

		// Выполняем плавную прокрутку
		window.scrollTo({
			top: Math.max(0, finalScrollPosition), // Не скроллим выше начала документа
			behavior: 'smooth'
		});

		// Обновляем текущий индекс секции
		currentSectionIndex = index;
		// Обновляем состояние кнопок
		updateButtonStates();

		// Сбрасываем флаг программной прокрутки через время анимации
		setTimeout(() => {
			isScrolling = false;
		}, 1000); // 1 секунда - достаточно для завершения smooth scroll
	}

	/**
	 * Определяет наиболее видимую секцию на экране
	 * @returns {number} Индекс наиболее видимой секции
	 */
	function getCurrentVisibleSection() {
		// Переменные для отслеживания наиболее видимой секции
		let maxVisibleScore = 0;
		let mostVisibleIndex = currentSectionIndex; // По умолчанию оставляем текущую

		// Получаем высоту viewport
		const viewportHeight = window.innerHeight;
		// Получаем текущую позицию прокрутки
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		// Проходим по всем секциям
		sections.forEach((section, index) => {
			// Получаем границы секции
			const rect = section.getBoundingClientRect();
			// Вычисляем абсолютную позицию секции
			const sectionTop = rect.top + scrollTop;
			const sectionBottom = sectionTop + rect.height;

			// Вычисляем видимую область с учетом липкого хедера
			const visibleTop = Math.max(stickyHeaderHeight, rect.top);
			const visibleBottom = Math.min(viewportHeight, rect.bottom);
			const visibleHeight = Math.max(0, visibleBottom - visibleTop);

			// Если секция хотя бы частично видна
			if (visibleHeight > 0) {
				// Вычисляем процент видимости секции
				const sectionHeight = rect.height;
				const visibilityRatio = visibleHeight / sectionHeight;

				// Вычисляем "вес" секции (комбинация видимой площади и процента видимости)
				const visibleArea = visibleHeight * rect.width;
				const visibilityScore = visibleArea * visibilityRatio;

				// Бонус для секций, которые находятся ближе к центру экрана
				const sectionCenter = (visibleTop + visibleBottom) / 2;
				const viewportCenter = viewportHeight / 2;
				const centerDistance = Math.abs(sectionCenter - viewportCenter);
				const centerBonus = Math.max(0, 1 - (centerDistance / viewportCenter)) * 0.2;

				// Итоговый счет с учетом бонуса за центрирование
				const finalScore = visibilityScore * (1 + centerBonus);

				// Обновляем наиболее видимую секцию, если текущая лучше
				if (finalScore > maxVisibleScore) {
					maxVisibleScore = finalScore;
					mostVisibleIndex = index;
				}
			}
		});

		return mostVisibleIndex;
	}

	/**
	 * Обработчик ручной прокрутки пользователя
	 * Обновляет текущую секцию только если прокрутка не программная
	 */
	function handleScroll() {
		// Игнорируем обработку во время программной прокрутки
		if (isScrolling) {
			return;
		}

		// Определяем новую текущую секцию
		const newSectionIndex = getCurrentVisibleSection();

		// Обновляем состояние только если секция изменилась
		if (newSectionIndex !== currentSectionIndex) {
			currentSectionIndex = newSectionIndex;
			updateButtonStates();

			// Логируем изменение для отладки
			console.log(`Текущая секция изменена на: ${currentSectionIndex}`);
		}
	}

	/**
	 * Throttled версия обработчика прокрутки для оптимизации производительности
	 * Ограничивает частоту вызовов до одного раза в 100мс
	 */
	function throttledHandleScroll() {
		// Если таймер уже установлен, игнорируем вызов
		if (scrollTimeout) {
			return;
		}

		// Устанавливаем таймер для отложенного выполнения
		scrollTimeout = setTimeout(() => {
			handleScroll();
			scrollTimeout = null; // Сбрасываем таймер
		}, 100); // 100мс задержка для оптимизации
	}

	/**
	 * Обработчик изменения размера окна
	 * Обновляет кэшированную высоту хедера
	 */
	function handleResize() {
		// Обновляем высоту липкого хедера
		stickyHeaderHeight = getStickyHeaderHeight();
		// Пересчитываем текущую секцию
		if (!isScrolling) {
			handleScroll();
		}
	}

	// Добавляем обработчики событий
	window.addEventListener('scroll', throttledHandleScroll, { passive: true });
	window.addEventListener('resize', handleResize, { passive: true });

	/**
	 * Обработчик клика по кнопке "Назад"
	 */
	prevButton.addEventListener('click', () => {
		const targetIndex = currentSectionIndex - 1;
		scrollToSection(targetIndex);
	});

	/**
	 * Обработчик клика по кнопке "Далее"
	 */
	nextButton.addEventListener('click', () => {
		const targetIndex = currentSectionIndex + 1;
		scrollToSection(targetIndex);
	});

	// Инициализация: определяем текущую секцию при загрузке страницы
	currentSectionIndex = getCurrentVisibleSection();
	updateButtonStates();

	// Логируем успешную инициализацию
	console.log(`Навигация по секциям инициализирована:`, {
		sectionsCount: sections.length,
		currentSection: currentSectionIndex,
		stickyHeaderHeight: stickyHeaderHeight
	});
}

/**
 * Инициализация активного состояния пунктов меню навигации
 * Определяет текущую страницу и добавляет соответствующий класс к пункту меню
 */
function initializeActiveNavigation() {
	// Получаем все пункты меню навигации (обновлено для БЭМ)
	const navItems = document.querySelectorAll('.navigation__link');

	// Проверяем, есть ли пункты меню
	if (!navItems.length) {
		console.log('Пункты меню навигации не найдены.');
		return;
	}

	// Получаем текущий путь страницы
	const currentPath = window.location.pathname;
	// Получаем имя текущего файла
	const currentFile = currentPath.split('/').pop() || 'index.html';
	
	console.log('Текущий путь:', currentPath, 'Текущий файл:', currentFile);

	// Проходим по всем пунктам меню
	navItems.forEach(item => {
		// Получаем href пункта меню
		const href = item.getAttribute('href');
		if (!href) return;

		// Получаем имя файла из href
		const hrefFile = href.split('/').pop() || 'index.html';
		
		// Определяем активность
		let isActive = false;

		if (href === 'index.html' || href === '../index.html') {
			// Главная страница
			isActive = (currentFile === 'index.html' || currentFile === '' || currentPath === '/' || currentPath.endsWith('index.html'));
		} else if (href.includes('types.html')) {
			// Страница типов касс  
			isActive = currentPath.includes('types.html') || currentFile === 'types.html';
		} else {
			// Для других страниц - сравниваем имена файлов
			isActive = currentFile === hrefFile;
		}

		// Добавляем или убираем класс активности (обновлено для БЭМ)
		if (isActive) {
			item.classList.add('navigation__link--active');
			console.log('Активный пункт меню:', item.textContent.trim());
		} else {
			item.classList.remove('navigation__link--active');
		}
	});
}

/**
 * Инициализация функциональности выпадающего меню
 * Обеспечивает работу выпадающих пунктов меню с поддержкой кликов и клавиатуры
 */
function initializeDropdownMenu() {
	// Получаем все выпадающие пункты меню
	const dropdownItems = document.querySelectorAll('.navigation__item--dropdown');

	if (!dropdownItems.length) {
		console.log('Выпадающие пункты меню не найдены.');
		return;
	}

	// Определяем, работаем ли мы на сенсорном устройстве
	const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

	dropdownItems.forEach(item => {
		const dropdownLink = item.querySelector('.navigation__link--dropdown');
		const dropdownMenu = item.querySelector('.navigation__dropdown');
		const arrow = item.querySelector('.navigation__arrow');

		if (!dropdownLink || !dropdownMenu) return;

		// Переменная для отслеживания состояния меню
		let isOpen = false;

		/**
		 * Открывает выпадающее меню
		 */
		function openDropdown() {
			dropdownMenu.style.display = 'block';
			isOpen = true;
			if (arrow) {
				arrow.style.transform = 'rotate(180deg)';
			}
			dropdownLink.setAttribute('aria-expanded', 'true');
		}

		/**
		 * Закрывает выпадающее меню
		 */
		function closeDropdown() {
			dropdownMenu.style.display = 'none';
			isOpen = false;
			if (arrow) {
				arrow.style.transform = 'rotate(0deg)';
			}
			dropdownLink.setAttribute('aria-expanded', 'false');
		}

		/**
		 * Переключает состояние выпадающего меню
		 */
		function toggleDropdown() {
			if (isOpen) {
				closeDropdown();
			} else {
				// Закрываем все другие открытые меню
				dropdownItems.forEach(otherItem => {
					if (otherItem !== item) {
						const otherMenu = otherItem.querySelector('.navigation__dropdown');
						const otherArrow = otherItem.querySelector('.navigation__arrow');
						const otherLink = otherItem.querySelector('.navigation__link--dropdown');
						if (otherMenu) {
							otherMenu.style.display = 'none';
							if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
							if (otherLink) otherLink.setAttribute('aria-expanded', 'false');
						}
					}
				});
				openDropdown();
			}
		}

		// Обработчик клика по основной ссылке
		dropdownLink.addEventListener('click', (e) => {
			e.preventDefault();
			toggleDropdown();
		});

		// Обработчик нажатия клавиш для доступности
		dropdownLink.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggleDropdown();
			} else if (e.key === 'Escape') {
				closeDropdown();
			}
		});

		// Обработчики наведения мыши (только для не-сенсорных устройств)
		if (!isTouchDevice) {
			item.addEventListener('mouseenter', () => {
				if (!isOpen) {
					openDropdown();
				}
			});

			item.addEventListener('mouseleave', () => {
				if (isOpen) {
					closeDropdown();
				}
			});
		}

		// Закрытие меню при клике в любом другом месте
		document.addEventListener('click', (e) => {
			if (!item.contains(e.target)) {
				closeDropdown();
			}
		});

		// Для сенсорных устройств - закрытие при прикосновении к любому другому месту
		if (isTouchDevice) {
			document.addEventListener('touchstart', (e) => {
				if (!item.contains(e.target)) {
					closeDropdown();
				}
			});
		}

		// Инициализация атрибутов доступности
		dropdownLink.setAttribute('aria-haspopup', 'true');
		dropdownLink.setAttribute('aria-expanded', 'false');
		dropdownMenu.setAttribute('role', 'menu');

		// Добавляем атрибуты для элементов внутри выпадающего меню
		const dropdownLinks = dropdownMenu.querySelectorAll('.navigation__link');
		dropdownLinks.forEach(link => {
			link.setAttribute('role', 'menuitem');
		});
	});

	console.log('Функциональность выпадающего меню инициализирована:', dropdownItems.length, 'элементов', 
		isTouchDevice ? '(сенсорное устройство)' : '(десктоп)');
}

document.addEventListener('DOMContentLoaded', function () {
	initializeSlideout();
	initializeSectionNavigation();
	initializeActiveNavigation();
	initializeDropdownMenu(); // Добавляем инициализацию выпадающего меню
});

// Main JavaScript file for the Atlantis-hub project
console.log('Atlantis Hub Main JS Loaded');