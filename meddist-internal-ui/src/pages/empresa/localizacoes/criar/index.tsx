/** @format */

import LocationForm from "@/components/Company/Locations/LocationForm";
import Layout from "@/components/Layout";
import Head from "next/head";

export default function CriarLocalizacao() {
  return (
    <>
      <Head>
        <title>MedDist - Portal Interno</title>
        <meta
          name="description"
          content="Portal interno de uma distribuidora de medicamentos e materiais hospitalares - Venda de luvas, aventais, máscaras e muito mais"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="keywords" content="meddist, portal" />
        <meta name="language" content="pt-BR" />
      </Head>
      <Layout renderSideMenu={true}>
        <LocationForm />
      </Layout>
    </>
  );
}
