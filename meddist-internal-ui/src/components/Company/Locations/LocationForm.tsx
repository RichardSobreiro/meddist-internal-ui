/** @format */

import React, { useCallback, useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage, FieldProps } from "formik";
import * as Yup from "yup";
import styles from "./LocationForm.module.css";
import axiosInstance from "@/services/axiosInstance";
import { useToast } from "@/context/ToastContext";
import { useSpinner } from "@/context/SpinnerContext";
import { useRouter } from "next/router";
import InputMask from "react-input-mask";

const brazilianStates = [
  { label: "AC", value: "Acre" },
  { label: "AL", value: "Alagoas" },
  { label: "AP", value: "Amapá" },
  { label: "AM", value: "Amazonas" },
  { label: "BA", value: "Bahia" },
  { label: "CE", value: "Ceará" },
  { label: "DF", value: "Distrito Federal" },
  { label: "ES", value: "Espírito Santo" },
  { label: "GO", value: "Goiás" },
  { label: "MA", value: "Maranhão" },
  { label: "MT", value: "Mato Grosso" },
  { label: "MS", value: "Mato Grosso do Sul" },
  { label: "MG", value: "Minas Gerais" },
  { label: "PA", value: "Pará" },
  { label: "PB", value: "Paraíba" },
  { label: "PR", value: "Paraná" },
  { label: "PE", value: "Pernambuco" },
  { label: "PI", value: "Piauí" },
  { label: "RJ", value: "Rio de Janeiro" },
  { label: "RN", value: "Rio Grande do Norte" },
  { label: "RS", value: "Rio Grande do Sul" },
  { label: "RO", value: "Rondônia" },
  { label: "RR", value: "Roraima" },
  { label: "SC", value: "Santa Catarina" },
  { label: "SP", value: "São Paulo" },
  { label: "SE", value: "Sergipe" },
  { label: "TO", value: "Tocantins" },
];

export interface Address {
  id?: string;
  userId?: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface LocationFormValues {
  name: string;
  capacity: number;
  address: {
    cep: string;
    address: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

interface LocationFormProps {
  initialValues?: LocationFormValues;
  onSubmitSuccess?: () => void;
  isEditMode?: boolean;
  locationId?: string;
  onCancel?: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  initialValues,
  onSubmitSuccess,
  isEditMode = false,
  locationId,
  onCancel,
}) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSpinner, hideSpinner } = useSpinner();
  const router = useRouter();

  const validationSchema = Yup.object({
    name: Yup.string().required("O nome da localização é obrigatório"),
    capacity: Yup.number()
      .integer("A capacidade deve ser um número inteiro")
      .min(0, "A capacidade deve ser no mínimo 0")
      .required("A capacidade é obrigatória"),
    address: Yup.object({
      cep: Yup.string().required("CEP é obrigatório"),
      address: Yup.string().required("Endereço é obrigatório"),
      number: Yup.string().required("Número é obrigatório"),
      complement: Yup.string().optional(),
      neighborhood: Yup.string().required("Bairro é obrigatório"),
      city: Yup.string().required("Cidade é obrigatória"),
      state: Yup.string().required("Estado é obrigatório"),
    }),
  });

