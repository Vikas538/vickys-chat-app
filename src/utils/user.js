const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return new Error("pls enter username and room name");
  }

  //
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //Validate username
  if (existingUser) {
    return {
      error: "username is in use!"
    }
  }

  //store user
  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return {
    user,
  };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
      return users.splice(index, 1)[0]
  }
}
//getUser
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//getUsersInRoom

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
};
