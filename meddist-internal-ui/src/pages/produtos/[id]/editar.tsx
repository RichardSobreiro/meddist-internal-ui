/** @format */

import Layout from "@/components/Layout";
import ProductForm from "@/components/Products/ProductForm";
import Head from "next/head";
import { useRouter } from "next/router";

export default function UpdateProduct() {
  const router = useRouter();
  const { id } = router.query;
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
        <ProductForm
          isEditMode={true}
          productId={id as string}
          onCancel={() => router.push("/produtos")}
        />
      </Layout>
    </>
  );
}
