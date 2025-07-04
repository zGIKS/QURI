import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {Router} from "@angular/router";
import {SignUpRequest} from "../model/sign-up.request";
import {SignUpResponse} from "../model/sign-up.response";
import {SignInRequest} from "../model/sign-in.request";
import {SignInResponse} from "../model/sign-in.response";

/**
 * Service for handling authentication operations.
 * @summary
 * This service is responsible for handling authentication operations like sign-up, sign-in, and sign-out.
 */
@Injectable({providedIn: 'root'})
export class AuthenticationService {
  basePath: string = `${environment.serverBaseUrl}`;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  private signedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private signedInUserId: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private signedInUsername: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * Constructor for the AuthenticationService.
    * @param router The router service.
   * @param http The HttpClient service.
   */
  constructor(private router: Router, private http: HttpClient) {
    this.checkStoredAuthentication();
  }

  /**
   * Check if there's a stored authentication token and user data in localStorage
   * @summary
   * This method checks localStorage for authentication data and restores the user's session if valid.
   */
  private checkStoredAuthentication() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (token && userId && username) {
      this.signedIn.next(true);
      this.signedInUserId.next(parseInt(userId));
      this.signedInUsername.next(username);
      console.log(`Restored authentication for user: ${username}`);
    }
  }

  get isSignedIn() {
    return this.signedIn.asObservable();
  }

  get currentUserId() {
    return this.signedInUserId.asObservable();
  }

  get currentUsername() {
    return this.signedInUsername.asObservable();
  }

  /**
   * Sign up a new user.
   * @summary
   * This method sends a POST request to the server with the user's username and password.
   * If the request is successful, the user's id and username are logged and the user is navigated to the sign-in page.
   * If the request fails, an error message is logged and the user is navigated to the sign-up page.
   * @param signUpRequest The {@link SignUpRequest} object containing the user's username and password.
   * @returns The {@link SignUpResponse} object containing the user's id and username.
   */
  signUp(signUpRequest: SignUpRequest) {
    return this.http.post<SignUpResponse>(`${this.basePath}/api/v1/auth/sign-up`, signUpRequest, this.httpOptions)
      .subscribe({
        next: (response) => {
          console.log(`Signed up as ${response.username} with id ${response.id}`);
          alert(`Account created successfully! Welcome ${response.username}. Please sign in with your new account.`);
          this.router.navigate(['/sign-in']).then();
        },
        error: (error) => {
          console.error(`Error while signing up:`, error);
          console.error(`Error details:`, error.error);

          // Show more specific error messages
          if (error.status === 409) {
            alert('Username already exists. Please choose a different username.');
          } else if (error.status === 400) {
            alert('Invalid data. Please check your information and try again.');
          } else {
            alert('Sign up failed. Please try again.');
          }

          this.router.navigate(['/sign-up']).then();
        }
      });
  }

  /**
   * Sign in a user.
   * @summary
   * This method sends a POST request to the server with the user's username and password.
   * If the request is successful, the signedIn, signedInUserId, and signedInUsername are set to true,
   * the user's id, and the user's username respectively.
   * The token is stored in the local storage and the user is navigated to the home page.
   * If the request fails, the signedIn, signedInUserId, and signedInUsername are set to false, 0, and
   * an empty string respectively.
   * An error message is logged and the user is navigated to the sign-in page.
   * @param signInRequest The {@link SignInRequest} object containing the user's username and password.
   * @returns The {@link SignInResponse} object containing the user's id, username, and token.
   */
  signIn(signInRequest: SignInRequest) {
    console.log(signInRequest);
    return this.http.post<SignInResponse>(`${this.basePath}/api/v1/auth/sign-in`, signInRequest, this.httpOptions)
      .subscribe({
        next: (response) => {
          this.signedIn.next(true);
          this.signedInUserId.next(response.id);
          this.signedInUsername.next(response.username);
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.id.toString());
          localStorage.setItem('username', response.username);
          console.log(`Signed in as ${response.username} with token ${response.token}`);
          this.router.navigate(['/home']).then();
        },
        error: (error) => {
          this.signedIn.next(false);
          this.signedInUserId.next(0);
          this.signedInUsername.next('');
          console.error(`Error while signing in:`, error);

          // Show more specific error messages
          if (error.status === 401) {
            alert('Invalid username or password. Please check your credentials.');
          } else if (error.status === 403) {
            alert('Access forbidden. Please contact support.');
          } else {
            alert('Sign in failed. Please try again.');
          }

          this.router.navigate(['/sign-in']).then();
        }
      });
  }

  /**
   * Sign out the user.
   * @summary
   * This method sets the signedIn, signedInUserId, and signedInUsername to their default values,
   * removes the token from the local storage, and navigates to the sign-in page.
   */
  signOut() {
    this.signedIn.next(false);
    this.signedInUserId.next(0);
    this.signedInUsername.next('');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    this.router.navigate(['/sign-in']).then();
  }

  /**
   * Check if the current user has a valid token
   * @summary
   * This method checks if there's a valid token in localStorage
   * @returns boolean indicating if the user has a valid token
   */
  hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && token !== '';
  }

  /**
   * Get the current token from localStorage
   * @summary
   * This method retrieves the authentication token from localStorage
   * @returns The authentication token or null if not found
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

}
