/**
 * Model for sign up request
 */
export class SignUpRequest {
  public username: string;
  public password: string;
  public roles: string[];

  /**
   * Constructor.
   * @param username The username.
   * @param password The password.
   * @param roles The roles.
   */
  constructor(username: string, password: string, roles: string[] = ['ROLE_USER']) {
    this.password = password;
    this.username = username;
    this.roles = roles;
  }
}
