/** @format */

import React from "react";
import styles from "./Toast.module.css";
import { useToast } from "@/context/ToastContext";

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default Toast;
