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
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const menuItems = [
  { label: "Produtos", link: "/produtos", icon: faBox },
  { label: "Pedidos", link: "/", icon: faShoppingCart },
  { label: "Expedição", link: "/", icon: faTruck },
  { label: "Faturamento", link: "/", icon: faFileInvoiceDollar },
  { label: "Estoque", link: "/", icon: faWarehouse },
  { label: "Usuários", link: "/", icon: faUsers },
  { label: "RH", link: "/", icon: faUserTie },
  { label: "Empresa", link: "/", icon: faBuilding },
];

const SideMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sideMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sideMenuRef.current &&
      !sideMenuRef.current.contains(event.target as Node)
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

  return (
    <>
      {/* Hamburger menu button */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </div>

      {/* Side menu */}
      <nav
        ref={sideMenuRef}
        className={`${styles.sideMenu} ${isOpen ? styles.open : ""}`}
      >
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className={styles.menuItem}>
              <Link href={item.link}>
                <span className={styles.icon}>
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default SideMenu;
