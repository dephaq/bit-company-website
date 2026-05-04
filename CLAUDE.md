# bit-company-website — контекст для Claude

## ⚠️ Прежде чем что-либо делать — прочитай PRESENTATION.md

Этот репо публикуется в **двух местах одновременно**, читающих **разные части** репо:

| URL | Источник |
|---|---|
| https://bit-company.ru/ | корень репо (лендинг + страницы сайта) |
| https://dephaq.github.io/bit-company-website/ | папка `presentation/` (GitHub Pages через Actions) |

**Полный гайд:** [PRESENTATION.md](./PRESENTATION.md). Файловая структура, как править что, gotcha'и.

**Категорический запрет:** не класть презентацию в корневой `index.html`. Прецедент 30.04.2026 (коммит `fb61599`) — презентация заехала на публичный домен `bit-company.ru` вместо лендинга. Разбирали 04.05.2026 (этот фикс). Презентация ВСЕГДА в `presentation/index.html`, корневой `index.html` ВСЕГДА маркет-лендинг.

## Что это

Маркетинговый сайт **ООО «БИТ»** (Бизнес Информационные Технологии) — нового юр.лица под продуктовое направление. Сайт презентует SaaS-продукты, разработанные внутри **BTS Holding** (та же команда, та же экспертиза, отдельная контейнерная упаковка для b2b-рынка).

GitHub: https://github.com/dephaq/bit-company-website (public, dephaq, не jojoprison).

## Связь с другими проектами

- **bts-holding** (`~/Documents/projects/bts-holding/`) — материнская инфраструктура. Производственный сервер `89.169.128.195` хостит и `blackscope.ru` (BTS dashboard), и `bit-company.ru` через multi-tenant nginx. Все продукты на сайте — это переупакованный софт BTS.
- **bts-max-bot** (`~/Documents/projects/bts-max-bot/`) — бот в МАКС из презентации (слайды 12-14, скриншоты слайда 14). Реальный код продукта «Цифровой табель».

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

## Когда правишь презентацию (`presentation/index.html`)

Это длинный одностраничник со слайдами `<section class="slide" data-slide="N">`. Перед правкой одного абзаца — **проверять согласованность с соседними слайдами**: цифры/частоты/термины часто дублируются. Типичные точки рассинхрона:

- Слайды 11 и 12 (`02 / ТАБЕЛИ`) — частота выгрузки в 1С ЗУП повторяется.
- Слайд 14 (`compare-grid` «КАК СЕЙЧАС / КАК СТАНЕТ`) — часто идёт парой со слайдом 12.
- Хотлинки на отдельные продукты (`products/timesheet.html` etc.) — самостоятельные страницы, в них своя редакция.

**Команда `grep -n "ключевое-слово" presentation/index.html`** перед правкой = must-do.

Деплой презентации — **полностью автоматический** через GitHub Actions (`.github/workflows/pages.yml`). Push в main с правкой `presentation/**` → через ~1 минуту обновится `dephaq.github.io/bit-company-website/`. Никаких ручных команд.

## Связанные заметки в Obsidian (vault main)

- `Session — 2026-05-04 bit-company.ru landing presentation split + branded 404 + Node 24` — **главный narrative-hub этого фикса** (читать первым)
- `Atom — bit-company.ru landing presentation split via GitHub Actions (2026-05-04)` — детали разделения
- `Atom — bit-company.ru presentation redirect to gh-pages (deferred 2026-05-04)` — backlog с триггерами
- `Atom — bit-company.ru production hot paths (где править что и как)` — runbook deploy
- `Molecule — bit-company.ru deploy + multi-tenant nginx (BTS prod)` — архитектура
- `Atom — bit-company.ru deploy plan на BTS prod (nginx symlink gotcha)` — gotcha с symlink
- `Atom — index.html slides рассинхрон при точечной правке (grep-привычка)` — grep перед правкой `presentation/index.html`
- `Atom — bit-company.ru prod sync drift (12 коммитов untouched после деплоя)` — урок про ручной `ssh git pull`
- `Atom — YC CDN 14 гочей setup ourcdn 2026-05-01` — CDN edge перед origin (purge через `yc cdn`)
- `Session — 2026-04-30 bit-company.ru live + multi-tenant nginx complete` — chronicle первого деплоя
- `Session — 2026-05-01 bit-company.ru правки Лёни (5 правок + CLAUDE.md)` — правки презентации до split-фикса
- `MOC — BTS Holding` — карта контента holding-связанных заметок

## Auto-memory (Claude Code) — кросс-проектная

- **bit-company-website project** (этот): `~/.claude/projects/-Users-jkaseq-Documents-projects-bit-company-website/memory/cross_project_bit_company.md` — полная карта файлов / runbook / гочи / связь с bts-holding и bts-max-bot. Читается автоматически при запуске Claude из этого проекта.
- **bts-holding project** (соседний): `~/.claude/projects/-Users-jkaseq-Documents-projects-bts-holding/memory/bit_company_landing_presentation_split.md` — для BTS-сессий чтобы знать про этот сайт и не сломать его при `make deploy-back` или nginx-правках.
- Обе memory файла **синхронизированы по содержанию** (создавались в одной сессии 04.05.2026), но **разные по фокусу:** этот — для работы внутри bit-company, тот — для bts-holding-сессий.

## Что НЕ делать

1. **Не править nginx-конфиг через BTS-репо** — `/opt/sites-extra/bit-company.conf` живёт **отдельно** на сервере. `make deploy-back` его не затронет.
2. **Не делать `--standalone` для certbot** — обязательно `--webroot` (auto-renewal через `/opt/bts/certbot-webroot/`), иначе nginx ляжет на 30-60 сек и blackscope/bit-company упадут вместе.
3. **GH Pages** теперь — это **намеренное** второе место публикации, отдаёт презентацию из `presentation/` через GitHub Actions. НЕ отключать. Если нужно поменять source в Settings — это умеет только владелец dephaq, jojoprison-токен не имеет admin-прав на Settings.
4. **Не использовать `location = /index.html { return 301 /; }`** — даёт infinite loop с `index index.html`. Только `if ($request_uri = "/index.html")`.

## SSL / DNS

- DNS: nic.ru (https://www.nic.ru/manager/my_domains.cgi → bit-company.ru)
- SSL: Let's Encrypt webroot, авто-renewal через systemd timer на проде, в `/opt/bts/certs/live/bit-company.ru/`
- Истечение: ~29.07.2026 (auto-renewal стрельнёт ~29.06.2026)
