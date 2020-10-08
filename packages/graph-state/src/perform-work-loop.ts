import { GraphNode } from './graph-node';
import computeNode from './compute-node';
import { GraphDomainInterface } from './create-domain-interface';
import { GraphDomainMemory } from './create-domain-memory';
import { GraphDomainScheduler, Work, WorkQueue } from './create-domain-scheduler';
import deprecateNodeVersion from './deprecate-node-version';
import getDraftState from './get-draft-state';
import getNodeInstance from './get-node-instance';
import getNodeState from './get-node-state';
import setNodeState from './set-node-state';

export default function performWorkLoop(
  memory: GraphDomainMemory,
  scheduler: GraphDomainScheduler,
  methods: GraphDomainInterface,
  workQueue: WorkQueue,
  resetWork: () => void,
): void {
  if (workQueue.length > 0) {
    resetWork();
    workQueue.forEach((work: Work<any, any>) => {
      switch (work.type) {
        case 'state': {
          const { action, target } = work.value;
          // Get instance node
          const currentState = getNodeState(memory, scheduler, target);

          if (target.set) {
            // Run the node setter for further effects
            target.set(
              {
                // Getter doesn't need dependency building.
                get: <S, A>(dependency: GraphNode<S, A>): S => (
                  getNodeState(memory, scheduler, dependency)
                ),
                // Setter
                set: <S, A>(dependency: GraphNode<S, A>, newAction: A): void => {
                  // Schedule a node update
                  methods.setState(dependency, newAction);
                },
              },
              // Send the draft state
              action,
            );
          } else {
            /**
             * Clean the previous version to prevent
             * asynchronous dependency registration.
             */
            deprecateNodeVersion(memory, target);
            // Notify for new node value
            setNodeState(
              memory,
              scheduler,
              target,
              getDraftState(action, currentState),
            );
          }
        }
          break;
        case 'compute': {
          const node = work.value;
          // Access internal node or create a new one.
          const actualNode = getNodeInstance(memory, node);
          /**
           * Clean the previous version to prevent
           * asynchronous dependency registration.
           */
          deprecateNodeVersion(memory, node);
          /**
           * Set the new node value by recomputing the node.
           * This may recursively compute.
           */
          setNodeState(
            memory,
            scheduler,
            node,
            computeNode(memory, scheduler, node, actualNode),
          );
        }
          break;
        case 'update': {
          const node = work.value;
          const currentNode = getNodeInstance(memory, node);
          const nodeValue = getNodeState(memory, scheduler, node);
          currentNode.dependents.forEach((dependent) => {
            scheduler.scheduleCompute(dependent);
          });
          currentNode.listeners.forEach((subscriber) => {
            subscriber(nodeValue);
          });
        }
          break;
        default:
          break;
      }
    });
  }
}