  const fetchLocation = useCallback(
    async (
      locationId: string,
      setFieldValue: (
        field: string,
        value: unknown,
        shouldValidate?: boolean
      ) => void
    ) => {
      try {
        showSpinner();
        const response = await axiosInstance.get(`/locations/${locationId}`);
        const location = response.data;
        setFieldValue("name", location.name);
        setFieldValue("capacity", location.capacity);
        setFieldValue("address", location.address || {});
      } catch (error) {
        console.error("Erro ao buscar localização:", error);
        addToast("Erro ao carregar localização. Tente novamente.", "error");
      } finally {
        hideSpinner();
      }
    },
    [addToast, hideSpinner, showSpinner]
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const fetchCepData = async (cep: string, setFieldValue: Function) => {
    try {
      const response = await axiosInstance.get(
        `https://viacep.com.br/ws/${cep}/json/`
      );
      const data = response.data;
      if (!data.erro) {
        setFieldValue("address.address", data.logradouro);
        setFieldValue("address.neighborhood", data.bairro);
        setFieldValue("address.city", data.localidade);
        setFieldValue("address.state", data.uf);
        setFieldValue("address.complement", data.complemento);
      }
    } catch (error) {
      console.error("Erro ao buscar dados do CEP:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isEditMode ? "Editar Localização" : "Criar Localização"}</h1>
      </div>

      <Formik
        initialValues={{
          name: initialValues?.name || "",
          capacity: initialValues?.capacity || 0,
          address: initialValues?.address || {
            cep: "",
            address: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
          },
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          setIsSubmitting(true);
          try {
            showSpinner();
            if (isEditMode && locationId) {
              await axiosInstance.patch(`/locations/${locationId}`, values);
              addToast("Localização atualizada com sucesso!", "success");
            } else {
              const response = await axiosInstance.post("/locations", values);
              const createdLocation = response.data; // Assuming the response includes the created location's ID
              addToast("Localização criada com sucesso!", "success");
              resetForm();
              router.push(`/empresa/localizacoes/${createdLocation.id}/editar`);
            }
            onSubmitSuccess?.();
          } catch (error) {
            console.error("Erro ao salvar localização:", error);
            addToast("Erro ao salvar localização. Tente novamente.", "error");
          } finally {
            setIsSubmitting(false);
            hideSpinner();
          }
        }}
      >
        {({ setFieldValue }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (isEditMode && locationId) {
              fetchLocation(locationId, setFieldValue);
            }
          }, [setFieldValue]);

          return (
            <Form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nome da Localização</label>
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
                <label htmlFor="capacity">Capacidade</label>
                <Field
                  id="capacity"
                  name="capacity"
                  type="number"
                  className={styles.input}
                />
                <ErrorMessage
                  name="capacity"
                  component="div"
                  className={styles.error}
                />
              </div>

              {/* Address Fields */}
              <h3 className={styles.h3}>Endereço</h3>

              <div className={styles.formGroup}>
                <label htmlFor="address.cep">CEP</label>
                <Field name="address.cep">
                  {({ field }: FieldProps<string, Address>) => (
                    <InputMask
                      {...field}
                      mask="99999-999"
                      className={styles.input}
                      maskChar=" "
                      onChange={(e) => {
                        setFieldValue("address.cep", e.target.value);
                        if (
                          e.target.value.replace(/[^0-9]/g, "").length === 8
                        ) {
                          fetchCepData(e.target.value, setFieldValue);
                        }
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="address.cep"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.address">Endereço</label>
                <Field
                  id="address.address"
                  name="address.address"
                  type="text"
                  className={styles.input}
                />
                <ErrorMessage
                  name="address.address"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.number">Número</label>
                <Field
                  id="address.number"
                  name="address.number"
                  type="text"
                  className={styles.input}
                />
                <ErrorMessage
                  name="address.number"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.complement">Complemento</label>
                <Field
                  id="address.complement"
                  name="address.complement"
                  type="text"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.neighborhood">Bairro</label>
                <Field
                  id="address.neighborhood"
                  name="address.neighborhood"
                  type="text"
                  className={styles.input}
                />
                <ErrorMessage
                  name="address.neighborhood"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.city">Cidade</label>
                <Field
                  id="address.city"
                  name="address.city"
                  type="text"
                  className={styles.input}
                />
                <ErrorMessage
                  name="address.city"
                  component="div"
                  className={styles.error}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.state">Estado</label>
                <Field
                  as="select"
                  id="address.state"
                  name="address.state"
                  className={styles.input}
                >
                  <option value="" disabled>
                    Selecione um estado
                  </option>
                  {brazilianStates.map((state) => (
                    <option key={state.label} value={state.label}>
                      {state.value}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="address.state"
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
                    ? "Salvar Localização"
                    : "Criar Localização"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default LocationForm;
