/** @format */

import Spinner from "@/components/Spinner";
import Toast from "@/components/Toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SpinnerProvider, useSpinner } from "@/context/SpinnerContext";
import { ToastProvider } from "@/context/ToastContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
//import { useEffect } from "react";

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!user && router.pathname !== "/") {
  //     router.push("/");
  //   }
  // }, [user, router]);

  if (!user && router.pathname !== "/") {
    return null; // Prevent rendering protected pages before redirecting
  }

  return <>{children}</>;
};

const AppContent: React.FC<AppProps> = ({
  Component,
  pageProps,
  router,
}: AppProps) => {
  const { isLoading } = useSpinner();

  return (
    <>
      {isLoading && <Spinner />}
      <Component {...pageProps} router={router} />
    </>
  );
};

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <SpinnerProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthGuard>
            <AppContent
              Component={Component}
              pageProps={pageProps}
              router={router}
            />
          </AuthGuard>
        </AuthProvider>
        <Toast />
      </ToastProvider>
    </SpinnerProvider>
  );
}
