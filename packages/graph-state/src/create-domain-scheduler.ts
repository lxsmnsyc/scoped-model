import { GraphNode } from './graph-node';

interface StateUpdate<S, A> {
  action: A;
  target: GraphNode<S, A>;
}

interface StateWork<S, A> {
  type: 'state';
  value: StateUpdate<S, A>;
}

interface ComputeWork<S, A> {
  type: 'compute';
  value: GraphNode<S, A>;
}

interface UpdateWork<S, A> {
  type: 'update';
  value: GraphNode<S, A>;
}

// A unit of work
export type Work<S, A> = StateWork<S, A> | ComputeWork<S, A> | UpdateWork<S, A>;

// Work queue
export type WorkQueue = Work<any, any>[];

export type CompareWork<T> = (a: T, b: T) => boolean;
export type EnqueueWork<T> = (node: T, compare?: CompareWork<T>) => void;

function isUniqueWork(a: Work<any, any>, b: Work<any, any>): boolean {
  return !(a.type === b.type && a.value === b.value);
}

export type ScheduleState = <S, R>(work: StateUpdate<S, R>) => void;
export type ScheduleCompute = <S, R>(work: GraphNode<S, R>) => void;
export type ScheduleUpdate = <S, R>(work: GraphNode<S, R>) => void;

export interface GraphDomainScheduler {
  scheduleState: ScheduleState;
  scheduleCompute: ScheduleCompute;
  scheduleUpdate: ScheduleUpdate;
}

export default function createGraphDomainScheduler(
  enqueue: EnqueueWork<Work<any, any>>,
): GraphDomainScheduler {
  return {
    scheduleState: <S, R>(work: StateUpdate<S, R>): void => {
      enqueue({
        type: 'state',
        value: work,
      });
    },
    scheduleCompute: <S, R>(work: GraphNode<S, R>): void => {
      enqueue({
        type: 'compute',
        value: work,
      }, isUniqueWork);
    },
    scheduleUpdate: <S, R>(work: GraphNode<S, R>): void => {
      enqueue({
        type: 'update',
        value: work,
      }, isUniqueWork);
    },
  };
}
