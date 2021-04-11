export default function toDate(arg){
  if(typeof arg === 'string'){
    return new Date(Date.parse(arg));
  }
  return arg;
}