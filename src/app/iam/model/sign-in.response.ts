/**
 * Model for the sign in response.
 */
export class SignInResponse {
  public id: string;
  public username: string;
  public token: string;

  /**
   * Constructor.
   * @param id The user id.
   * @param username The username.
   * @param token The generated token.
   */
  constructor(id: string, username: string, token: string) {
    this.token = token;
    this.username = username;
    this.id = id;
  }
}
