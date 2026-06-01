# Публикация сайта — что где живёт

Этот репозиторий теперь публикует **один и тот же маркетинговый сайт** в двух местах:

| URL | Что отдаёт | Откуда |
|---|---|---|
| https://bit-company.ru/ | Маркет-лендинг + страницы сайта | Production-сервер BTS, читает корень репо через `git pull origin main` |
| https://dephaq.github.io/bit-company-website/ | Тот же маркет-лендинг + страницы сайта | GitHub Pages через GitHub Actions |

Прежняя презентация из `presentation/` больше не используется и удалена из публикации.

## Файловая структура

```text
bit-company-website/
├─ index.html              ← главная страница сайта
├─ about.html
├─ contact.html
├─ 404.html
├─ products/
│  ├─ index.html
│  ├─ timesheet.html
│  ├─ finance.html
│  ├─ smeta.html
│  └─ logistics.html
├─ services/
│  ├─ index.html
│  ├─ ai-agents.html
│  ├─ development.html
│  └─ integrations.html
├─ assets/
│  ├─ style.css
│  ├─ app.js
│  ├─ icon.svg
│  └─ favicon.ico
├─ .github/workflows/
│  └─ pages.yml            ← workflow деплоя сайта на GitHub Pages
├─ CLAUDE.md
├─ PRESENTATION.md
└─ README.md
```

## Как править сайт

```bash
git add <changed-files>
git commit -m "..."
git push origin main
```

После push:

- GitHub Pages обновится автоматически через `.github/workflows/pages.yml`.
- Production `bit-company.ru` нужно подтянуть вручную:

```bash
ssh deploy@bts "cd /opt/sites/bit-company/site && git pull origin main"
```

Если алиас `bts` не настроен:

```bash
ssh deploy@89.169.128.195 "cd /opt/sites/bit-company/site && git pull origin main"
```

Nginx reload не нужен: это статический сайт, файлы читаются с диска.

## GitHub Pages

Workflow собирает `_site` только из публичных файлов:

- `*.html`
- `assets/**`
- `products/**`
- `services/**`

Документация, служебные файлы и старая презентация не публикуются.

Для работы Pages в настройках репозитория должно быть:

1. Settings → Pages
2. Source: `GitHub Actions`

## Verification

```bash
curl -s https://bit-company.ru/ | grep -E "<title>"
curl -s https://dephaq.github.io/bit-company-website/ | grep -E "<title>"
curl -s https://dephaq.github.io/bit-company-website/products/smeta.html | grep -E "coverage|Coverage"
```

Оба домена должны отдавать один и тот же сайт.

## Откат

Production:

```bash
ssh deploy@bts "cd /opt/sites/bit-company/site && git log --oneline -10"
ssh deploy@bts "cd /opt/sites/bit-company/site && git reset --hard <prev-sha>"
```

GitHub Pages:

```bash
git revert <bad-commit>
git push origin main
```
