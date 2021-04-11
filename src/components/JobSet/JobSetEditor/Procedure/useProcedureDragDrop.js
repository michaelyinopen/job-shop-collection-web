import { useCallback, useEffect } from 'react';
import { throttle } from 'lodash';
import { useDrag, useDrop } from 'react-dnd';
import itemTypes from './itemTypes';

const wait = 200;
// only support same height
const useProcedureDragDrop = (
  id,
  sequence,
  getProcedureSequence,
  moveProcedure
) => {
  const [{ isDragging }, setDragRef, setPreviewRef] = useDrag({
    item: { type: itemTypes.PROCEDURE, id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    })
  })
  const throttledHoverCallback = useCallback(
    throttle(
      item => {
        const { id: dragId } = item;
        const dragSequence = getProcedureSequence(dragId);
        const hoverSequence = sequence;
        // Don't replace items with themselves
        if (dragSequence === hoverSequence) {
          return;
        }
        moveProcedure(dragId, hoverSequence);
      },
      wait,
      { leading: true, trailing: true }
    ),
    [getProcedureSequence, sequence]
  );
  useEffect(
    () => {
      return () => {
        if (throttledHoverCallback && throttledHoverCallback.cancel) {
          throttledHoverCallback.cancel();
        }
      }
    },
    [throttledHoverCallback]
  );
  const [, setDropRef] = useDrop({
    accept: itemTypes.PROCEDURE,
    hover: throttledHoverCallback
  });
  const setDropAndPreviewRef = useCallback(
    ref => {
      setDropRef(ref);
      setPreviewRef(ref);
    },
    [setDropRef, setPreviewRef]
  );
  return [isDragging, setDragRef, setDropAndPreviewRef];
};

export default useProcedureDragDrop;