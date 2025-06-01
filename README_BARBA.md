# Barba.js + GSAP Переходы

Минимальный рабочий пример плавных переходов между страницами с использованием Barba.js и GSAP.

## Особенности реализации

### 🚀 Основные возможности
- **Плавные переходы**: fade in/out анимации между страницами
- **Автоматический сброс скролла** при переходе на новую страницу
- **Namespace-based переходы**: разные анимации для разных типов страниц
- **Предзагрузка страниц** для быстрых переходов
- **Интеграция с существующим кодом** (Slideout меню)

### 📁 Структура файлов

```
├── index.html                 # Главная страница (namespace: "home")
├── pages/
│   └── types.html            # Страница типов касс (namespace: "types")
├── src/
│   ├── js/
│   │   └── main.js           # Основная логика + Barba.js
│   └── scss/
│       └── main.scss         # Стили + CSS для переходов
```

### 🔧 HTML Структура

Каждая страница должна иметь правильную структуру для Barba.js:

```html
<body data-barba="wrapper">
  <!-- Навигация и элементы, которые НЕ меняются -->
  <nav>...</nav>
  
  <!-- Контейнер, который меняется при переходах -->
  <div data-barba="container" data-barba-namespace="page-name">
    <!-- Контент страницы -->
  </div>
</body>
```

### ⚙️ Настройка переходов

В `main.js` настроены два типа переходов:

#### 1. Базовый переход (для всех страниц)
```javascript
{
  name: 'default-transition',
  leave(data) {
    // Fade out текущей страницы
    return gsap.to(data.current.container, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut"
    });
  },
  enter(data) {
    // Сброс скролла + fade in новой страницы
    window.scrollTo(0, 0);
    gsap.set(data.next.container, { opacity: 0 });
    return gsap.to(data.next.container, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.inOut"
    });
  }
}
```

#### 2. Специальный переход для страницы типов касс
```javascript
{
  name: 'types-transition',
  to: { namespace: ['types'] },
  // Более быстрый переход с движением по Y
}
```

### 🎨 CSS для предотвращения мигания

```scss
// Базовые стили для контейнеров
[data-barba="wrapper"] {
  position: relative;
}

[data-barba="container"] {
  opacity: 1;
  transition: opacity 0.1s ease;
}

// Предотвращение мигания при загрузке
body {
  opacity: 0;
  animation: fadeInBody 0.3s ease forwards;
}
```

### 🔄 Хуки и события

Barba.js предоставляет хуки для выполнения кода на разных этапах:

```javascript
views: [
  {
    namespace: 'home',
    beforeEnter() {
      // Код, выполняемый перед входом на главную
      initializeSlideout();
    }
  },
  {
    namespace: 'types', 
    beforeEnter() {
      // Код для страницы типов касс
    }
  }
]
```

### 📦 Загрузка Barba.js

Barba.js загружается динамически из CDN:

```javascript
const script = document.createElement('script');
script.src = 'https://unpkg.com/@barba/core@2.9.7/dist/barba.umd.js';
script.onload = initBarba;
document.head.appendChild(script);
```

### 🚀 Запуск проекта

```bash
npm run dev
```

Откройте http://localhost:5173 и протестируйте переходы между страницами.

### 🎯 Тестирование

1. **Переход с главной на типы касс**: должен быть быстрый переход с движением
2. **Переход обратно**: стандартный fade переход
3. **Сброс скролла**: при любом переходе страница прокручивается в начало
4. **Отсутствие мигания**: плавная смена контента без белых вспышек

### 🔧 Кастомизация

#### Добавление новой страницы:
1. Создайте HTML с правильной структурой
2. Добавьте уникальный `data-barba-namespace`
3. При необходимости добавьте специальный переход в `main.js`

#### Изменение анимации:
Модифицируйте функции `leave()` и `enter()` в объекте перехода:

```javascript
leave(data) {
  return gsap.to(data.current.container, {
    opacity: 0,
    x: -100,        // Добавить движение влево
    duration: 0.3,
    ease: "power2.inOut"
  });
}
```

### 🐛 Возможные проблемы

1. **Barba.js не загружается**: проверьте интернет-соединение и CDN
2. **Переходы не работают**: убедитесь, что все ссылки ведут на страницы с правильной структурой
3. **Мигание**: проверьте CSS стили для `[data-barba="container"]`
4. **Скрипты не работают после перехода**: используйте хуки `beforeEnter()` для переинициализации

### 📚 Дополнительные ресурсы

- [Документация Barba.js](https://barba.js.org/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Примеры переходов](https://barba.js.org/docs/getstarted/transitions/) 