let emitContentChange = () => {};

const setContentEmitter = (emitter) => {
  emitContentChange = typeof emitter === "function" ? emitter : () => {};
};

const notifyContentChange = (target, action, meta = {}) => {
  emitContentChange({
    target,
    action,
    meta,
    changedAt: new Date().toISOString(),
  });
};

module.exports = { setContentEmitter, notifyContentChange };
