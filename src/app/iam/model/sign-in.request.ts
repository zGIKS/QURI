/**
 * Model class for SignInRequest
 */
export class SignInRequest {
  public username: string;
  public password: string;

  /**
   * Constructor for SignInRequest
   * @param username The username of the user
   * @param password The password of the user
   */
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}
