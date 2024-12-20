"use client";

import { signIn } from "next-auth/react";

const SignInButton = () => {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/marketplace" })}
      className="px-6 py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  );
};

export default SignInButton;
