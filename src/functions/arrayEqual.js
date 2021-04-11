const arrayEqual = (array1, array2) => array1.length === array2.length && array1.every((value, index) => value === array2[index]);

export default arrayEqual;