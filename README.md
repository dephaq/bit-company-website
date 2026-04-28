# bit-company website

Сайт IT-компании bit (ООО «БИТ» — Бизнес Информационные Технологии).

Статичный сайт: HTML + CSS + минимум JS, без фреймворков и сборщиков.

## Структура

```
.
├── index.html              Главная
├── about.html              О компании
├── contact.html            Связаться
├── products/               Страницы продуктов
│   ├── index.html
│   ├── finance.html
│   ├── timesheet.html
│   ├── logistics.html
│   └── smeta.html
├── services/               Страницы услуг
│   ├── index.html
│   ├── ai-agents.html
│   ├── integrations.html
│   └── development.html
└── assets/                 CSS / JS / шрифты
```

## Локальный просмотр

```bash
python -m http.server 8000
# открыть http://localhost:8000
```

## Деплой

GitHub Pages: автоматически из ветки `main` корня репозитория.

URL: https://dephaq.github.io/bit-company-website/

## Контакты

hello@bit-company.ru
