// Types of request
// - Spawn minion for Manager
// - Supply energy to Spawn
// - Supply energy to Extensions
// - Supply energy to Room Controller

export class Request {
    completed = false;
    assignedTo: string|null = null;
    constructor(
        public sourceId: string|null = null,
        public priority = 5,
    ) { }

    public deserialize(task: any) {
        this.sourceId = task.sourceId;
        this.completed = task.completed;
        this.assignedTo = task.assignedTo;
        this.priority = task.priority;
        return this;
    }

    public serialize (subProps?: {[id: string]: any}) {
        return JSON.stringify({
            taskType: this.constructor.name,
            sourceId: this.sourceId,
            assignedTo: this.assignedTo,
            completed: this.completed,
            priority: this.priority,
            ...subProps
        })
    }
}
