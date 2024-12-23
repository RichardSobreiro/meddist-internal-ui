/** @format */

import Spinner from "@/components/Spinner";
import Toast from "@/components/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { SpinnerProvider, useSpinner } from "@/context/SpinnerContext ";
import { ToastProvider } from "@/context/ToastContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

function AppContent({ Component, pageProps, router }: AppProps) {
  const { isLoading } = useSpinner();

  return (
    <>
      {isLoading && <Spinner />}
      <Component {...pageProps} router={router} />
    </>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <SpinnerProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent
            Component={Component}
            pageProps={pageProps}
            router={router}
          />
        </AuthProvider>
        <Toast />
      </ToastProvider>
    </SpinnerProvider>
  );
}
