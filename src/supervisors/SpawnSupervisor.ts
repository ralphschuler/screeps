import { SpawnAnalyst, SpawnData } from "analysts/SpawnAnalyst";
import { deserialize, serialize } from "class-transformer";
import { MinionRequest, MinionTypes } from "requests/types/MinionRequest";
import { TaskRequest } from "tasks/TaskRequest";
import { TransferTask } from "tasks/types/TransferTask";
import { getTransferEnergyRemaining } from "utils/gameObjectSelectors";
import { Manager } from "../managers/Manager";

export class SpawnSupervisor extends Manager {
    spawns: SpawnData[] = [];
    requests: {[id: string]: MinionRequest} = {};
    resupply: TaskRequest|null = null;

    constructor(
        public roomId: string
    ) { super(); }

    submit = (request: MinionRequest) => {
        if (!request.sourceId) return;
        if (!this.requests[request.sourceId]) {
            this.requests[request.sourceId] = request;
        }
    }

    load = () => {
        this.spawns = global.analysts.spawn.getSpawns(Game.rooms[this.roomId]);
        // Load requests from Memory
        if (Memory.rooms[this.roomId]?.spawnRequests) {
            let deserialized = JSON.parse(Memory.rooms[this.roomId]?.spawnRequests as string)
            this.requests = {};
            for (let reqSource in deserialized) {
                this.requests[reqSource] = deserialize(MinionRequest, deserialized[reqSource])
                if (this.requests[reqSource].assignedTo) {
                    this.spawns.find(s => s.spawn.id === this.requests[reqSource].assignedTo?.id)
                }
            }
        }
    }
    run = () => {
        // Spawn Requests
        Object.values(this.requests)
            .sort((a, b) => (b.priority - a.priority)).forEach(r => {
            if (!r.assignedTo) {
                // Find a spawn to carry out the request
                let available = this.getIdleSpawn();
                if (available) {
                    r.assignedTo = available.spawn;
                    available.currentRequest = r;
                }
            }
            // Process assigned requests
            r.fulfill(Game.rooms[this.roomId])
        })
    }
    cleanup = () => {
        if (!Memory.rooms[this.roomId]) Memory.rooms[this.roomId] = { }

        let serialized: {[id: string]: string} = {};

        for (let reqSource in this.requests) {
            serialized = {};
            if (this.requests[reqSource].completed || Game.time > this.requests[reqSource].created + 500) {
                // Completed or timed out
                delete this.requests[reqSource]
            } else {
                serialized[reqSource] = serialize(this.requests[reqSource])
            }
        }
        Memory.rooms[this.roomId].spawnRequests = JSON.stringify(serialized);
    }

    getIdleSpawn = () => {
        return this.spawns.find(s => !s.currentRequest);
    }
}
