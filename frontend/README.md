# Gestión hospitalaria: frontend

Aplicación Angular standalone generada con Angular CLI 22.3.0. Usa PrimeNG 22.1.5, Aura y PrimeIcons 8.0.2.

## Instalación y ejecución

Para crear el workspace desde cero, ejecuta esto en un directorio vacío:

```powershell
npx --yes @angular/cli@22.3.0 new hospital-frontend --directory frontend --standalone --routing --style=scss --file-name-style-guide=2016 --skip-install
cd frontend
npm install primeng@22.1.5 @primeuix/themes@3.1.1 primeicons@8.0.2
npm start
```

Si el workspace ya existe, usa `cd frontend; npm install; npm start`. La aplicación queda disponible en `http://localhost:4200`. Ejecuta `npm run build` para compilarla y `npm test -- --watch=false` para correr las pruebas.

## Tema y API

PrimeNG usa el preset Aura mediante `providePrimeNG({ theme: { preset: Aura } })` en `src/app/app.config.ts`; PrimeIcons se carga desde `angular.json`. Para cambiar de tema, instala `@primeuix/themes` y sustituye el import `Aura` por otro preset, por ejemplo `Lara` o `Material`.

PrimeNG 22 muestra un aviso en consola si no se configura una licencia PrimeUI. Añade la clave válida en la opción `license` de `providePrimeNG` según los términos de tu licencia; no la incluyas en el repositorio.

La URL base de la API está en `src/environments/environment.ts`. Por defecto es `http://localhost:8000`. Los servicios usan los endpoints `/auth/login`, `/auth/registro` y `/usuarios`.
