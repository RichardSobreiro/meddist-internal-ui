/** @format */

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./CategoryForm.module.css";
import axiosInstance from "@/services/axiosInstance";
import { useToast } from "@/context/ToastContext";

interface CategoryFormValues {
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
  parentCategories = [],
  onCancel,
}) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("O nome da categoria é obrigatório"),
    description: Yup.string().optional(),
    parentId: Yup.string().optional(),
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEditMode ? "Editar Categoria" : "Criar Categoria"}</h1>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>

      <Formik
        initialValues={{
          name: initialValues?.name || "",
          description: initialValues?.description || "",
          parentId: initialValues?.parentId || "",
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          setIsSubmitting(true);
          try {
            if (isEditMode && categoryId) {
              await axiosInstance.patch(`/categories/${categoryId}`, values);
              addToast("Categoria atualizada com sucesso!", "success");
            } else {
              await axiosInstance.post("/categories", values);
              addToast("Categoria criada com sucesso!", "success");
            }

            resetForm();
            onSubmitSuccess?.();
          } catch (error) {
            console.error("Erro ao salvar categoria:", error);
            addToast("Erro ao salvar categoria. Tente novamente.", "error");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {() => (
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

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="parentId">
                Categoria Pai
              </label>
              <Field
                as="select"
                id="parentId"
                name="parentId"
                className={styles.input}
              >
                <option value="">Nenhuma</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="parentId"
                component="div"
                className={styles.error}
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
        )}
      </Formik>
    </div>
  );
};

export default CategoryForm;
