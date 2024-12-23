/** @format */

import React from "react";
import styles from "./ClickableText.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ClickableTextProps {
  text: string;
  onClick: () => void;
  className: string;
  icon?: IconDefinition;
}

const ClickableText: React.FC<ClickableTextProps> = ({
  text,
  onClick,
  className,
  icon,
}) => {
  const finalClassName = `${styles[className]}`;

  return (
    <div className={finalClassName} onClick={onClick}>
      {icon && <FontAwesomeIcon icon={icon} size="2x" />} {text}
    </div>
  );
};

export default ClickableText;
