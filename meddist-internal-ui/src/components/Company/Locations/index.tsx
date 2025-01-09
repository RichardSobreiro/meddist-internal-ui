/** @format */

import React, { useState, useEffect, useCallback } from "react";
import styles from "./LocationsList.module.css";
import axiosInstance from "@/services/axiosInstance";
import { useSpinner } from "@/context/SpinnerContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/router";
import ClickableText from "@/components/general/ClickableText";
import { useDevice } from "@/context/DeviceContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

interface Address {
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface Location {
  id: string;
  name: string;
  capacity: number;
  address?: Address;
}

const LocationsList: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const { showSpinner, hideSpinner } = useSpinner();
  const { addToast } = useToast();
  const router = useRouter();
  const { isMobile } = useDevice();

  const fetchLocations = useCallback(async () => {
    try {
      showSpinner();
      const response = await axiosInstance.get(`/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error("Erro ao buscar localizações:", error);
      addToast("Erro ao buscar localizações. Tente novamente.", "error");
    } finally {
      hideSpinner();
    }
  }, [addToast, hideSpinner, showSpinner]);

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToCreateLocation = () => {
    router.push("/empresa/localizacoes/criar");
  };

  const navigateToEditLocation = (locationId: string) => {
    router.push(`/empresa/localizacoes/${locationId}/editar`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Localizações</h1>
          <ClickableText
            text={"Empresa"}
            onClick={function (): void {
              router.push("/empresa");
            }}
            className={"small_primary"}
          />
        </div>
        <button
          className={styles.createButton}
          onClick={navigateToCreateLocation}
        >
          Criar
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Capacidade (m³)</th>
            <th>Endereço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {locations?.map((location) => (
            <tr key={location.id}>
              <td>{location.name}</td>
              <td>{location.capacity}</td>
              <td>
                {location.address
                  ? `${location.address.address}, ${location.address.number}, ${location.address.city} - ${location.address.state}`
                  : "Sem endereço"}
              </td>
              <td>
                <button
                  className={styles.manageButton}
                  onClick={() => navigateToEditLocation(location.id)}
                >
                  {isMobile ? (
                    <FontAwesomeIcon icon={faEdit} />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faEdit} /> Editar
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LocationsList;
