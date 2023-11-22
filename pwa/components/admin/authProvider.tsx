import { AuthProvider } from "react-admin";
import { getSession, signIn } from "next-auth/react";

import { signOut } from "@/utils/security";

const authProvider: AuthProvider = {
  // Nothing to do here, this function will never be called
  login: async () => Promise.resolve(),
  logout: async () => {
    const session = await getSession();
    if (!session) {
      return;
    }

    await signOut(session);
  },
  checkError: async (error) => {
    const session = await getSession();
    const status = error.status;
    // @ts-ignore
    if (!session || session?.error === "RefreshAccessTokenError" || status === 401) {
      await signIn("github");

      return;
    }

    if (status === 403) {
      return Promise.reject({ message: "Unauthorized user!", logoutUser: false });
    }
  },
  checkAuth: async () => {
    const session = await getSession();
    // @ts-ignore
    if (!session || session?.error === "RefreshAccessTokenError") {
      await signIn("github");

      return;
    }

    return Promise.resolve();
  },
  getPermissions: () => Promise.resolve(),
  // @ts-ignore
  getIdentity: async () => {
    const session = await getSession();

    return session ? Promise.resolve(session.user) : Promise.reject();
  },
  // Nothing to do here, this function will never be called
  handleCallback: () => Promise.resolve(),
};

export default authProvider;
