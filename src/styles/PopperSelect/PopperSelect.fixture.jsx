import { useState } from 'react'
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  MenuItem,
  Select,
  makeStyles,
} from '@material-ui/core'
import {
  ThemeDecorator
} from '../../__decorators__'
import { PopperSelect } from './PopperSelect'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}))

export const PopperSelectFixture = () => {
  const classes = useStyles()
  const [age, setAge] = useState('')

  const handleChange = (event) => {
    setAge(event.target.value)
  }

  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <br />

      <h2>Popper Select</h2>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>
        <PopperSelect
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          label="Age"
          value={age}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </PopperSelect>
      </FormControl>


      <h2>MUI Select</h2>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          label="Age"
          value={age}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>


      <h2>MUI Select disableScrollLock</h2>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          label="Age"
          value={age}
          onChange={handleChange}
          MenuProps={{
            disableScrollLock: true
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>


      <h2>Text Field</h2>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel htmlFor="component-outlined">Name</InputLabel>
        <OutlinedInput
          id="component-outlined"
          label="Name"
          inputComponent='input'
        />
      </FormControl>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      Somthing to show scroll
    </div>
  )
}

export default (
  <ThemeDecorator>
    <PopperSelectFixture />
  </ThemeDecorator>
)