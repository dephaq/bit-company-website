# bit-company-website — контекст для Claude

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

## Когда правишь презентацию (`index.html`)

Это длинный одностраничник со слайдами `<section class="slide" data-slide="N">`. Перед правкой одного абзаца — **проверять согласованность с соседними слайдами**: цифры/частоты/термины часто дублируются. Типичные точки рассинхрона:

- Слайды 11 и 12 (`02 / ТАБЕЛИ`) — частота выгрузки в 1С ЗУП повторяется.
- Слайд 14 (`compare-grid` «КАК СЕЙЧАС / КАК СТАНЕТ`) — часто идёт парой со слайдом 12.
- Хотлинки на отдельные продукты (`products/timesheet.html` etc.) — самостоятельные страницы, в них своя редакция.

**Команда `grep -n "ключевое-слово" index.html`** перед правкой = must-do.

## Связанные заметки в Obsidian (vault main)

- `Atom — bit-company.ru production hot paths (где править что и как)` — runbook deploy
- `Molecule — bit-company.ru deploy + multi-tenant nginx (BTS prod)` — архитектура
- `Atom — bit-company.ru deploy plan на BTS prod (nginx symlink gotcha)` — gotcha с symlink
- `Session — 2026-04-30 bit-company.ru live + multi-tenant nginx complete` — chronicle
- `MOC — BTS Holding` — карта контента holding-связанных заметок

## Что НЕ делать

1. **Не править nginx-конфиг через BTS-репо** — `/opt/sites-extra/bit-company.conf` живёт **отдельно** на сервере. `make deploy-back` его не затронет.
2. **Не делать `--standalone` для certbot** — обязательно `--webroot` (auto-renewal через `/opt/bts/certbot-webroot/`), иначе nginx ляжет на 30-60 сек и blackscope/bit-company упадут вместе.
3. **GH Pages** старый параллельный хост (`dephaq.github.io/bit-company-website/`) — задача отключить через UI владельца dephaq, jojoprison-токен не имеет admin-прав.
4. **Не использовать `location = /index.html { return 301 /; }`** — даёт infinite loop с `index index.html`. Только `if ($request_uri = "/index.html")`.

## SSL / DNS

- DNS: nic.ru (https://www.nic.ru/manager/my_domains.cgi → bit-company.ru)
- SSL: Let's Encrypt webroot, авто-renewal через systemd timer на проде, в `/opt/bts/certs/live/bit-company.ru/`
- Истечение: ~29.07.2026 (auto-renewal стрельнёт ~29.06.2026)
