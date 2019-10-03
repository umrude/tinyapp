const generateRandomString = () => {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const checkEmail = (testEmail, database) => {
  for (let user in database) {
    if (database[user].email === testEmail) {
      return true;
    }
  }
};
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};
const urlsForUser = (id, database) => {
  let result = {};
  for (let urls in database) {
    if (database[urls].userID === id) {
      result[urls] = database[urls].longURL;
    }
  }
  return result;
};

module.exports = {generateRandomString, checkEmail, getUserByEmail, urlsForUser};