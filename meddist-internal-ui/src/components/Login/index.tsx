/** @format */

import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FieldProps } from "formik";
import * as Yup from "yup";
import InputMask from "react-input-mask";
import styles from "./Login.module.css"; // Ensure you have this CSS module
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useSpinner } from "@/context/SpinnerContext ";
import { useToast } from "@/context/ToastContext";

interface FormValues {
  username: string | undefined;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const router = useRouter();
  const authContext = useAuth();
  const validationSchema = Yup.object({
    username: Yup.string().required("Email é obrigatório"),
    password: Yup.string().required("Senha é obrigatória"),
    rememberMe: Yup.boolean(),
  });
  const { showSpinner, hideSpinner } = useSpinner();
  const { addToast } = useToast();

  const initialValues: FormValues = {
    username: "",
    password: "",
    rememberMe: false,
  };

  const getMask = (value: string): string => {
    if (!value) return "";
    const digitsOnly = value.replace(/[.\-\/]/g, "");
    if (digitsOnly.match(/\D/)) {
      return "";
    } else {
      return "999.999.999-99";
    }
  };

  useEffect(() => {
    if (authContext.user != null) {
      router.push("/produtos");
    }
  }, [authContext.user, router]);

  return (
    <div className={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          const loginApi = authContext.login;
          try {
            showSpinner();
            await loginApi({
              username: values.username ? values.username : "",
              password: values.password,
              rememberMe: values.rememberMe,
            });
            addToast(`Olá`, "success");
            router.push("/produtos");
          } catch (error) {
            if (error instanceof Error) {
              console.error("Login failed:", error.message);
              addToast(`Failed to login: ${error.message}`, "error");
            } else {
              console.error("Login failed:", error);
              addToast(`Failed to login: An unknown error occurred`, "error");
            }
          } finally {
            setSubmitting(false);
            hideSpinner();
          }
        }}
      >
        {({ setFieldValue, values }) => (
          <Form className={styles.loginForm}>
            <h2>Portal Interno</h2>

            <label htmlFor="username">Email</label>
            <Field name="username">
              {({ field }: FieldProps<string, FormValues>) => (
                <InputMask
                  {...field}
                  mask={getMask(values.username ? values.username : "")}
                  maskChar={null}
                  onChange={(e) => {
                    setFieldValue("username", e.target.value);
                  }}
                  type="text"
                  id="username"
                  className={styles.input}
                />
              )}
            </Field>
            <ErrorMessage
              name="username"
              component="div"
              className={styles.errorMessage}
            />

            <label htmlFor="password">Senha</label>
            <Field
              type="password"
              id="password"
              name="password"
              className={styles.input}
            />
            <ErrorMessage
              name="password"
              component="div"
              className={styles.errorMessage}
            />

            <div className={styles.checkboxContainer}>
              <Field type="checkbox" name="rememberMe" id="rememberMe" />
              <label htmlFor="rememberMe">Matenha-me logado</label>
            </div>

            <button type="submit" className={styles.loginButton}>
              Entrar
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optionally, handle 401 Unauthorized responses here by attempting to refresh tokens
