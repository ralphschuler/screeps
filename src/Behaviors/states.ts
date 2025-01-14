import { BehaviorResult } from "Behaviors/Behavior";

export enum States {
    GET_ENERGY = 'GET_ENERGY',
    GET_ENERGY_FRANCHISE = 'GET_ENERGY_FRANCHISE',
    GET_ENERGY_STORAGE = 'GET_ENERGY_STORAGE',
    GET_ENERGY_LINK = 'GET_ENERGY_LINK',
    GET_ENERGY_SOURCE = 'GET_ENERGY_SOURCE',
    GET_ENERGY_RUINS = 'GET_ENERGY_RUINS',
    WORKING = 'WORKING',
    WITHDRAW = 'WITHDRAW',
    DEPOSIT = 'DEPOSIT',
    DONE = 'DONE',
    FILL_TOWERS = 'FILL_TOWERS',
    FILL_LEGAL = 'FILL_LEGAL',
    FILL_LABS = 'FILL_LABS',
    EMPTY_LABS = 'EMPTY_LABS',
    RENEW = 'RENEW',
    GET_BOOSTED = 'GET_BOOSTED',
    RECYCLE = 'RECYCLE',
}

declare global {
    interface CreepMemory {
        state?: States
    }
}

/**
 * Returns SUCCESS if state matches, FAILURE otherwise
 */
export const stateIs = (state: States) => {
    return (creep: Creep) => {
        if (creep.memory.state === state) return BehaviorResult.SUCCESS;
        return BehaviorResult.FAILURE;
    }
}

/**
 * Returns SUCCESS if state is empty, FAILURE otherwise
 */
export const stateIsEmpty = () => {
    return (creep: Creep) => {
        if (creep.memory.state === undefined) return BehaviorResult.SUCCESS;
        return BehaviorResult.FAILURE;
    }
}

/**
 * Returns SUCCESS and sets state in blackboard
 */
export const setState = (state: States) => {
    return (creep: Creep) => {
        creep.memory.state = state;
        // Also clear move history when state changes
        delete creep.memory.movePos;
        delete creep.memory.moveRange;
        return BehaviorResult.SUCCESS;
    }
}
