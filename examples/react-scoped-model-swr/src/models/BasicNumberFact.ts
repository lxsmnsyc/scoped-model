import { createSWRModel } from '@lxsmnsyc/react-scoped-model-swr';

async function getNumberFact(url: string) {
  const response = await fetch(`http://numbersapi.com/${url}`);
  const message = await response.text();
  return message;
}

interface BasicNumberFactProps {
  number?: string;
  type: string;
}

const BasicNumberFact = createSWRModel<string, any, BasicNumberFactProps>(
  ({ number, type }) => {
    if (number) {
      return `${number}/${type}`;
    }
    return `random/${type}`;
  },
  () => getNumberFact,
  {},
  {
    displayName: 'BasicNumberFact',
  },
);

export default BasicNumberFact;
