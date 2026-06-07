import React, { useState } from "react";
import { useProduct } from "vtex.product-context";
import { useLazyQuery } from "react-apollo";
import SIMULATION_QUERY from "../../graphql/shipping.gql";

const ShippingSimulation = () => {
  const [cep, setCep] = useState("");
  const [error, setError] = useState("");
  const productContext = useProduct();

  const [getSimulation, { data, loading }] = useLazyQuery(SIMULATION_QUERY);

  const handleCalculate = () => {
    setError(""); // Limpa erro anterior
    const cleanedCep = cep.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cleanedCep.length !== 8) {
      setError("Por favor, digite um CEP válido com 8 dígitos.");
      return;
    }

    const itemId = productContext?.selectedItem?.itemId;
    const sellerId =
      productContext?.selectedItem?.sellers?.[0]?.sellerId ?? "1";

    if (!itemId) {
      setError("Produto não identificado.");
      return;
    }

    getSimulation({
      variables: {
        items: [{ id: itemId, quantity: 1, seller: sellerId }],
        postalCode: cleanedCep,
        country: "BRA"
      }
    });
    setCep("");
  };

  const slas = data?.shipping?.logisticsInfo?.[0]?.slas ?? [];

  return (
    <div style={container}>
      <input
        autoFocus
        type="text"
        maxLength={8}
        placeholder="Digite o CEP (apenas números)"
        value={cep}
        onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
      />
      <button
        style={containerButton}
        onClick={handleCalculate}
        disabled={loading}
      >
        {loading ? "Calculando..." : "Calcular Frete"}
      </button>

      {error && <p style={errorStyle}>{error}</p>}

      {data && (
        <div style={resultContainer}>
          {slas.length === 0 ? (
            <p>Nenhuma opção de frete encontrada para este CEP.</p>
          ) : (
            slas.map((sla: any) => (
              <div key={sla.id} style={slaStyle}>
                <span style={strongText}>{sla.name}</span>
                <div style={slaInfoStyle}>
                  <span style={spanText}>
                    Preço:{" "}
                    {(sla.price / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    })}
                  </span>

                  <span style={spanText}>
                    Prazo: {sla.shippingEstimate.replace("bd", " dias úteis")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Estilização simplificada
const container: React.CSSProperties = {
  display: "flex",
  flexFlow: "column",
  gap: "8px",
  padding: "16px",
  backgroundColor: "#f9f9f9",
  borderRadius: "4px"
};
const containerInput: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  outline: "none",
  transition: "all 0.3s ease-in-out"
};
const containerButton: React.CSSProperties = {
  padding: "8px",
  backgroundColor: "#0f3e99",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  textTransform: "uppercase"
};
const slaStyle: React.CSSProperties = {
  padding: "8px",
  background: "#fff",
  marginBottom: "4px",
  border: "1px solid #eee",
  borderRadius: "4px"
};

const strongText: React.CSSProperties = {
  fontWeight: "bold",
  marginBottom: "4px",
  display: "block"
};

// Estilização simplificada do slas
const resultContainer: React.CSSProperties = { marginTop: "15px" };

const slaInfoStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#555",
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const errorStyle: React.CSSProperties = {
  color: "red",
  fontSize: "12px",
  marginTop: "8px"
};

const spanText: React.CSSProperties = {
  fontSize: "13px",
  color: "#555",
  display: "block"
};

export default ShippingSimulation;
