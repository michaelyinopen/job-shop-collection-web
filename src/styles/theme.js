import { createMuiTheme, responsiveFontSizes } from '@material-ui/core'

export const theme = responsiveFontSizes(
  createMuiTheme({
    typography: {
      button: {
        fontSize: "1rem",
        textTransform: 'none'
      },
      body2: {
        fontSize: "1rem"
      },
    },
    zIndex: {
      popper: 900
    },
    props: {
      MuiTypography: {
        variantMapping: {
          h1: 'h1',
          h2: 'h1',
          h3: 'h1',
          h4: 'h1',
          h5: 'h2',
          h6: 'h3',
          subtitle1: 'h2',
          subtitle2: 'h2',
        },
      },
      MuiFab: {
        variant: "extended",
        size: "medium",
        color: "primary",
      }
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          html: {
            height: '100%',
            overflow: 'overlay',
          },
          body: {
            height: '100%',
          },
          '#root': {
            height: '100%',
          },
        },
      },
      MuiFab: {
        root: {
          margin: 16
        }
      },
      MuiTypography: {
        h5: {
          fontWeight: 700,
        }
      },
      MuiTableCell: {
        paddingCheckbox: {
          boxSizing: 'content-box'
        }
      }
    }
  })
)