/** @format */

import { ReactNode } from "react";
import styles from "./Layout.module.css";

interface Props {
  children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <main className={styles.content}>{children}</main>
    </div>
  );
};

export default Layout;
