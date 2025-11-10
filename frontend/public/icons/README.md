# PWA Icons Setup Instructions

The CivicConnect app now supports separate PWAs for citizens and administrators with distinct icon sets.

## Required Icon Sets:

### Citizen PWA (Blue Theme):
- citizen-icon-192.png (192x192)
- citizen-icon-512.png (512x512)
- citizen-icon-maskable-192.png (192x192 with safe zone)
- citizen-icon-maskable-512.png (512x512 with safe zone)

### Admin PWA (Red Theme):
- admin-icon-192.png (192x192)
- admin-icon-512.png (512x512)
- admin-icon-maskable-192.png (192x192 with safe zone)
- admin-icon-maskable-512.png (512x512 with safe zone)

### Legacy Icons (Still Required):
- 72x72px (icon-72x72.png)
- 96x96px (icon-96x96.png)
- 128x128px (icon-128x128.png)
- 144x144px (icon-144x144.png)
- 152x152px (icon-152x152.png)
- 192x192px (icon-192x192.png)
- 384x384px (icon-384x384.png)
- 512x512px (icon-512x512.png)

## Design Guidelines:

### Citizen Icons:
- Primary Color: #3B82F6 (blue-500)
- Secondary Color: #1E40AF (blue-700)
- Theme: Community focused, user-friendly
- Symbols: Buildings, people, communication

### Admin Icons:
- Primary Color: #DC2626 (red-600)
- Secondary Color: #B91C1C (red-700)
- Theme: Official, administrative
- Symbols: Dashboard, charts, official badge

## Icon Specifications:
- Format: PNG with transparent background
- Safe zone for maskable icons: 40px padding on 192px, 102px padding on 512px
- Minimum contrast ratio: 4.5:1 for accessibility

## Icon Generation:
1. Use the icon.svg file as the source for legacy icons
2. Create separate citizen and admin variants
3. Convert to PNG files at the required sizes
4. Ensure icons have transparent backgrounds or solid colors
5. Test on different devices and browsers

## Tools for Icon Generation:
- Online converters: realfavicongenerator.net, favicon.io
- Command line: ImageMagick, sharp-cli
- Design tools: Figma, Sketch, Adobe Illustrator

## Current Icon Design:
- Background: Dark gray (#1f2937)
- Accent: Blue (#3b82f6)
- Theme: Mumbai cityscape with complaint/report symbol
- Text: CivicConnect branding

## For Production:
Replace with professionally designed icons that match Mumbai BMC branding guidelines and separate citizen/admin identities.

## Quick Generation Commands:
```bash
# Citizen icon (blue circle)
convert -size 192x192 xc:none -fill "#3B82F6" -draw "circle 96,96 96,30" citizen-icon-192.png
convert -size 512x512 xc:none -fill "#3B82F6" -draw "circle 256,256 256,80" citizen-icon-512.png

# Admin icon (red circle)
convert -size 192x192 xc:none -fill "#DC2626" -draw "circle 96,96 96,30" admin-icon-192.png
convert -size 512x512 xc:none -fill "#DC2626" -draw "circle 256,256 256,80" admin-icon-512.png
```