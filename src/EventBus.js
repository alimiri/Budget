const eventHandlers = {}; // Stores event callbacks

const EventBus = {
  /**
   * Register an event listener.
   * @param {string} event - The event name.
   * @param {Function} handler - The function to execute when the event is emitted.
   */
  on: (event, handler) => {
    if (!eventHandlers[event]) {
      eventHandlers[event] = [];
    }
    eventHandlers[event].push(handler);
  },

  /**
   * Emit an event, calling all registered listeners.
   * @param {string} event - The event name.
   * @param {...any} args - Arguments to pass to the handlers.
   */
  emit: (event, ...args) => {
    if (eventHandlers[event]) {
      eventHandlers[event].forEach((handler) => handler(...args));
    }
  },

  /**
   * Remove a specific event listener.
   * @param {string} event - The event name.
   * @param {Function} handler - The handler function to remove.
   */
  off: (event, handler) => {
    if (eventHandlers[event]) {
      eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler);
    }
  },

  /**
   * Remove all listeners for a given event.
   * @param {string} event - The event name.
   */
  offAll: (event) => {
    if (eventHandlers[event]) {
      delete eventHandlers[event];
    }
  },
};

export default EventBus;
