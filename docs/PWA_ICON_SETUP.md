## PWA Icon Setup Guide

Since you have an SVG favicon, you need to create PNG icons for PWA support.

### Quick Setup:

**Option 1: Use online tool (Recommended for speed)**
1. Go to https://realfavicongenerator.net/
2. Upload your `/public/favicon.svg`
3. Download the generated icons
4. Save as `/public/icon-192.png` and `/public/icon-512.png`

**Option 2: Use ImageMagick (if installed)**
```bash
# Install ImageMagick if not installed
brew install imagemagick

# Convert SVG to PNG icons
convert -background none -resize 192x192 public/favicon.svg public/icon-192.png
convert -background none -resize 512x512 public/favicon.svg public/icon-512.png
```

**Option 3: Manual creation**
1. Open `public/favicon.svg` in a design tool (Figma, Sketch, etc.)
2. Export as PNG at 192x192px → save as `icon-192.png`
3. Export as PNG at 512x512px → save as `icon-512.png`
4. Place both files in the `/public` directory

### Required Icon Sizes:
- `icon-192.png` - 192x192px (required)
- `icon-512.png` - 512x512px (required)

Both should have transparent backgrounds and match your brand colors (#3b82f6).
