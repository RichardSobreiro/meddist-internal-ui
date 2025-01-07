/** @format */

import React, { useCallback, useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./ChannelForm.module.css";
import axiosInstance from "@/services/axiosInstance";
import { useToast } from "@/context/ToastContext";
import { useSpinner } from "@/context/SpinnerContext";
import { useRouter } from "next/router";

export interface ChannelFormValues {
  name: string;
  description?: string;
}

interface ChannelFormProps {
  initialValues?: ChannelFormValues;
  onSubmitSuccess?: () => void;
  isEditMode?: boolean;
  channelId?: string;
  onCancel?: () => void;
}

const ChannelForm: React.FC<ChannelFormProps> = ({
  initialValues,
  onSubmitSuccess,
  isEditMode = false,
  channelId,
  onCancel,
}) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSpinner, hideSpinner } = useSpinner();
  const router = useRouter();

  const validationSchema = Yup.object({
    name: Yup.string().required("O nome do canal é obrigatório"),
    description: Yup.string().optional(),
  });

  const fetchChannel = useCallback(
    async (
      channelId: string,
      setFieldValue: (
        field: string,
        value: unknown,
        shouldValidate?: boolean
      ) => void
    ) => {
      try {
        showSpinner();
        const response = await axiosInstance.get(`/channels/${channelId}`);
        const channel = response.data;
        setFieldValue("name", channel.name);
        setFieldValue("description", channel.description || "");
      } catch (error) {
        console.error("Erro ao buscar canal:", error);
        addToast("Erro ao carregar canal. Tente novamente.", "error");
      } finally {
        hideSpinner();
      }
    },
    [addToast, hideSpinner, showSpinner]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEditMode ? "Editar Canal" : "Criar Canal"}</h1>
      </div>

      <Formik
        initialValues={{
          name: initialValues?.name || "",
          description: initialValues?.description || "",
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setFieldValue }) => {
          setIsSubmitting(true);
          try {
            showSpinner();
            if (isEditMode && channelId) {
              await axiosInstance.patch(`/channels/${channelId}`, values);
              addToast("Canal atualizado com sucesso!", "success");

              // Reload the updated channel data
              await fetchChannel(channelId, setFieldValue);
            } else {
              const response = await axiosInstance.post("/channels", values);
              const createdChannel = response.data; // Assuming the response includes the created channel's ID
              addToast("Canal criado com sucesso!", "success");
              resetForm();
              router.push(`/empresa/canais/${createdChannel.id}/editar`);
            }

            onSubmitSuccess?.();
          } catch (error) {
            console.error("Erro ao salvar canal:", error);
            addToast("Erro ao salvar canal. Tente novamente.", "error");
          } finally {
            setIsSubmitting(false);
            hideSpinner();
          }
        }}
      >
        {({ setFieldValue }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (isEditMode && channelId) {
              fetchChannel(channelId, setFieldValue);
            }
          }, [setFieldValue]);

          return (
            <Form className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">
                  Nome do Canal
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
                    ? "Salvar Canal"
                    : "Criar Canal"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ChannelForm;
