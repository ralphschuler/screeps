import { HRAnalyst } from 'Boardroom/BoardroomManagers/HRAnalyst';
import { SalesAnalyst } from 'Boardroom/BoardroomManagers/SalesAnalyst';
import { OfficeManager } from 'Office/OfficeManager';

export class Road {
    path: RoomPosition[] = [];

    status: "PENDING"|"INPROGRESS"|"DONE" = "PENDING";

    constructor(path: RoomPosition[]) {
        this.path = path;
    }

    checkIfBuilt() {
        if (this.path.every(
            pos => Game.rooms[pos.roomName] &&
            pos.lookFor(LOOK_STRUCTURES).filter(s => s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER).length > 0
        )) {
            this.status = "DONE";
        }
        return (this.status === "DONE")
    }
    build() {
        this.path.forEach(pos => Game.rooms[pos.roomName] && pos.createConstructionSite(STRUCTURE_ROAD));
        this.status = "INPROGRESS";
    }
}

const roadPlannerCallback = (roomName: string) => {
    let room = Game.rooms[roomName];
    if (!room) return false;
    let costs = new PathFinder.CostMatrix();

    room.find(FIND_STRUCTURES).forEach(s => {
        if (s.structureType === STRUCTURE_ROAD) {
            costs.set(s.pos.x, s.pos.y, 1); // Already a road here, prefer this
        } else if (s.structureType !== STRUCTURE_RAMPART) {
            costs.set(s.pos.x, s.pos.y, 0xff); // Anything but a rampart, build around it
        }
    })

    return costs;
}

export class RoadArchitect extends OfficeManager {
    roads: Road[] = []

    plan() {
        // Only re-check infrastructure every `n` ticks (saves CPU)
        if (this.roads.length !== 0 && Game.time % 50 !== 0) return;
        let hrAnalyst = global.boardroom.managers.get('HRAnalyst') as HRAnalyst;
        let salesAnalyst = global.boardroom.managers.get('SalesAnalyst') as SalesAnalyst;

        if (this.roads.length === 0) {
            // Draw roads between spawn and sources
            let spawn = hrAnalyst.getSpawns(this.office)[0];
            salesAnalyst.getFranchiseLocations(this.office).forEach(franchise => {
                this.roads.push(new Road(PathFinder.search(spawn.pos, franchise.pos, {
                    swampCost: 1,
                    maxOps: 3000,
                    roomCallback: roadPlannerCallback
                }).path))
            })
            this.roads.sort((a, b) => a.path.length - b.path.length);
        }

        let road = this.roads.find(road => road.status !== "DONE");
        if (road?.status === "PENDING") {
            road.build();
        }
        road?.checkIfBuilt();
    }

    run() {
        // Architect only renders if enabled and roads are not built
        if (global.v.roads.state) {
            this.roads.forEach(road => {
                if (road.status === 'DONE') return;
                let rooms = road.path.reduce((rooms, pos) => (rooms.includes(pos.roomName) ? rooms : [...rooms, pos.roomName]), [] as string[])
                rooms.forEach(room => {
                    // Technically this could cause weirdness if the road loops out of a room
                    // and then back into it. If that happens, we'll just need to parse this
                    // into segments a little more intelligently
                    new RoomVisual(room).poly(road.path.filter(pos => pos.roomName === room), {lineStyle: 'dashed', stroke: '#0f0'});
                })
            })
        }
    }
}
