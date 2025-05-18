export enum ClientMessageTypesEnum {
  REG = 'reg',
  CREATE_ROOM = 'create_room',
  CREATE_GAME = 'create_game',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  UPDATE_ROOM = 'update_room',
  ADD_SHIPS = 'add_ships',
  START_GAME = 'start_game',
  TURN = 'turn',
  ATTACK = 'attack'
}

export enum ErrorMessagesEnum {
  USER_WAS_NOT_FOUND = 'Such user does not exist.',
  JSON_PARSE_ERROR = 'JSON parse error.',
  PASSWORD_INCORRECT = 'Please check password.',
  FULL_ROOM = 'Room is full.',
  ROOM_DOES_NOT_EXIST = 'This room does not exist.'
}