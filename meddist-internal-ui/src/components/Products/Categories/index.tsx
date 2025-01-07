/** @format */

import React, { useState, useEffect, useCallback } from "react";
import styles from "./CategoriesList.module.css";
import PaginationControls from "@/components/general/Pagination/PaginationControls";
import axiosInstance from "@/services/axiosInstance";
import { useSpinner } from "@/context/SpinnerContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/router";
import ClickableText from "@/components/general/ClickableText";

interface Category {
  id: string;
  name: string;
  description?: string;
  parent?: { id: string; name: string };
}

const CategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { showSpinner, hideSpinner } = useSpinner();
  const { addToast } = useToast();
  const router = useRouter();

  const fetchCategories = useCallback(
    async (page: number) => {
      try {
        showSpinner();
        const response = await axiosInstance.get(`/categories?page=${page}`);
        setCategories(response.data.categories);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        addToast("Erro ao buscar categorias. Tente novamente.", "error");
      } finally {
        hideSpinner();
      }
    },
    [addToast, hideSpinner, showSpinner]
  );

  useEffect(() => {
    fetchCategories(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToCreateCategory = () => {
    router.push("/produtos/categorias/criar");
  };

  const navigateToEditCategory = (categoryId: string) => {
    router.push(`/produtos/categorias/${categoryId}/editar`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Categorias</h1>
          <ClickableText
            text={"Produtos"}
            onClick={function (): void {
              router.push("/produtos");
            }}
            className={"small_primary"}
          />
        </div>
        <button
          className={styles.createButton}
          onClick={navigateToCreateCategory}
        >
          Criar Categoria
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            {/* <th>Categoria Pai</th> */}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description || "-"}</td>
              {/* <td>{category.parent?.name || "Nenhuma"}</td> */}
              <td>
                <button
                  className={styles.manageButton}
                  onClick={() => navigateToEditCategory(category.id)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchCategories}
      />
    </div>
  );
};

export default CategoriesList;
