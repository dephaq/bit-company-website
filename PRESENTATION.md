# Лендинг и презентация — что где живёт

Этот репо публикуется в **двух разных местах одновременно**. Не путать.

## Карта URL → источник

| URL | Что отдаёт | Откуда |
|---|---|---|
| https://bit-company.ru/ | Маркет-лендинг + страницы сайта (about/products/services/contact) | Production-сервер BTS, читает корень репо через `git pull origin main` в `/opt/sites/bit-company/site/` |
| https://dephaq.github.io/bit-company-website/ | 30-слайдовая презентация «Развитие продуктов» | GitHub Pages, читает только папку `presentation/` через GitHub Actions workflow |

## Файловая структура

```
bit-company-website/
├─ index.html              ← ЛЕНДИНГ (попадает на bit-company.ru/)
├─ about.html              ← bit-company.ru/about
├─ contact.html            ← bit-company.ru/contact
├─ products/               ← bit-company.ru/products/*
│  ├─ index.html
│  ├─ timesheet.html
│  ├─ finance.html
│  ├─ smeta.html
│  └─ logistics.html
├─ services/               ← bit-company.ru/services/*
│  ├─ index.html
│  ├─ ai-agents.html
│  ├─ development.html
│  └─ integrations.html
├─ assets/                 ← общие CSS/JS/иконки для всех страниц лендинга
│  ├─ style.css
│  ├─ app.js
│  ├─ icon.svg
│  └─ favicon.ico
├─ presentation/           ← ПРЕЗЕНТАЦИЯ (попадает на GitHub Pages)
│  └─ index.html           ← 30-слайдовый deck, всё inline (CSS+картинки base64)
├─ .github/workflows/
│  └─ pages.yml            ← workflow деплоя presentation/ на gh-pages
├─ CLAUDE.md               ← общий контекст для Claude Code
├─ PRESENTATION.md         ← этот файл
└─ README.md
```

## Как править лендинг (то что видит интернет)

```bash
# Файл: index.html в корне (или about.html / products/*.html / services/*.html)
git add index.html
git commit -m "..."
git push origin main

# На прод-сервере:
ssh deploy@bts "cd /opt/sites/bit-company/site && git pull origin main"

# nginx -s reload НЕ нужен — статика читается с диска при каждом запросе.
```

Время от push до live на bit-company.ru: ~30 секунд (вручную выполнить `ssh git pull`).

## Как править презентацию (то что видит партнёр на gh-pages)

```bash
# Файл: presentation/index.html
git add presentation/index.html
git commit -m "..."
git push origin main
```

Дальше **всё автоматически**:
1. GitHub Actions workflow `pages.yml` детектит изменение в `presentation/**`
2. Собирает artifact и деплоит на GitHub Pages
3. Через ~1 минуту https://dephaq.github.io/bit-company-website/ обновится

Прод-сервер `bit-company.ru` презентацию **не показывает** — там стоит nginx-блок `location ~ ^/presentation { return 404; }`.

## Первичная настройка GitHub Pages (один раз)

После первого push с папкой `presentation/` и workflow `pages.yml`:

1. Открыть https://github.com/dephaq/bit-company-website/settings/pages
2. **Source:** «**GitHub Actions**» (НЕ «Deploy from a branch»)
3. Save

Если оставить «Deploy from a branch» — workflow соберёт artifact, но Pages его не возьмёт. URL будет 404 или продолжит отдавать старый контент.

## ⚠️ Категорические запреты

1. **Никогда не класть презентацию в `index.html` корня**. Прецедент: коммит `fb61599` от 30.04.2026 — презентация заехала на публичный домен `bit-company.ru` вместо лендинга. Разбирали 04.05.2026.
2. **Не переименовывать папку `presentation/`** без правки `pages.yml` (поле `path: ./presentation`).
3. **Не править nginx-конфиг через BTS-репо** — `/opt/sites-extra/bit-company.conf` живёт **отдельно** на сервере. `make deploy-back` его не затронет.
4. **Не использовать `--standalone` для certbot** — обязательно `--webroot` (auto-renewal через `/opt/bts/certbot-webroot/`), иначе nginx ляжет на 30-60 сек и blackscope.ru/bit-company.ru упадут вместе.
5. **Не использовать `location = /index.html { return 301 /; }`** в nginx — даёт infinite loop с `index index.html`. Только `if ($request_uri = "/index.html")`.

## Verification — как проверить что всё работает

```bash
# 1. Лендинг на bit-company.ru
curl -s https://bit-company.ru/ | grep -E "<title>"
# → "bit — Системы, которые работают за вас"

# 2. Никаких слайдов на публичном домене
curl -s https://bit-company.ru/ | grep -c "data-slide"
# → 0

# 3. Презентация скрыта от публичного домена
curl -s -o /dev/null -w "%{http_code}\n" https://bit-company.ru/presentation/
# → 404

# 4. Презентация на GitHub Pages
curl -s https://dephaq.github.io/bit-company-website/ | grep -c "data-slide"
# → 30 (после переключения Settings → Pages → GitHub Actions)
```

## Откат в случае поломки

**Откат лендинга на проде:**
```bash
ssh deploy@bts "cd /opt/sites/bit-company/site && git log --oneline -10"  # найти sha
ssh deploy@bts "cd /opt/sites/bit-company/site && git reset --hard <sha>"
```

**Откат GitHub Pages:** revert коммита в `presentation/` → push в main → workflow задеплоит откатанную версию автоматически.

## Связанные заметки в Obsidian (vault `main`)

- `Atom — bit-company.ru production hot paths (где править что и как)` — runbook deploy
- `Molecule — bit-company.ru deploy + multi-tenant nginx (BTS prod)` — архитектура multi-tenant
- `Atom — bit-company.ru landing presentation split (2026-05-04)` — этот ремонт
- `Session — 2026-04-30 bit-company.ru live + multi-tenant nginx complete` — chronicle
- `MOC — BTS Holding`

## SSL / DNS

- **DNS:** nic.ru → https://www.nic.ru/manager/my_domains.cgi → bit-company.ru
- **SSL:** Let's Encrypt webroot, авто-renewal через systemd timer на проде, серт в `/opt/bts/certs/live/bit-company.ru/`
- **Истечение:** ~29.07.2026 (auto-renewal стрельнёт ~29.06.2026)
