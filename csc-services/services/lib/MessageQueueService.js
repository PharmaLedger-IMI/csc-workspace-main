class MessageQueueService {

    constructor() {
        this.messageCallbacks = [];
        this.inProgress = false;
    }

    addCallback(callback) {
        this.messageCallbacks.push(callback);
        if (!this.inProgress) {
            this.run();
        }
    }

    run() {
        if (this.messageCallbacks.length > 0) {
            this.inProgress = true;
            let callback = this.messageCallbacks.pop();
            callback().then(() => {
                this.inProgress = false;
                this.run();
            })
        }
    }
}

let messageQueueServiceInstance = new MessageQueueService();
module.exports = messageQueueServiceInstance;