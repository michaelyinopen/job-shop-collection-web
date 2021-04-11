export const prefix = "@jobSetEditor/newEditingId";

const getNewJobSetIdClosure = () => {
  let nextValue = 1;
  return () => {
    const result = prefix + nextValue;
    nextValue = nextValue + 1;
    return result;
  }
}

export const getNewJobSetId = getNewJobSetIdClosure();

export const isNewJobSetId = id => String(id).startsWith(prefix);