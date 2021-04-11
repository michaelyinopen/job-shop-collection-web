import { withStyles } from '@material-ui/core/styles';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

export const toggleButtonGroupBorderStyle = theme => ({
  display: 'flex',
  border: `1px solid ${theme.palette.divider}`,
  flexWrap: 'wrap'
});

const StyledToggleButtonGroup = withStyles(theme => ({
  grouped: {
    margin: theme.spacing(0.5),
    border: 'none',
    '&:not(:first-child)': {
      borderRadius: "50%",
    },
    '&:first-child': {
      borderRadius: "50%",
      borderLeft: "1px solid transparent"
    },
  },
}))(ToggleButtonGroup);

export default StyledToggleButtonGroup;