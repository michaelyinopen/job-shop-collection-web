import { useTheme, useMediaQuery } from '@material-ui/core'

export const useIsExtraSmallScreen = () => {
  const theme = useTheme()
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'))
  return isExtraSmallScreen
}