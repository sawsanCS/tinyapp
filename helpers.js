//adding a helper function to fetch if a user exists by his email
const getUserByEmail = function (email, listUsers) {
    for (const u in listUsers) {
      if (listUsers[u].email === email) {
        return listUsers[u];
      }
    }
    return null;
  }
  module.exports = getUserByEmail;