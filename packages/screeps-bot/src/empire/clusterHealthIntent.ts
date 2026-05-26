export interface ClusterHealthRoomSnapshot {
  roomName: string;
  energy: number;
}

export interface ClusterHealthSnapshot {
  clusterId: string;
  memberRooms: string[];
  visibleRooms: ClusterHealthRoomSnapshot[];
  cpuUsed: number;
  ownedRoomCount: number;
  time: number;
}

export interface ClusterHealthIntent {
  clusterId: string;
  averageEnergy: number;
  averageCpuPerRoom: number;
  economyIndex: number;
  warnings: { type: "low-energy" | "high-cpu" | "low-economy"; message: string }[];
}

export function planClusterHealthIntent(snapshot: ClusterHealthSnapshot): ClusterHealthIntent | null {
  if (snapshot.visibleRooms.length === 0) return null;

  const totalEnergy = snapshot.visibleRooms.reduce((sum, room) => sum + room.energy, 0);
  const averageEnergy = totalEnergy / snapshot.visibleRooms.length;
  const averageCpuPerRoom = snapshot.ownedRoomCount > 0 ? snapshot.cpuUsed / snapshot.ownedRoomCount : 0;
  const energyScore = Math.min(100, (averageEnergy / 100000) * 100);
  const roomCountScore = snapshot.memberRooms.length > 0 ? (snapshot.visibleRooms.length / snapshot.memberRooms.length) * 100 : 0;
  const economyIndex = Math.round((energyScore + roomCountScore) / 2);
  const warnings: ClusterHealthIntent["warnings"] = [];

  if (averageEnergy < 30000) {
    warnings.push({ type: "low-energy", message: `Cluster ${snapshot.clusterId} average energy low: ${averageEnergy.toFixed(0)}` });
  }
  if (averageCpuPerRoom > 2) {
    warnings.push({ type: "high-cpu", message: `Cluster ${snapshot.clusterId} average CPU high: ${averageCpuPerRoom.toFixed(2)}` });
  }
  if (economyIndex < 40 && snapshot.time % 500 === 0) {
    warnings.push({ type: "low-economy", message: `Cluster ${snapshot.clusterId} economy index low: ${economyIndex}` });
  }

  return { clusterId: snapshot.clusterId, averageEnergy, averageCpuPerRoom, economyIndex, warnings };
}
