class EventBusService {
  eventTopics = {};

  constructor() {}

  addEventListener = function (eventName, listener) {
    if (!this.eventTopics[eventName] || this.eventTopics[eventName].length < 1) {
      this.eventTopics[eventName] = [];
    }

    if (!this.eventTopics[eventName].map((x) => x.toString()).includes(listener.toString())) {
      this.eventTopics[eventName].push(listener);
    } else {
      const idx = this.eventTopics[eventName].map((x) => x.toString()).indexOf(listener.toString());
      this.eventTopics[eventName][idx] = listener;
    }
  };

  emitEventListeners = function (eventName, params) {
    if (!this.eventTopics[eventName] || this.eventTopics[eventName].length < 1) return;
    this.eventTopics[eventName].forEach(function (listener) {
      listener(params ? params : {});
    });
  };
}

const eventBusService = new EventBusService();

module.exports = eventBusService;
