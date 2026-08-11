let emitAdminBookingEvent = () => {};

const setAdminBookingEmitter = (emitter) => {
  emitAdminBookingEvent = typeof emitter === "function" ? emitter : () => {};
};

const notifyAdminBookingEvent = (event, payload = {}) => {
  emitAdminBookingEvent({
    event,
    payload,
    changedAt: new Date().toISOString(),
  });
};

module.exports = {
  setAdminBookingEmitter,
  notifyAdminBookingEvent,
};
