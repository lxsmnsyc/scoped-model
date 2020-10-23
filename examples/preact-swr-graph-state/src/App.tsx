/** @jsx h */
import { h, VNode } from 'preact';
import { Suspense } from 'preact/compat';
import {
  GraphDomain,
  useGraphNodeResource,
} from 'preact-graph-state';
import { createGraphNode } from 'graph-state';
import { createSWRGraphNode } from 'swr-graph-state';

const API = 'https://dog.ceo/api/breed/';
const API_SUFFIX = '/images/random';

interface APIResult {
  message: string;
  status: string;
}

const dogBreed = createGraphNode({
  get: 'shiba',
});

const dogAPI = createSWRGraphNode<APIResult>({
  key: 'dogAPI',
  fetch: async ({ get }) => {
    const breed = get(dogBreed);
    const response = await fetch(`${API}${breed}${API_SUFFIX}`);
    return (await response.json()) as APIResult;
  },
  revalidateOnFocus: true,
  revalidateOnNetwork: true,
  ssr: false,
});

function DogImage(): VNode {
  const data = useGraphNodeResource(dogAPI.resource);

  return <img src={data.message} alt={data.message} />;
}

function Trigger(): VNode {
  return (
    <button
      type="button"
      onClick={() => {
        dogAPI.trigger();
      }}
    >
      Trigger
    </button>
  );
}

export default function App(): VNode {
  return (
    <GraphDomain>
      <Trigger />
      <div>
        <Suspense fallback={<h1>Loading...</h1>}>
          <DogImage />
        </Suspense>
      </div>
    </GraphDomain>
  );
}
