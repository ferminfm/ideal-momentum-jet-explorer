# Screenshot Notes

Do not commit screenshots captured from a private desktop session unless the
image has been reviewed for private tabs, paths, notifications, file names, and
personal data.

The visual smoke test writes temporary desktop and mobile screenshots to `/tmp`:

```bash
npm run dev -- --host 127.0.0.1
npm run smoke:visual
```

Use those files for local review first. If permanent public screenshots are
added later, capture them from the live app or a clean local browser profile and
store only sanitized images in this directory.
