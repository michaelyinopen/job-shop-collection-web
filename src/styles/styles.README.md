Special style overrides/ props are in `theme.js`.

`ThemeProvider` in `App.jsx`.

`box-sizing` is set globally on the <html> element to `border-box`, by `CssBaseline`, in `App.jsx`.

Each page should be in a `PageContainer` component.

Headers should use Typography, for responsive sizing, e.g. `<Typography variant="h4">Page not found</Typography>`. `h4` corresponds to a normal html `h1`.

Font size with px directly, do NOT use `theme.typography.pxToRem(12)`
```
    fontSize: 12,
```

Font weight with
```
    fontWeight: theme.typography.fontWeightRegular,
```

Import icons like this, for faster **development** startup time (named imports will be tree shaked in production regardless)
```
import AddIcon from '@material-ui/icons/Add';
```

Sample of transition
```
  root: {
    transition: theme.transitions.create(['color', 'padding-top'], {
      duration: theme.transitions.duration.short,
    }),
    padding: '6px 0 8px',
  },
```