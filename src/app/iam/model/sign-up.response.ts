export class SignUpResponse {
  public id: string;
  public username: string;

  constructor(id: string, username: string) {
    this.username = username;
    this.id = id;
  }
}
