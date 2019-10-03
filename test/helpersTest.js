const { assert } = require('chai');

const { checkEmail, getUserByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
describe('getUserByEmail', function() {
  it('should return a user object with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    
    const expectedOutput = {
      id: 'userRandomID',
      email: 'user@example.com',
      password: 'purple-monkey-dinosaur'
    };
    
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined if the email doesnt exist', () => {
    const user = getUserByEmail("abc@123", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});

describe('checkEmail', () => {
  it('should return true if the email exists in the database', () => {
    const email = checkEmail("user@example.com", testUsers);
    const expectedOutput = true;
    assert.equal(email, expectedOutput);
  });

  it('should return undefined if the email does not exist in the database', () => {
    const email = checkEmail("abc@123", testUsers);
    const expectedOutput = undefined;

    assert.equal(email, expectedOutput);
  });
});