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
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  {
    label: "Empresa",
    link: "/",
    icon: faBuilding,
    subItems: [
      { label: "Canais de Vendas", link: "/empresa/canais" },
      { label: "Localizações", link: "/empresa/localizacoes" },
    ],
  },
  { label: "Produtos", link: "/produtos", icon: faBox },
  { label: "Pedidos", link: "/", icon: faShoppingCart },
  { label: "Expedição", link: "/", icon: faTruck },
  { label: "Faturamento", link: "/", icon: faFileInvoiceDollar },
  { label: "Estoque", link: "/", icon: faWarehouse },
  { label: "Usuários", link: "/", icon: faUsers },
  { label: "RH", link: "/", icon: faUserTie },
];

const SideMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
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

  const toggleSubMenu = (label: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

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
              <div
                className={styles.menuLink}
                onClick={() =>
                  item.subItems ? toggleSubMenu(item.label) : null
                }
              >
                <span className={styles.icon}>
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <span>{item.label}</span>
                {item.subItems && (
                  <span className={styles.chevronIcon}>
                    <FontAwesomeIcon
                      icon={
                        expandedSections[item.label]
                          ? faChevronUp
                          : faChevronDown
                      }
                    />
                  </span>
                )}
              </div>
              {item.subItems && expandedSections[item.label] && (
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
