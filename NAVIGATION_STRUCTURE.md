# Структура навигации для Barba.js

## ✅ Правильная организация ссылок

### 🔗 Абсолютные пути (рекомендуется)
Используйте абсолютные пути от корня сайта:

```html
<!-- В index.html -->
<nav id="menu" class="nav-menu">
  <ul class="menu-list">
    <li>
      <a class="nav-menu__item" href="/">
        Цифровая экосистема
      </a>
    </li>
    <li>
      <a class="nav-menu__item" href="/pages/types.html">
        Типы Онлайн-Касс
      </a>
    </li>
  </ul>
</nav>

<!-- В pages/types.html -->
<nav id="menu" class="nav-menu">
  <ul class="menu-list">
    <li>
      <a class="nav-menu__item" href="/">
        Цифровая экосистема
      </a>
    </li>
    <li>
      <a class="nav-menu__item" href="/pages/types.html">
        Типы Онлайн-Касс
      </a>
    </li>
  </ul>
</nav>
```

## 🎯 Как работает определение активной страницы

JavaScript автоматически определяет активную страницу по URL:

```javascript
function getNamespaceFromUrl(url) {
  if (url.includes('types.html')) {
    return 'types';
  } else if (url.includes('index.html') || url === '/' || url === '') {
    return 'home';
  }
  return 'default';
}
```

## 🎨 Стили активного состояния

```scss
.nav-menu__item {
  &.active {
    color: vars.$color-accent;
    font-weight: 600;
    background-color: rgba(vars.$color-accent, 0.1);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: vars.$color-accent;
    }
  }
}
```

## 🔄 Автоматическое обновление

Активное состояние обновляется автоматически:
- При загрузке страницы
- После каждого Barba.js перехода
- Меню автоматически закрывается при клике на ссылку

## 🐛 Отладка

Откройте консоль браузера для просмотра логов:
- `Определяем namespace для пути: /pages/types.html`
- `Обновляем навигацию для namespace: types`
- `Добавлен активный класс для: /pages/types.html`

## ✅ Проверочный список

- [ ] Все ссылки используют абсолютные пути
- [ ] Навигация одинакова на всех страницах
- [ ] CSS стили для `.active` подключены
- [ ] JavaScript логика обновления навигации работает
- [ ] Консоль не показывает ошибок 