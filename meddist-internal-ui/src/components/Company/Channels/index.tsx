/** @format */

import React, { useState, useEffect, useCallback } from "react";
import styles from "./ChannelList.module.css";
import axiosInstance from "@/services/axiosInstance";
import { useSpinner } from "@/context/SpinnerContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/router";
import ClickableText from "@/components/general/ClickableText";

interface Channel {
  id: string;
  name: string;
  description?: string;
}

const ChannelsList: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const { showSpinner, hideSpinner } = useSpinner();
  const { addToast } = useToast();
  const router = useRouter();

  const fetchChannels = useCallback(async () => {
    try {
      showSpinner();
      const response = await axiosInstance.get(`/channels`);
      setChannels(response.data);
    } catch (error) {
      console.error("Erro ao buscar canais:", error);
      addToast("Erro ao buscar canais. Tente novamente.", "error");
    } finally {
      hideSpinner();
    }
  }, [addToast, hideSpinner, showSpinner]);

  useEffect(() => {
    fetchChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToCreateChannel = () => {
    router.push("/empresa/canais/criar");
  };

  const navigateToEditChannel = (channelId: string) => {
    router.push(`/empresa/canais/${channelId}/editar`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Canais</h1>
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
          onClick={navigateToCreateChannel}
        >
          Criar Canal
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {channels?.map((channel) => (
            <tr key={channel.id}>
              <td>{channel.name}</td>
              <td>{channel.description || "-"}</td>
              <td>
                <button
                  className={styles.manageButton}
                  onClick={() => navigateToEditChannel(channel.id)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChannelsList;
