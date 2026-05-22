export type AuthUser = {
  userId: number;
  username: string;
};

export type AppEnv = {
  Variables: {
    user: AuthUser;
  };
};
