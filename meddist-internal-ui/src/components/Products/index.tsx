/** @format */

import React, { useState, useEffect, useCallback } from "react";
import styles from "./ProductList.module.css";
import PaginationControls from "../general/Pagination/PaginationControls";
import axiosInstance from "@/services/axiosInstance";
import { useSpinner } from "@/context/SpinnerContext ";
import { useToast } from "@/context/ToastContext";
import axios from "axios";

interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  quantity: number;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { showSpinner, hideSpinner } = useSpinner();
  const { addToast } = useToast();

  const fetchProducts = useCallback(
    async (page: number) => {
      try {
        showSpinner();
        const response = await axiosInstance.get(
          `http://localhost:3003/products?page=${page}`
        );
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
        addToast("Lista atualizada.", "success");
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
  }, []);

  return (
    <div className={styles.container}>
      <h1>Produtos</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Marca</th>
            <th>Preço</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.brand}</td>
              <td>{product.price.toFixed(2)}</td>
              <td>{product.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchProducts}
      />
    </div>
  );
};

export default ProductList;
