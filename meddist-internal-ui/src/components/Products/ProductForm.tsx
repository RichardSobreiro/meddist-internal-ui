/** @format */

import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./ProductForm.module.css";
import axiosInstance from "@/services/axiosInstance";
import { useToast } from "@/context/ToastContext";

interface ProductFormValues {
  name: string;
  description: string;
  brand: string;
  price: number;
  quantity: number;
  categories: string[];
  images: ProductImageDto[];
}

interface ProductImageDto {
  id?: string;
  url: string;
  isPrimary?: boolean;
  isListImage?: boolean;
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmitSuccess?: () => void;
  isEditMode?: boolean;
  productId?: string;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  onSubmitSuccess,
  isEditMode = false,
  productId,
  onCancel,
}) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Nome do produto é obrigatório"),
    description: Yup.string().optional(),
    brand: Yup.string().required("Marca é obrigatória"),
    price: Yup.number()
      .min(0, "O preço deve ser maior ou igual a 0")
      .required("Preço é obrigatório"),
    quantity: Yup.number()
      .min(0, "A quantidade deve ser maior ou igual a 0")
      .required("Quantidade é obrigatória"),
    categories: Yup.array()
      .of(Yup.string())
      .required("Categorias são obrigatórias"),
    images: Yup.array().of(
      Yup.object({
        url: Yup.string().required(),
        isPrimary: Yup.boolean().optional(),
      })
    ),
  });

  const handleSetPrimaryImage = (
    index: number,
    images: ProductImageDto[],
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const updatedImages = images.map((image, i) => ({
      ...image,
      isPrimary: i === index,
    }));
    setFieldValue("images", updatedImages);
  };

  const handleRemoveImage = (
    index: number,
    images: ProductImageDto[],
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setFieldValue("images", updatedImages);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEditMode ? "Editar Produto" : "Criar Produto"}</h1>
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
          brand: initialValues?.brand || "",
          price: initialValues?.price || 0,
          quantity: initialValues?.quantity || 0,
          categories: initialValues?.categories || [],
          images: initialValues?.images || [],
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          setIsSubmitting(true);
          const formData = new FormData();
          formData.append("name", values.name);
          formData.append("description", values.description);
          formData.append("brand", values.brand);
          formData.append("price", values.price.toString());
          formData.append("quantity", values.quantity.toString());
          values.categories.forEach((category) =>
            formData.append("categories", category)
          );
          values.images.forEach((image) =>
            formData.append("images", JSON.stringify(image))
          );

          try {
            if (isEditMode && productId) {
              await axiosInstance.patch(`/products/${productId}`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              addToast("Produto atualizado com sucesso!", "success");
            } else {
              await axiosInstance.post("/products", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              addToast("Produto criado com sucesso!", "success");
            }

            resetForm();
            onSubmitSuccess?.();
          } catch (error) {
            console.error("Erro ao salvar produto:", error);
            addToast("Erro ao salvar produto. Tente novamente.", "error");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {({ setFieldValue, values }) => (
          <Form className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="name">
                Nome do Produto
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
              <label className={styles.label} htmlFor="brand">
                Marca
              </label>
              <Field
                id="brand"
                name="brand"
                type="text"
                className={styles.input}
              />
              <ErrorMessage
                name="brand"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.formGroupTwoColumns}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="price">
                  Preço
                </label>
                <Field
                  id="price"
                  name="price"
                  type="number"
                  className={styles.input}
                />
                <ErrorMessage
                  name="price"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="quantity">
                  Quantidade
                </label>
                <Field
                  id="quantity"
                  name="quantity"
                  type="number"
                  className={styles.input}
                />
                <ErrorMessage
                  name="quantity"
                  component="div"
                  className={styles.error}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="categories">
                Categorias
              </label>
              <Field
                as="select"
                id="categories"
                name="categories"
                multiple
                className={styles.input}
              >
                <option value="categoria1">Categoria 1</option>
                <option value="categoria2">Categoria 2</option>
                <option value="categoria3">Categoria 3</option>
              </Field>
              <ErrorMessage
                name="categories"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="images">
                Imagens
              </label>
              <input
                id="images"
                name="images"
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const newImages = files.map((file) => ({
                    id: undefined,
                    url: URL.createObjectURL(file),
                    isPrimary: false,
                  }));
                  setFieldValue("images", [...values.images, ...newImages]);
                }}
              />
              <div className={styles.imagePreviewContainer}>
                {values.images.map((image, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={image.url} alt={`Preview ${index}`} />
                    <div className={styles.imageActions}>
                      <button
                        type="button"
                        onClick={() =>
                          handleSetPrimaryImage(
                            index,
                            values.images,
                            setFieldValue
                          )
                        }
                      >
                        {image.isPrimary ? "Primária" : "Definir Primária"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveImage(index, values.images, setFieldValue)
                        }
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                  ? "Salvar Produto"
                  : "Criar Produto"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProductForm;
