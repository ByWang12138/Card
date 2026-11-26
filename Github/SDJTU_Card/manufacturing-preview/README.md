# Offline Manufacturing Preview

This browser application previews the acrylic keepsake and exports one ZIP containing a millimeter DXF, color and white-ink PDF, two-sheet engineering drawing, and use notice. It runs from a single HTML file after building.

Use an authorized copy of the matching offline preview from the project owner. This repository does not distribute institutional artwork, letter-hole artwork, generated passes, sample ZIPs, or completed local settings.

With Node.js 18 or later:

```powershell
npm ci
npm run import-private -- "C:\path\to\your\local\index.html"
npm run build
```

Open `dist/index.html` directly in a browser. WebGL 2 enables the 3D view. Setup needs the npm packages, but the built page runs offline.

The import command copies the private artwork out of the owner's single-file preview into `private/`. Keep both `private/` and `dist/` local. The map is carried through as supplied by the owner, with its OpenStreetMap attribution. The existing Python application is independent of this preview.
