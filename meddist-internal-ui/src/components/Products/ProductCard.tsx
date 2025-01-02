/** @format */

import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "./ProductCard.module.css";
import { formatToBrazilianPrice } from "./ProductForm";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  imageUrl?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  brand,
  price,
  category,
  imageUrl,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/produtos/${id}/editar`);
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            layout="fill"
            objectFit="contain"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>Sem Imagem</div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.category}>{category}</p>{" "}
        <p className={styles.brand}>{brand}</p>
        <p className={styles.price}>R$ {formatToBrazilianPrice(price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
