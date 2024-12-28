/** @format */

import React, { useCallback, useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./CategoryForm.module.css";
import axiosInstance from "@/services/axiosInstance";
import { useToast } from "@/context/ToastContext";
import { useSpinner } from "@/context/SpinnerContext ";
import { useRouter } from "next/router";

export interface CategoryFormValues {
  name: string;
  description: string;
  parentId?: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface CategoryFormProps {
  initialValues?: CategoryFormValues;
  onSubmitSuccess?: () => void;
  isEditMode?: boolean;
  categoryId?: string;
  parentCategories?: CategoryOption[];
  onCancel?: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialValues,
  onSubmitSuccess,
  isEditMode = false,
  categoryId,
  onCancel,
}) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSpinner, hideSpinner } = useSpinner();
  const router = useRouter();

  const validationSchema = Yup.object({
    name: Yup.string().required("O nome da categoria é obrigatório"),
    description: Yup.string().optional(),
    parentId: Yup.string().optional(),
  });

  const fetchCategory = useCallback(
    async (
      categoryId: string,
      setFieldValue: (
        field: string,
        value: unknown,
        shouldValidate?: boolean
      ) => void
    ) => {
      try {
        showSpinner();
        const response = await axiosInstance.get(`/categories/${categoryId}`);
        const category = response.data;
        setFieldValue("name", category.name);
        setFieldValue("description", category.description || "");
        setFieldValue("parentId", category.parent?.id || "");
      } catch (error) {
        console.error("Erro ao buscar categoria:", error);
        addToast("Erro ao carregar categoria. Tente novamente.", "error");
      } finally {
        hideSpinner();
      }
    },
    [addToast, hideSpinner, showSpinner]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEditMode ? "Editar Categoria" : "Criar Categoria"}</h1>
      </div>

      <Formik
        initialValues={{
          name: initialValues?.name || "",
          description: initialValues?.description || "",
          parentId: initialValues?.parentId || "",
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setFieldValue }) => {
          setIsSubmitting(true);
          try {
            showSpinner();
            if (isEditMode && categoryId) {
              await axiosInstance.patch(`/categories/${categoryId}`, values);
              addToast("Categoria atualizada com sucesso!", "success");

              // Reload the updated category data
              await fetchCategory(categoryId, setFieldValue);
            } else {
              const response = await axiosInstance.post("/categories", values);
              const createdCategory = response.data; // Assuming the response includes the created category's ID
              addToast("Categoria criada com sucesso!", "success");
              resetForm();
              router.push(`/produtos/categorias/${createdCategory.id}/editar`);
            }

            onSubmitSuccess?.();
          } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            addToast("Erro ao salvar categoria. Tente novamente.", "error");
          } finally {
            setIsSubmitting(false);
            hideSpinner();
          }
        }}
      >
        {({ setFieldValue }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (isEditMode && categoryId) {
              fetchCategory(categoryId, setFieldValue);
            }
          }, [setFieldValue]);

          return (
            <Form className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">
                  Nome da Categoria
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  className={styles.input}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="description">
                  Descrição
                </label>
                <Field
                  id="description"
                  name="description"
                  as="textarea"
                  className={styles.input}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onCancel}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting
                    ? "Enviando..."
                    : isEditMode
                    ? "Salvar Categoria"
                    : "Criar Categoria"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default CategoryForm;
