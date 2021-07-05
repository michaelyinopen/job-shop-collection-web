import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { routePaths } from '../../route'

export const HomeLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.home} {...props} />
))

export const JobSetsLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.jobSets} {...props} />
))

export const AboutLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.about} {...props} />
))