# RO Filter Tracker · ফিল্টার ট্র্যাকার

A Bangla/English mobile app that reminds you when to replace the cartridges in your home RO water purifier.

আপনার পানির পিউরিফায়ারের কোন ফিল্টার কবে বদলাতে হবে, তা মনে রাখে আর সময়মতো জানিয়ে দেয়।

Built with [Expo](https://expo.dev) and React Native.

## Features

- **Two-step setup.** Type your purifier's brand and a name, then add 2–7 cartridges.
- **Cartridge picker.** Choose from common types (PP, UDF, CTO, RO, T33, UF, UV, Mineral, Alkaline) or name your own, then set how many months it lasts and when you bought it.
- **Countdown for every cartridge.** A purifier-style display, days left, percent used, and a history of past replacements.
- **Reminders.** A local notification a few days before a cartridge is due, on the due date, and daily after it expires. A test button checks that notifications work.
- **Bangla and English**, switchable at any time, including the notification text.
- **Dark and light themes.**
- **Private by design.** Everything is stored on the device; there is no account or server.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` to open an emulator.

> **Notifications on Android:** Expo Go for Android doesn't include the notifications module. Everything else works there; to test reminders on Android, make a development build:
>
> ```bash
> npx expo run:android
> ```

## Checks

```bash
npx tsc --noEmit   # typecheck
npx expo lint      # lint
```

## Project layout

```
src/
  app/          screens (Expo Router)
    setup/      two-step setup: purifier, then cartridges
    filter/     cartridge detail
  components/   UI: machine display, cartridge drawings, sheets
  constants/    cartridge presets, strings (bn/en), theme
  lib/          storage, reminders, i18n, date maths
```

## Disclaimer

This is an independent project. It is not affiliated with or endorsed by any purifier manufacturer; brand names are used only to describe compatible cartridges.

## License

[MIT](LICENSE) © Kamrul Zaman

The 7-segment display font is [DSEG](https://github.com/keshikan/DSEG) by keshikan, used under the [SIL Open Font License 1.1](assets/fonts/DSEG-LICENSE.txt).
# ro-filter-tracker
