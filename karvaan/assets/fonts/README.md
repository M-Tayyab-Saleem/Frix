# Font Setup for Frix

The app requires the following font files in `assets/fonts/`:

## Required Fonts

1. **Noto Serif** (for headlines/editorial typography)
   - `NotoSerif-Bold.ttf`
   - `NotoSerif-SemiBold.ttf`
   - `NotoSerif-Regular.ttf`

2. **Manrope** (for body text and UI elements)
   - `Manrope-Regular.ttf`
   - `Manrope-Medium.ttf`
   - `Manrope-SemiBold.ttf`

## How to Download

### Option 1: Google Fonts (Recommended)
1. Visit https://fonts.google.com/specimen/Noto+Serif
2. Download all weights (Regular, SemiBold, Bold)
3. Visit https://fonts.google.com/specimen/Manrope
4. Download all weights (Regular, Medium, SemiBold)
5. Place `.ttf` files in `assets/fonts/` directory

### Option 2: Use Expo Google Fonts Package
Alternatively, you can use the `@expo-google-fonts` packages:

```bash
npx expo install @expo-google-fonts/noto-serif @expo-google-fonts/manrope
```

Then update `App.tsx` to use:
```typescript
import { useFonts, NotoSerif_700Bold, NotoSerif_600SemiBold, ... } from '@expo-google-fonts/...';
```

However, the current implementation uses local `.ttf` files for better control and performance.

## File Structure

After adding fonts, your structure should look like:
```
assets/
├── frix_logo.png
└── fonts/
    ├── NotoSerif-Bold.ttf
    ├── NotoSerif-SemiBold.ttf
    ├── NotoSerif-Regular.ttf
    ├── Manrope-Regular.ttf
    ├── Manrope-Medium.ttf
    └── Manrope-SemiBold.ttf
```

## Temporary Workaround

If you don't have the fonts yet, the app will fail to load. As a temporary workaround, you can:
1. Download any `.ttf` font file
2. Rename it to match the required names above
3. Place in `assets/fonts/`

The app will at least launch, though typography won't look correct until proper fonts are added.
