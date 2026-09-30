let emitContentChange = () => {};
let emitPricingUpdate = () => {};

const setContentEmitter = (emitter) => {
  emitContentChange = typeof emitter === "function" ? emitter : () => {};
};

const setPricingEmitter = (emitter) => {
  emitPricingUpdate = typeof emitter === "function" ? emitter : () => {};
};

const notifyContentChange = (target, action, meta = {}) => {
  emitContentChange({
    target,
    action,
    meta,
    changedAt: new Date().toISOString(),
  });
};

const notifyPricingUpdated = (meta = {}) => {
  emitPricingUpdate({
    ...meta,
    changedAt: new Date().toISOString(),
  });
};

module.exports = {
  setContentEmitter,
  setPricingEmitter,
  notifyContentChange,
  notifyPricingUpdated,
};
