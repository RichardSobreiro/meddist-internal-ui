/** @format */

import React, { useCallback, useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./ProductForm.module.css";
import axiosInstance from "@/services/axiosInstance";
import { useToast } from "@/context/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useSpinner } from "@/context/SpinnerContext";

interface ProductFormValues {
  name: string;
  description: string;
  brand: string;
  price: string;
  categories: string[];
  images: ProductImageDto[];
}

interface ProductImageDto {
  id?: string;
  url: string;
  isPrimary?: boolean;
  isListImage?: boolean;
  file?: File;
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmitSuccess?: (productId?: string) => void;
  isEditMode?: boolean;
  productId?: string;
  onCancel?: () => void;
}

interface Category {
  id: string;
  name: string;
}

export const formatToBrazilianPrice = (value: number | string) =>
  value ? parseFloat(String(value)).toFixed(2).replace(".", ",") : "";

const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  onSubmitSuccess,
  isEditMode = false,
  productId,
  onCancel,
}) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { showSpinner, hideSpinner } = useSpinner();

  const validationSchema = Yup.object({
    name: Yup.string().required("Nome do produto é obrigatório"),
    description: Yup.string().optional(),
    brand: Yup.string().required("Marca é obrigatória"),
    price: Yup.string()
      .matches(/^\d{1,3}(\.\d{3})*(,\d{1,2})?$/, "Preço inválido")
      .typeError("O preço deve ser um número")
      .min(0, "O preço deve ser maior ou igual a 0")
      .required("Preço é obrigatório"),
    categories: Yup.array()
      .of(Yup.string())
      .min(1, "Selecione pelo menos uma categoria")
      .required("Categorias são obrigatórias"),
    images: Yup.array()
      .of(
        Yup.object({
          url: Yup.string().required("A URL da imagem é obrigatória"),
          isPrimary: Yup.boolean().optional(),
        })
      )
      .test(
        "has-one-primary",
        "Selecione exatamente uma imagem principal",
        (images) => {
          const primaryImages = images?.filter((img) => img.isPrimary) || [];
          return primaryImages.length === 1;
        }
      )
      .required("Adicione pelo menos uma imagem"),
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

  const fetchProduct = useCallback(
    async (
      productId: string,
      setFieldValue: (
        field: string,
        value: unknown,
        shouldValidate?: boolean
      ) => void
    ) => {
      try {
        showSpinner();
        const response = await axiosInstance.get(`/products/${productId}`);
        const product = response.data;
        setFieldValue("name", product.name);
        setFieldValue("description", product.description || "");
        setFieldValue("brand", product.brand);
        // Convert price to Brazilian format
        setFieldValue("price", formatToBrazilianPrice(product.price));
        const selectedCategoryId = product.categories?.[0]?.id || "";
        setFieldValue("categories", [selectedCategoryId]);
        setFieldValue(
          "images",
          product.images.map((image: ProductImageDto) => ({
            id: image.id,
            url: image.url,
            isPrimary: image.isPrimary,
            isListImage: image.isListImage,
          }))
        );
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        addToast("Erro ao carregar produto. Tente novamente.", "error");
      } finally {
        hideSpinner();
      }
    },
    [addToast, hideSpinner, showSpinner]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        addToast("Erro ao carregar categorias.", "error");
      }
    };

    fetchCategories();
  }, [addToast]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEditMode ? "Editar Produto" : "Criar Produto"}</h1>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Voltar
        </button>
      </div>

      <Formik
        initialValues={{
          name: initialValues?.name || "",
          description: initialValues?.description || "",
          brand: initialValues?.brand || "",
          price: initialValues?.price || null,
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
          const normalizedPrice = values.price
            ? values.price.toString().replace(/\./g, "").replace(",", ".")
            : "";
          formData.append("price", normalizedPrice);
          values.categories.forEach((category) =>
            formData.append("categories", category)
          );

          const metadataArray = values.images.map((image, index) => {
            if (image.file) {
              formData.append("images", image.file);
              return {
                url: image.url,
                isPrimary: image.isPrimary,
                isListImage: image.isListImage,
                position: index,
              };
            } else {
              return {
                id: image.id,
                url: image.url,
                isPrimary: image.isPrimary,
                isListImage: image.isListImage,
              };
            }
          });

          formData.append("imagesMetadata", JSON.stringify(metadataArray));

          try {
            showSpinner();
            if (isEditMode && productId) {
              await axiosInstance.patch(`/products/${productId}`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              addToast("Produto atualizado com sucesso!", "success");
              onSubmitSuccess?.(productId);
            } else {
              const response = await axiosInstance.post("/products", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
              const createdProduct = response.data;
              addToast("Produto criado com sucesso!", "success");
              resetForm();
              onSubmitSuccess?.(createdProduct.id);
            }
          } catch (error) {
            console.error("Erro ao salvar produto:", error);
            addToast("Erro ao salvar produto. Tente novamente.", "error");
          } finally {
            setIsSubmitting(false);
            hideSpinner();
          }
        }}
      >
        {({ setFieldValue, values }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (isEditMode && productId) {
              fetchProduct(productId, setFieldValue);
            }
          }, [isEditMode, productId]);

          return (
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

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="price">
                  Preço
                </label>
                <Field
                  id="price"
                  name="price"
                  type="text"
                  className={styles.input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // Keep user-friendly input with Brazilian formatting (e.g., "1.234,56")
                    const formattedValue = e.target.value
                      .replace(/\D/g, "") // Remove non-digit characters
                      .replace(/(\d)(\d{2})$/, "$1,$2") // Insert the decimal comma
                      .replace(/(?=(\d{3})+(\D))\B/g, "."); // Add thousands dots
                    setFieldValue("price", formattedValue);
                  }}
                  value={values.price}
                />

                <ErrorMessage
                  name="price"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.dropdownContainer}>
                <Field
                  as="select"
                  id="categories"
                  name="categories"
                  className={`${styles.input} ${styles.select}`}
                  onChange={(e: { target: { value: unknown } }) => {
                    const selectedValue = e.target.value;
                    setFieldValue(
                      "categories",
                      selectedValue ? [selectedValue] : []
                    ); // Wrap the selected value in an array
                  }}
                >
                  <option value="" disabled>
                    Selecione uma categoria
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Field>
                <FontAwesomeIcon
                  icon={faCaretDown}
                  className={styles.caretIcon}
                />
                <ErrorMessage
                  name="categories"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.fileInputContainer}>
                  <label htmlFor="images" className={styles.fileInputLabel}>
                    Escolher Imagens
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
                          file,
                        }));
                        setFieldValue("images", [
                          ...values.images,
                          ...newImages,
                        ]);
                      }}
                      className={styles.fileInput}
                    />
                  </label>
                  <span className={styles.fileCount}>
                    {values.images.length}{" "}
                    {values.images.length === 1 ? "imagem" : "imagens"}
                  </span>
                </div>
                <div className={styles.imagePreviewContainer}>
                  {values.images.map((image, index) => (
                    <div key={index} className={styles.imagePreview}>
                      <div className={styles.imageWrapper}>
                        <Image
                          src={image.url}
                          alt={`Preview ${index}`}
                          layout="fill"
                          objectFit="contain"
                          className={styles.image}
                        />
                        {image.isPrimary && (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className={styles.primaryCheck}
                            title="Imagem Primária"
                          />
                        )}
                      </div>
                      <div className={styles.imageActions}>
                        {!image.isPrimary && (
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
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveImage(
                              index,
                              values.images,
                              setFieldValue
                            )
                          }
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <ErrorMessage
                  name="images"
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
                    ? "Salvar Produto"
                    : "Criar Produto"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ProductForm;
