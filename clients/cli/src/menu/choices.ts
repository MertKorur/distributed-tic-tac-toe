export type MenuAction = 
| 'register'
| 'listRooms'
| 'createRoom'
| 'joinRoom'
| 'connect'
| 'move'
| 'watch'
| 'exit';

export const CHOICES: { name: string; value: MenuAction }[] = [
  { name: 'Register / Login', value: 'register' },
  { name: 'List Rooms', value: 'listRooms' },
  { name: 'Create Room (as X)', value: 'createRoom' },
  { name: 'Join Room (as O)', value: 'joinRoom' },
  { name: 'Connect to Room', value: 'connect' },
  { name: 'Make move (when connected)', value: 'move' },
  { name: 'Spectate', value: 'watch'},
  { name: 'Exit', value: 'exit' }
];