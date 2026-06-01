# bit-company-website — контекст для Claude

## ⚠️ Прежде чем что-либо делать — прочитай PRESENTATION.md

Этот репо публикуется в **двух местах одновременно**, но теперь оба места отдают один и тот же маркетинговый сайт:

| URL | Источник |
|---|---|
| https://bit-company.ru/ | корень репо (лендинг + страницы сайта) |
| https://dephaq.github.io/bit-company-website/ | GitHub Pages artifact из корневого сайта |

**Полный гайд:** [PRESENTATION.md](./PRESENTATION.md). Файловая структура, как править что, gotcha'и.

Прежняя презентация из `presentation/` больше не нужна и не публикуется на GitHub Pages.

## Что это

Маркетинговый сайт **ООО «БИТ»** (Бизнес Информационные Технологии) — нового юр.лица под продуктовое направление. Сайт презентует SaaS-продукты, разработанные внутри **BTS Holding** (та же команда, та же экспертиза, отдельная контейнерная упаковка для b2b-рынка).

GitHub: https://github.com/dephaq/bit-company-website (public, dephaq, не jojoprison).

## Жёсткие продуктовые правила для smeta

- GGE — это формат экспорта для Главгосэкспертизы. MGE — формат экспорта для МГЭ.
- Никогда не писать, что GGE — это формат для Турбосметчика. Это неверно.
- Правильная формулировка: система экспортирует сметы в GGE/MGE; эти экспортные файлы дальше можно открывать или использовать в сметных системах вроде Турбосметчика, Гранд-Сметы, ABC-4, РИК.
- Не писать `GGE для Турбосметчика`, `Турбосметчик (GGE/MGE)` или аналогичные связки.
- Не сужать продукт до водопровода, канализации или отдельных разделов вроде `раздел 22/23`.
- Позиционировать smeta как универсальный продукт для строительных компаний: система обучается на архиве старых смет заказчика, перенимает привычный формат, структуру выдачи и типовой выбор расценок.
- Для выгрузки использовать корректные формулировки: `GGE для Главгосэкспертизы`, `MGE для МГЭ`, `формат заказчика`, `согласованный формат`, `экспортный пакет`, `черновик сметы`, `список спорных строк`.

## Связь с другими проектами

- **bts-holding** (`~/Documents/projects/bts-holding/`) — материнская инфраструктура. Производственный сервер `89.169.128.195` хостит и `blackscope.ru` (BTS dashboard), и `bit-company.ru` через multi-tenant nginx. Все продукты на сайте — это переупакованный софт BTS.
- **bts-max-bot** (`~/Documents/projects/bts-max-bot/`) — бот в МАКС. Реальный код продукта «Цифровой табель».

**Ключевой нюанс:** сайт — про SaaS для рынка, но всё, что описано, **уже работает внутри BTS Holding** (это пилотная площадка). Холдинг ≠ ООО «БИТ» — холдинг это БТС-стройка, ООО «БИТ» это новое юр.лицо для продажи софта.

## Production deploy — bit-company.ru

Stack: статический HTML/CSS, без сборки. Хостится на BTS prod-сервере через multi-tenant nginx.

```bash
# 1. локальные правки → коммит → push в main
git add -A && git commit -m "..." && git push origin main

# 2. одна команда на проде — nginx reload НЕ нужен (статика читается с диска при каждом запросе)
ssh deploy@bts "cd /opt/sites/bit-company/site && git pull origin main"

# 3. live-верификация
curl -s https://bit-company.ru/ | grep -E "<нужная-фраза>"
```

**Откат:** `ssh deploy@bts "cd /opt/sites/bit-company/site && git reset --hard <prev-sha>"`.

**Если правишь nginx-конфиг** (`/opt/sites-extra/bit-company.conf` на сервере, **вне BTS-репо**):
```bash
ssh deploy@bts "vi /opt/sites-extra/bit-company.conf"
ssh deploy@bts "docker exec bts-nginx-1 nginx -t && docker exec bts-nginx-1 nginx -s reload"
```

Если `nginx -t` падает — НЕ делать reload, blackscope.ru продолжит работать на старом конфиге.

## GitHub Pages

Деплой GitHub Pages полностью автоматический через `.github/workflows/pages.yml`.

Workflow собирает `_site` из:

- `*.html`
- `assets/**`
- `products/**`
- `services/**`

Push в `main` с изменением этих файлов обновит `https://dephaq.github.io/bit-company-website/` через GitHub Actions.

## Связанные заметки в Obsidian (vault main)

- `Atom — bit-company.ru production hot paths (где править что и как)` — runbook deploy
- `Molecule — bit-company.ru deploy + multi-tenant nginx (BTS prod)` — архитектура
- `Atom — bit-company.ru deploy plan на BTS prod (nginx symlink gotcha)` — gotcha с symlink
- `Atom — bit-company.ru prod sync drift (12 коммитов untouched после деплоя)` — урок про ручной `ssh git pull`
- `Atom — YC CDN 14 гочей setup ourcdn 2026-05-01` — CDN edge перед origin (purge через `yc cdn`)
- `Session — 2026-04-30 bit-company.ru live + multi-tenant nginx complete` — chronicle первого деплоя
- `MOC — BTS Holding` — карта контента holding-связанных заметок

## Auto-memory (Claude Code) — кросс-проектная

- **bit-company-website project** (этот): `~/.claude/projects/-Users-jkaseq-Documents-projects-bit-company-website/memory/cross_project_bit_company.md` — полная карта файлов / runbook / гочи / связь с bts-holding и bts-max-bot. Читается автоматически при запуске Claude из этого проекта.
- **bts-holding project** (соседний): `~/.claude/projects/-Users-jkaseq-Documents-projects-bts-holding/memory/bit_company_landing_presentation_split.md` — историческая memory про разделение лендинга и презентации; учитывать, что сейчас GitHub Pages публикует обычный сайт.
- Обе memory файла **синхронизированы по содержанию** (создавались в одной сессии 04.05.2026), но **разные по фокусу:** этот — для работы внутри bit-company, тот — для bts-holding-сессий.

## Что НЕ делать

1. **Не править nginx-конфиг через BTS-репо** — `/opt/sites-extra/bit-company.conf` живёт **отдельно** на сервере. `make deploy-back` его не затронет.
2. **Не делать `--standalone` для certbot** — обязательно `--webroot` (auto-renewal через `/opt/bts/certbot-webroot/`), иначе nginx ляжет на 30-60 сек и blackscope/bit-company упадут вместе.
3. **GH Pages** теперь публикует тот же маркетинговый сайт, что и `bit-company.ru`, через GitHub Actions artifact. Source в Settings должен быть `GitHub Actions`.
4. **Не использовать `location = /index.html { return 301 /; }`** — даёт infinite loop с `index index.html`. Только `if ($request_uri = "/index.html")`.

## SSL / DNS

- DNS: nic.ru (https://www.nic.ru/manager/my_domains.cgi → bit-company.ru)
- SSL: Let's Encrypt webroot, авто-renewal через systemd timer на проде, в `/opt/bts/certs/live/bit-company.ru/`
- Истечение: ~29.07.2026 (auto-renewal стрельнёт ~29.06.2026)
