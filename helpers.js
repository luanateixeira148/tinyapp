// function to get user by email
const getUserByEmail = function(inputEmail, database) {
  for (user in database) {
    if (database[user].email === inputEmail) {
      return user;
    }
  }
  return undefined;
};

module.exports = { getUserByEmail };