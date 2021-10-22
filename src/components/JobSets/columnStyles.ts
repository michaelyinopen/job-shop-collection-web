import type { Theme } from "@material-ui/core"

export const columnStyles = (theme: Theme) => ({
  table: {
    tableLayout: 'fixed',
  },
  idColumn: { width: 56 },
  titleColumn: {
    width: 200,
    boxSizing: 'border-box',
    [theme.breakpoints.down('xs')]: { width: '100%' }
  },
  descriptionColumn: {
    width: '100%',
  },
  actionsColumn: { width: 96, boxSizing: 'border-box' }
})