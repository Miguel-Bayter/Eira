export interface AuthenticatedIdentity {
  supabaseId: string;
  email: string;
  name: string | null;
}

export interface RegisterWithPasswordInput {
  email: string;
  password: string;
}

export interface RegisterWithPasswordResult extends AuthenticatedIdentity {
  accessToken: string | null;
}

export interface LoginWithPasswordInput {
  email: string;
  password: string;
}

export interface LoginWithPasswordResult extends AuthenticatedIdentity {
  accessToken: string;
}

export interface IAuthProvider {
  register(input: RegisterWithPasswordInput): Promise<RegisterWithPasswordResult>;
  login(input: LoginWithPasswordInput): Promise<LoginWithPasswordResult>;
  getUserByAccessToken(token: string): Promise<AuthenticatedIdentity | null>;
}
