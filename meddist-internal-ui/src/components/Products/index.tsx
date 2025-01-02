/** @format */

import React, { useState, useEffect, useCallback } from "react";
import styles from "./ProductList.module.css";
import PaginationControls from "../general/Pagination/PaginationControls";
import axiosInstance from "@/services/axiosInstance";
import { useSpinner } from "@/context/SpinnerContext ";
import { useToast } from "@/context/ToastContext";
import axios from "axios";
import { useRouter } from "next/router";
import ClickableText from "../general/ClickableText";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  images: { url: string; isPrimary: boolean }[];
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { showSpinner, hideSpinner } = useSpinner();
  const { addToast } = useToast();
  const router = useRouter();

  const fetchProducts = useCallback(
    async (page: number) => {
      try {
        showSpinner();
        const response = await axiosInstance.get(`/products?page=${page}`);
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          console.error("Erro:", error.response?.data?.message);
          addToast(`Erro: ${error.response?.data?.message}`, "error");
        } else {
          console.error("Erro: ", error);
          addToast(
            `Um erro desconhecido aconteceu. Aguarde alguns segundos e tente novamente`,
            "error"
          );
        }
      } finally {
        hideSpinner();
      }
    },
    [addToast, hideSpinner, showSpinner]
  );

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToCreateProduct = () => {
    router.push("/produtos/criar");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Produtos</h1>
          <ClickableText
            text={"Gerenciar Categorias"}
            onClick={() => router.push("/produtos/categorias")}
            className={"small_primary"}
          />
        </div>

        <button
          className={styles.createButton}
          onClick={navigateToCreateProduct}
        >
          Criar Produto
        </button>
      </div>

      <div className={styles.grid}>
        {products.map((product) => {
          const primaryImage =
            product.images.find((image) => image.isPrimary)?.url || "";
          return (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              brand={product.brand}
              price={product.price}
              imageUrl={primaryImage}
            />
          );
        })}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchProducts}
      />
    </div>
  );
};

export default ProductList;
