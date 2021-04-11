export const machine = theme => ({
  paddingTop: 0,
  paddingBottom: 0,
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  margin: theme.spacing(1),
  display: "flex",
  alignItems: "baseline",
  maxWidth: "600px",
  boxSizing: "border-box",
});

export const job = theme => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  margin: theme.spacing(1),
  maxWidth: "800px",
  boxSizing: "border-box",
});

export const procedure = theme => ({
  boxShadow: theme.shadows[3],
  marginBottom: "2px",
  borderRadius: "4px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  flexShrink: 0
})

const sharedStyles = theme => ({
  machine: machine(theme),
  job: job(theme),
  procedure: procedure(theme)
});

export default sharedStyles;