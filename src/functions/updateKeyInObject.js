const updateKeyInObject = (oldObject, key, updatePropertyCallback) => {
  const oldProperty = oldObject[key];
  const newProperty = updatePropertyCallback(oldProperty);
  if (oldProperty === newProperty) {
    return oldObject;
  }
  return Object.assign({}, oldObject, { [key]: newProperty });
};

export default updateKeyInObject;