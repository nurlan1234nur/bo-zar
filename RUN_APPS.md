# Web, Mobile ажиллуулах товч заавар

## Шаардлагатай зүйлс

- Node.js суусан байх
- Corepack ажилладаг байх
- Dependency суусан байх

```powershell
corepack pnpm install
```

## Web app асаах

Root folder дээрээс:

```powershell
corepack pnpm dev:web
```

Хэрэв global `pnpm` байхгүй бол root script-үүд `corepack pnpm` ашиглахаар тохируулагдсан. Шууд app folder руу зааж асаах бол:

```powershell
corepack pnpm --dir web-app dev
```

Ихэвчлэн дараах URL дээр нээгдэнэ:

```text
http://localhost:5173/
```

Зогсоох:

```text
Terminal дээр Ctrl + C дарна.
```

## Admin web асаах

```powershell
corepack pnpm dev:admin
```

Шууд app folder руу зааж асаах бол:

```powershell
corepack pnpm --dir admin-web dev
```

Ихэвчлэн:

```text
http://localhost:3001/
```

Зогсоох:

```text
Terminal дээр Ctrl + C дарна.
```

## Mobile app асаах

Root folder дээрээс:

```powershell
corepack pnpm dev:mobile
```

Хэрэв Expo Go-г бодит утсан дээр ашиглаж байгаа бол backend URL-г компьютерийн LAN IP-р өгнө. Жишээ:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.20:8080/api/v1"
corepack pnpm dev:mobile
```

Android emulator дээр ихэвчлэн:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://10.0.2.2:8080/api/v1"
corepack pnpm dev:mobile
```

Шууд app folder руу зааж асаах бол:

```powershell
corepack pnpm --dir mobile-app dev
```

Эсвэл `mobile-app` folder дотор байгаа бол:

```powershell
corepack pnpm dev
```

Expo Metro нээгдсэний дараа:

- утсан дээр Expo Go app-аар QR code уншуулна
- Android emulator ашиглах бол terminal дээр `a`
- iOS simulator ашиглах бол `i` macOS дээр
- browser preview ашиглах бол `w`

Зогсоох:

```text
Terminal дээр Ctrl + C дарна.
```

## Ажиллаж байгаа port/process-ийг хүчээр зогсоох

Жишээ нь web app `5173` port дээр гацсан бол:

```powershell
netstat -ano | findstr :5173
```

Гарсан PID-г ашиглаад:

```powershell
taskkill /PID <PID> /F
```

Жишээ:

```powershell
taskkill /PID 12345 /F
```

## Build шалгах

```powershell
corepack pnpm --dir backend build
corepack pnpm --dir web-app build
corepack pnpm --dir admin-web build
```

## Backend migration run

```powershell
corepack pnpm --dir backend migration:run
```

Rollback:

```powershell
corepack pnpm --dir backend migration:revert
```

## Backend seed хийх

PostgreSQL ажиллаж байгаа үед role/category/location эхний өгөгдөл оруулах:

```powershell
corepack pnpm seed:backend
```

Seed demo хэрэглэгч:

```text
USER: 99112233 / password123
ADMIN: 99000000 / admin123
```

Seed нь demo reports мөн үүсгэнэ. Admin web дээр login хийсний дараа Reports хэсэгт moderation хийх өгөгдөл харагдана.

Mobile TypeScript шалгах:

```powershell
cd mobile-app
.\node_modules\.bin\tsc.CMD --noEmit
```
