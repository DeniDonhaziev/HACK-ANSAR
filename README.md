# PharmaCRM — CRM для фармацевтической компании

Мобильное React Native приложение (Expo) для управления продажами, compliance, логистикой и полевой работой медицинских представителей.

Поддерживает **облачный режим** (Firebase Auth + Firestore) и **локальный fallback** (AsyncStorage), если Firebase не настроен.

## Быстрый старт

```bash
git clone https://github.com/DeniDonhaziev/HACK-ANSAR.git
cd HACK-ANSAR
npm install --legacy-peer-deps
```

### 1. Настройка Firebase (рекомендуется)

1. Создайте проект в [Firebase Console](https://console.firebase.google.com).
2. Добавьте **Web app** и скопируйте конфиг.
3. В корне проекта создайте `.env` из шаблона:

```bash
cp .env.example .env
```

4. Заполните переменные в `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

5. В Firebase Console:
   - **Authentication** → включите **Email/Password**
   - **Firestore Database** → создайте базу
   - **Firestore → Rules** → вставьте правила из `firestore.rules` (или из `.env.example`)

6. Перезапустите dev-сервер после изменения `.env`.

### 2. Запуск

**Веб (браузер):**

```bash
npm run web
```

Откроется: **http://localhost:8081**

**Телефон (Expo Go):**

```bash
npm start
```

**Если порт 8081 занят:**

```bash
# Windows — найти и завершить процесс
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# или запуск на другом порту
npx expo start --web --localhost --port 8082
```

**Очистка кэша Metro (после смены .env):**

```bash
npx expo start --web --localhost --clear
```

### 3. Первый вход

При подключённом Firebase зарегистрируйте нового пользователя на экране входа — данные сохраняются в облаке.

Без Firebase приложение работает локально: первый зарегистрированный пользователь становится администратором.

## Модули

### Compliance и аудит
- **Audit Trail** — журнал изменений с IP/устройством, архивирование, экспорт
- **Электронные подписи** — подписание документов/визитов с 2FA
- **Согласования** — маршруты, дедлайны, комментарии
- **Согласия** — управление согласиями HCP
- **Подарки и расходы** — Transfer of Value, лимиты

### Склад и GDP
- Остатки по складам и сериям, сроки годности
- Поставки с температурным контролем, трассировка партий

### Полевая работа
- Визиты с check-in/check-out и геолокацией
- Карта клиентов и маршрут на день
- Offline-режим и синхронизация с Firestore

### KPI и аналитика
- Планы продаж, KPI медпредставителей и менеджеров
- ABC/XYZ анализ, дашборды, отчёты

### Документооборот
- Хранилище документов с версиями и правами доступа

### Безопасность
- Роли и права по отделам, 2FA
- Firebase Authentication + правила Firestore

## Архитектура

```
src/
├── components/          # UI: common, layout, dashboard
├── config/              # Firebase и конфигурация окружения
├── constants/           # Тема, тексты, доступ по отделам
├── data/                # Mock-данные (локальный режим)
├── hooks/                 # useResponsive, useDepartmentAccess, useAppNavigation
├── navigation/          # React Navigation, screenMap, desktop sidebar
├── screens/             # Экраны по модулям (auth, compliance, field, …)
├── services/
│   ├── firebase/        # Auth, Firestore, sync (облачный backend)
│   ├── *Service.ts      # Бизнес-логика модулей
│   └── storageService.ts
├── stores/              # Zustand: authStore, dataStore
├── types/               # TypeScript типы
└── utils/               # format, geocode, device

firestore.rules          # Правила безопасности Firestore
app.config.js            # Загрузка .env для Expo
```

### Поток данных

```
UI (screens/components)
    ↓
Zustand stores (authStore, dataStore)
    ↓
services/ ──→ firebase/ (если .env заполнен)
         └──→ storageService + AsyncStorage (локальный fallback)
```

При старте `initFirebase()` подключает Auth и Firestore. `authStore` и `dataStore` автоматически выбирают backend: `firebase` или `local`.

## Технологии

- React Native + Expo 56
- TypeScript
- React Navigation 7
- Zustand
- Firebase (Auth, Firestore)
- AsyncStorage (offline / fallback)
- expo-location, expo-crypto, react-native-maps

## Требования

- Node.js **>= 20.19.4** (рекомендуется LTS)
- npm

## Дальнейшее развитие

- Push-уведомления (FCM)
- Firebase Storage для документов
- Интеграции: 1С, SAP, Power BI
- Биометрическая аутентификация
