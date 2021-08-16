import {
  FormControl,
  InputLabel,
  OutlinedInput,
  MenuItem,
  Select,
} from '@material-ui/core'
import SelectInput from '@material-ui/core/Select/SelectInput'
import { PopperSelect } from './PopperSelect'
/**
 * variant is always outlined
 * @returns 
 */
export const PopperSelectField = () => {
  return (
    <div>
      <FormControl variant="outlined">
        <InputLabel htmlFor="component-outlined">Name</InputLabel>
        <OutlinedInput
          id="component-outlined"
          label="Name"
          inputComponent='input'
        />
      </FormControl>
      <br/>
      <br/>
      <FormControl variant="outlined">
        <InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>
        <PopperSelect
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          label="Age"
          value={10}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </PopperSelect>
      </FormControl>
      <br/>
      <br/>
      <FormControl variant="outlined">
        <InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          label="Age"
          value={10}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
    </div>
    // <FormControl variant="outlined">
    //   <InputLabel htmlFor="component-outlined">Age</InputLabel>
    //   <OutlinedInput id="component-outlined"/>
    //   <Select
    //     labelId="demo-simple-select-filled-label"
    //     id="demo-simple-select-filled"
    //     value={age}
    //     onChange={handleChange}
    //   >
    //     <MenuItem value="">
    //       <em>None</em>
    //     </MenuItem>
    //     <MenuItem value={10}>Ten</MenuItem>
    //     <MenuItem value={20}>Twenty</MenuItem>
    //     <MenuItem value={30}>Thirty</MenuItem>
    //   </Select>
    // </FormControl>
  )
}