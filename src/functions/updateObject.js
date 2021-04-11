// can construct newValuesObject's key if action's properties have different names
// e.g. updateObject(state, { visibilityFilter: action.filter })
const updateObject = (oldObject, newValues) => {
  const differentProperties = Object.keys(newValues).reduce(
    (acc, key) => {
      const newValue = newValues[key];
      if (oldObject[key] !== newValue) {
        acc[key] = newValue;
      }
      return acc;
    },
    {}
  );
  if (Object.keys(differentProperties).length !== 0) {
    return Object.assign({}, oldObject, differentProperties);
  }
  return oldObject;
};

export default updateObject;