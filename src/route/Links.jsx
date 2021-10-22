import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import * as routePaths from './routePaths'

export const HomeLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.home} {...props} />
))

export const JobSetsLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.jobSets} {...props} />
))

export const AboutLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.about} {...props} />
))

export const NewJobSetLink = forwardRef((props, ref) => (
  <Link innerRef={ref} to={routePaths.newJobSet} {...props} />
))