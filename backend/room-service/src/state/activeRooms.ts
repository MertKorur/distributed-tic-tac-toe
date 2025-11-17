export const activeRooms = new Map<string, string>(); 
// key: username -> value: roomId

export function getUserRoom(userId: string): string | null {
  return activeRooms.get(userId) ?? null;
}

export function setUserRoom(userId: string, roomId: string) {
  activeRooms.set(userId, roomId);
}

export function clearUserRoom(userId: string) {
  activeRooms.delete(userId);
}

export function userHasRoom(userId: string): boolean {
  return activeRooms.has(userId);
}

export default activeRooms;