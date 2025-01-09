/** @format */

import React, { useState, useEffect, useRef } from "react";
import styles from "./SideMenu.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faBox,
  faShoppingCart,
  faTruck,
  faFileInvoiceDollar,
  faWarehouse,
  faUsers,
  faUserTie,
  faBuilding,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    label: "Empresa",
    link: "/empresa/canais",
    icon: faBuilding,
    subItems: [
      { label: "Canais de Vendas", link: "/empresa/canais" },
      { label: "Localizações", link: "/empresa/localizacoes" },
    ],
  },
  {
    label: "Produtos",
    link: "/produtos",
    icon: faBox,
    subItems: [{ label: "Categorias", link: "/produtos/categorias" }],
  },
  { label: "Estoque", link: "/", icon: faWarehouse },
  { label: "Pedidos", link: "/", icon: faShoppingCart },
  { label: "Expedição", link: "/", icon: faTruck },
  { label: "Faturamento", link: "/", icon: faFileInvoiceDollar },
  { label: "Usuários", link: "/", icon: faUsers },
  { label: "RH", link: "/", icon: faUserTie },
];

const SideMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLDivElement>(null);

  const authContext = useAuth();

  const toggleMenu = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sideMenuRef.current &&
      !sideMenuRef.current.contains(event.target as Node) &&
      toggleButtonRef.current &&
      !toggleButtonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    authContext.logout();
  };

  return (
    <>
      <div
        ref={toggleButtonRef}
        className={styles.hamburger}
        onClick={toggleMenu}
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </div>

      <nav
        ref={sideMenuRef}
        className={`${styles.sideMenu} ${isOpen ? styles.open : ""}`}
      >
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className={styles.menuItem}>
              <Link href={item.link}>
                <div className={styles.menuLink}>
                  <span className={styles.icon}>
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </div>
              </Link>
              {item.subItems && (
                <ul className={styles.subMenu}>
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex} className={styles.subMenuItem}>
                      <Link href={subItem.link}>{subItem.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <div className={styles.logoutContainer} onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className={styles.logoutIcon} />
          <span>Sair</span>
        </div>
      </nav>
    </>
  );
};

export default SideMenu;
