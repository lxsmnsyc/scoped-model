let ID = 0;

const PREFIX = 'Node-';

export default function generateKey(): string {
  const newID = ID;
  ID += 1;
  return `${PREFIX}${newID}`;
}
