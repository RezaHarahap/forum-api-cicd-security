class PasswordHash {
  async hash(password) {
    void password;
    throw new Error('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
  }

  async comparePassword(plain, encrypted) {
    void plain;
    void encrypted;
    throw new Error('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
  }
}

export default PasswordHash;
