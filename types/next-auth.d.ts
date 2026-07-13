import "next-auth";
import "next-auth/jwt";

type UserRole = "OWNER" | "ADMIN" | "SALES" | "CUSTOMER";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      accessToken: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    accessToken?: string;
  }
}
