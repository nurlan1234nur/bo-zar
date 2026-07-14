> [!WARNING]
> This is a preserved historical root guide. Active setup instructions are now under [`docs/operations/`](../../../operations/). Commands may reflect the former development environment. Current implementation and canonical operations documentation take precedence.

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

Ихэвчлэн development server-ийн terminal-д харуулсан URL дээр нээгдэнэ.

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

Development server-ийн terminal-д харуулсан URL-г ашиглана.

Зогсоох:

```text
Terminal дээр Ctrl + C дарна.
```

## Mobile app асаах

Root folder дээрээс:

```powershell
corepack pnpm dev:mobile
```

Хэрэв Expo Go-г бодит утсан дээр ашиглаж байгаа бол backend URL-г тухайн төхөөрөмжөөс хүрэх боломжтой хаягаар өгнө:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="<API_BASE_URL>"
corepack pnpm dev:mobile
```

Android emulator дээр emulator-оос host backend-д хүрэх боломжтой API base ашиглана:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="<API_BASE_URL>"
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
- browser preview ашиглах бол `w` (web dependency/configuration шаардлагатай байж болно)

Зогсоох:

```text
Terminal дээр Ctrl + C дарна.
```

## Ажиллаж байгаа port/process-ийг хүчээр зогсоох

Windows дээр port ашиглаж байгаа process-ийн PID-г олох:

```powershell
netstat -ano | findstr :<PORT>
```

Тухайн PID зөв development process мөн гэдгийг шалгасны дараа:

```powershell
taskkill /PID <PID> /F
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

Seed demo хэрэглэгчийн жишээ:

```text
USER: <EXAMPLE_PHONE> / <REPLACE_ME>
ADMIN: <EXAMPLE_PHONE> / <REPLACE_ME>
```

Seed нь demo reports мөн үүсгэнэ. Admin web дээр login хийсний дараа Reports хэсэгт moderation хийх өгөгдөл харагдана.

Mobile TypeScript шалгах Windows command:

```powershell
.\mobile-app\node_modules\.bin\tsc.CMD -p mobile-app\tsconfig.json --noEmit
```
