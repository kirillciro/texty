# iOS App Icon Guide - Layered & Adaptive Icons

## Modern iOS Icon Requirements (iOS 18+)

For the latest iOS with tinted icons and adaptive appearance, you need **3 variants**:

### 1. **Light Mode Icon**

- Used in light mode
- Full color with your brand colors
- Path: `./assets/images/icon.png`
- Size: **1024x1024px**

### 2. **Dark Mode Icon** (Optional but Recommended)

- Used in dark mode
- Can have adjusted colors for better dark mode visibility
- Path: `./assets/images/icon-dark.png`
- Size: **1024x1024px**

### 3. **Tinted/Monochrome Icon**

- Used when iOS applies tinted appearance (new in iOS 18)
- Single color silhouette of your icon
- System applies color based on user's wallpaper/theme
- Path: `./assets/images/icon-tinted.png`
- Size: **1024x1024px**
- Should be: **Black shape on transparent background**

## How to Create These Icons

### For Figma/Sketch/Adobe XD:

1. **Main Icon (Light)**:

   - Create your full-color icon at 1024x1024
   - Export as `icon.png`

2. **Dark Mode Icon**:

   - Duplicate your main icon
   - Adjust colors to look good on dark backgrounds
   - Consider using lighter/brighter colors
   - Export as `icon-dark.png`

3. **Tinted Icon**:
   - Create a solid black silhouette version
   - Remove all colors and gradients
   - Keep only the shape/outline
   - Must be on transparent background
   - Export as `icon-tinted.png`

### Using Your Existing Icons

You already have:

- `apple-icon-white.png` - Can be used as tinted icon
- `apple-icon-black.png` - Alternative tinted option

## Update Your app.json

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "ios": {
      "icon": {
        "backgroundColor": "#000000",
        "image": "./assets/images/icon.png",
        "dark": {
          "image": "./assets/images/icon-dark.png"
        },
        "tinted": {
          "image": "./assets/images/icon-tinted.png"
        }
      }
    }
  }
}
```

## Splash Screen with Adaptive Icons

Your splash screen already has dark mode support! ✅

Current configuration:

```json
{
  "image": "./assets/images/splash-icon.png",
  "imageWidth": 200,
  "backgroundColor": "#ffffff",
  "dark": {
    "backgroundColor": "#000000"
  }
}
```

### To add tinted splash:

Create `splash-icon-dark.png` for dark mode if you want different splash icon appearance.

## Android Adaptive Icons

Your Android setup is already perfect! ✅

You have:

- `android-icon-foreground.png` - Main icon layer
- `android-icon-background.png` - Background layer
- `android-icon-monochrome.png` - Monochrome version (Material You)

## Testing Your Icons

After creating the icons:

1. **Rebuild the app**:

   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

2. **Test different modes**:

   - Light mode: Settings → Appearance → Light
   - Dark mode: Settings → Appearance → Dark
   - Tinted: iOS automatically applies based on wallpaper

3. **Check on home screen**:
   - Different wallpapers
   - Different appearance modes
   - Widget tinting

## Quick Setup Steps

1. Create/prepare your 3 icon variants (1024x1024 each)
2. Place them in `assets/images/`
3. Update `app.json` with paths
4. Run `npx expo prebuild --clean`
5. Build and test on device

## Icon Design Tips

- **Keep it simple**: Icons look small on home screen
- **High contrast**: Ensure icon is visible in all modes
- **Recognizable silhouette**: Tinted version should be identifiable
- **Consistent branding**: All variants should feel cohesive
- **Test on device**: Simulators don't always show accurate results

## Resources

- [Apple Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Expo Icon Assets](https://docs.expo.dev/develop/user-interface/app-icons/)
- [iOS 18 Tinted Icons Guide](https://developer.apple.com/documentation/Xcode/configuring-your-app-icon)
