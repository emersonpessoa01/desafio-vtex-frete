import React, { useState } from "react";
import { useOrderForm } from "vtex.order-manager/OrderForm";
import { useProduct } from "vtex.product-context";
import { useLazyQuery } from "react-apollo";
import SIMULATION_QUERY from "../../graphql/shipping.gql";

const ShippingSimulation = () => {
  const [cep, setCep] = useState("");
  const { orderForm } = useOrderForm();
  const productContext = useProduct();

  const productId = productContext?.selectedItem?.itemId;

  const [getSimulation, { data, loading }] = useLazyQuery(SIMULATION_QUERY);

  console.log("Order Form: ", orderForm);
  console.log("Product ID: ", productId);

  const handleCalculate = () => {
    const itemId = productContext?.selectedItem?.itemId;
    const sellerId =
      productContext?.selectedItem?.sellers?.[0]?.sellerId ?? "1";

    if (!itemId || cep.length < 8) return;

    getSimulation({
      variables: {
        items: [
          {
            id: itemId,
            quantity: 1,
            seller: sellerId
          }
        ],
        postalCode: cep,
        country: "BRA"
      }
    });
  };

  const container: React.CSSProperties = {
    display: "flex",
    flexFlow: "column wrap",
    justifyContent: "center",
    height: "auto",
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: "24px 12px",
    gap: "4px",
    borderRadius: "4px"
  };

  const containerInput: React.CSSProperties = {
    borderRadius: "4px",
    border: "1px solid #ccc",
    padding: "5px"
  };

  const containerButton: React.CSSProperties = {
    borderRadius: "4px",
    border: "1px solid #ccc",
    padding: "5px",
    backgroundColor: "#0f3e99",
    color: "#fff",
    cursor: "pointer"
  };

  const slas = data?.shipping?.logisticsInfo?.[0]?.slas ?? [];

  return (
    <div style={container}>
      <input
        style={containerInput}
        type="text"
        maxLength={8}
        placeholder="Digite o CEP"
        onChange={(e) => setCep(e.target.value)}
      />
      <button
        style={containerButton}
        type="submit"
        onClick={handleCalculate}
        disabled={loading}
      >
        {loading ? "Calculando..." : "Calcular"}
      </button>

      {data && (
        <div style={{ marginTop: "10px" }}>
          {slas.length === 0 ? (
            <p>Nenhuma opção de frete encontrada.</p>
          ) : (
            slas.map((sla: any) => (
              <div
                key={sla.id}
                style={{ padding: "8px", borderBottom: "1px solid #ccc" }}
              >
                <strong>{sla.friendlyName || sla.name}</strong>
                <span> — R$ {(sla.price / 100).toFixed(2)}</span>
                <span> — {sla.shippingEstimate}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingSimulation;
