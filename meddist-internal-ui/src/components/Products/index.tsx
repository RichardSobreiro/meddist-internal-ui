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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  price: number;
  images: { url: string; isPrimary: boolean }[];
  categories: { id: string; name: string }[];
}

interface Category {
  id: string;
  name: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { showSpinner, hideSpinner } = useSpinner();
  const { addToast } = useToast();
  const router = useRouter();

  const fetchProducts = useCallback(
    async (page: number) => {
      try {
        showSpinner();
        const params: { page: number; search?: string; category?: string } = {
          page,
        };
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory) params.category = selectedCategory;

        const response = await axiosInstance.get("/products", { params });
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
    [addToast, hideSpinner, searchTerm, selectedCategory, showSpinner]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      addToast("Erro ao carregar categorias.", "error");
    }
  }, [addToast]);

  useEffect(() => {
    fetchProducts(1);
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchSubmit = () => {
    fetchProducts(1);
  };

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

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nome, descrição ou marca"
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className={styles.categorySelect}
        >
          <option value="">Todas as Categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button className={styles.searchButton} onClick={handleSearchSubmit}>
          <FontAwesomeIcon icon={faSearch} />
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
              category={product.categories?.[0]?.name || "Sem Categoria"}
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
