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

## Production hosting — bit-company.ru

Сайт хостится на **production-сервере BTS Holding** (`89.169.128.195`) рядом с `blackscope.ru` через multi-tenant nginx.
BTS-сервер уже есть, nginx уже есть, серт через общий certbot — выгоднее поднять рядом, чем держать отдельный VPS.

### Ключевые пути на проде

| Что | Где |
|---|---|
| Git clone сайта | `/opt/sites/bit-company/site/` (deploy:deploy) |
| Nginx server-блок | `/opt/sites-extra/bit-company.conf` (deploy:deploy) |
| SSL сертификат | `/opt/bts/certs/live/bit-company.ru/` (Let's Encrypt webroot) |
| ACME challenges | `/opt/bts/certbot-webroot/` (общий с blackscope.ru) |

Эти каталоги **вне репо BTS** (`/opt/bts/repo/`) — выживают `git pull` BTS при `make deploy-back`.

### Как обновить сайт на проде

После любого `git push` в `main` ветку этого репо:

```bash
ssh deploy@89.169.128.195 "cd /opt/sites/bit-company/site && git pull origin main"
```

**Reload nginx не требуется** — статика читается с диска при каждом запросе. Изменения видны мгновенно.

### Как добавить новый файл / папку

Просто положить в репо, `git push`, `git pull` на сервере. Nginx настроен на `try_files $uri $uri.html $uri/ =404` — найдёт новый html автоматически.

### Откат

```bash
ssh deploy@89.169.128.195 "cd /opt/sites/bit-company/site && git reset --hard <commit-sha>"
```

### Renewal сертификата

Обновляется автоматически через systemd timer на сервере (`certbot.timer` 2× в день + renewal hook → `nginx -s reload`). Серт от Let's Encrypt действует 90 дней, обновится за 30 дней до истечения.

### Архитектура multi-tenant nginx (BTS server)

```
bts-nginx-1 container
  ├── /etc/nginx/conf.d/default.conf  → BTS-репо (blackscope.ru, dashboard)
  └── /etc/nginx/sites-extra/         → /opt/sites-extra/ (host)
        └── bit-company.conf          ← наш конфиг

  /opt/sites/                         → bind-mount внутрь контейнера
    └── bit-company/site/             ← git repo dephaq/bit-company-website
```

Полный гайд по multi-tenant архитектуре и тому как добавить **третий** домен на этот же сервер — в Obsidian-vault: `Molecule — bit-company.ru deploy + multi-tenant nginx (BTS prod)`.

## Контакты

hello@bit-company.ru
