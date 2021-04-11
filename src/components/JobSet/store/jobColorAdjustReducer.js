import arrayEqual from '../../../functions/arrayEqual';
import getNewColor from './jobColor';
import { isEqual } from 'lodash';

export const adjustJobColors = (state, jobColorsArg) => {
  const jobColors = jobColorsArg ? jobColorsArg : [];
  const { jobs, jobColors: jobColorsFromState } = state;
  const predefinedJobColors = [...jobColors, ...(Object.values(jobColorsFromState))].filter(jc => jobs.hasOwnProperty(jc.id)); // exclude orphan jobColors
  let newJobColors = {};
  for (const key of Object.keys(jobs)) { // eslint-disable-line no-unused-vars
    const id = +key;
    const predefinedJobColor = predefinedJobColors.find(jc => jc.id === id);
    const excludeColors = () => [...(Object.values(newJobColors)), predefinedJobColors].map(jc => jc.color);
    const previousColor = () => predefinedJobColors[predefinedJobColors.length - 1] ? predefinedJobColors[predefinedJobColors.length - 1].color : undefined;
    const [color, textColor] = predefinedJobColor ? [predefinedJobColor.color, predefinedJobColor.textColor] : getNewColor(excludeColors(), previousColor());
    newJobColors[id] = {
      id,
      color,
      textColor,
    };
  }
  if (isEqual(jobColorsFromState, newJobColors)) {
    return state;
  }
  return {
    ...state,
    jobColors: newJobColors
  };
};

const compareFunction = (a, b) => a - b;

const jobColorAdjustReducer = state => {
  const { jobs, jobColors } = state;
  if (arrayEqual(
    Object.keys(jobs).sort(compareFunction),
    Object.keys(jobColors).sort(compareFunction)
  )) {
    return state;
  }
  return adjustJobColors(state);
};

export default jobColorAdjustReducer;