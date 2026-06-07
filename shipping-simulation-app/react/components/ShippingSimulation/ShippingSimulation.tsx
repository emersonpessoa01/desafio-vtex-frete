import React, { useState } from "react";
import { useOrderForm } from "vtex.order-manager/OrderForm";
import { useProduct } from "vtex.product-context";
import { useLazyQuery } from "react-apollo";
import SIMULATION_QUERY from "../../graphql/shipping.gql";

const ShippingSimulation = () => {
  // Estado do CEP digitado pelo usuário
  const [cep, setCep] = useState("");

  // Estado da mensagem de erro de validação
  const [error, setError] = useState("");

  // Dados do produto aberto na página (PDP)
  const productContext = useProduct();

  // Itens que já estão no carrinho do usuário
  const { orderForm } = useOrderForm();

  // Executa a query apenas quando handleCalculate for chamado
  const [getSimulation, { data, loading, error: queryError }] =
    useLazyQuery(SIMULATION_QUERY);

  const handleCalculate = () => {
    setError("");

    // Remove tudo que não for número do CEP
    const cleanedCep = cep.replace(/\D/g, "");

    // CEP brasileiro sempre tem 8 dígitos
    if (cleanedCep.length !== 8) {
      setError("Por favor, digite um CEP válido com 8 dígitos.");
      return;
    }

    // ID do SKU selecionado na PDP
    const itemId = productContext?.selectedItem?.itemId;

    // ID do vendedor — usa "1" como padrão se não encontrar
    const sellerId =
      productContext?.selectedItem?.sellers?.[0]?.sellerId ?? "1";

    if (!itemId) {
      setError("Produto não identificado.");
      return;
    }

    // Itens do carrinho convertidos para o formato da query
    const cartItems = (orderForm?.items ?? []).map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      seller: item.seller ?? "1"
    }));

    // SKU atual da PDP
    const pdpItem = { id: itemId, quantity: 1, seller: sellerId };

    // Se o item da PDP já está no carrinho, usa só o carrinho. Senão, adiciona.
    const items = cartItems.some((i: any) => i.id === pdpItem.id)
      ? cartItems
      : [...cartItems, pdpItem];

    // Dispara a query com todos os itens + CEP
    getSimulation({
      variables: {
        items,
        postalCode: cleanedCep,
        country: "BRA"
      }
    });

    setCep("");
  };

  // Opções de frete retornadas pela query
  // sla = cada modalidade de entrega disponível
  const slas = data?.shipping?.logisticsInfo?.[0]?.slas ?? [];

  // Converte: "3bd" → "3 dias úteis" | "5d" → "5 dias"
  const formatEstimate = (estimate: string) => {
    const match = estimate.match(/^(\d+)(bd|d)$/);
    if (!match) return estimate;
    const [, days, type] = match;
    return type === "bd" ? `${days} dias úteis` : `${days} dias`;
  };

  // Converte: 0 → "Grátis" | 500 → "R$ 5,00"
  const formatPrice = (price: number) => {
    if (price === 0) return "Grátis";
    return (price / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  return (
    <section aria-label="Simulação de frete" style={container}>
      <h3 style={titleStyle}>Calcular Frete</h3>

      {/* label vinculado ao input pelo id — acessibilidade */}
      <label htmlFor="cep-input" style={labelStyle}>
        CEP
      </label>

      <input
        autoFocus
        id="cep-input"
        style={containerInput}
        type="text"
        inputMode="numeric"
        maxLength={8}
        placeholder="00000000"
        value={cep}
        aria-label="Digite seu CEP"
        onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
      />

      <button
        style={containerButton(loading)}
        onClick={handleCalculate}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Calculando..." : "Calcular Frete"}
      </button>

      {/* Erro de validação */}
      {error && (
        <p role="alert" style={errorStyle}>
          {error}
        </p>
      )}

      {/* Erro de rede ou da API */}
      {queryError && (
        <p role="alert" style={errorStyle}>
          Erro ao buscar opções de frete. Tente novamente.
        </p>
      )}

      {/* Resultado da simulação */}
      {data && (
        <div aria-live="polite" style={resultContainer}>
          {slas.length === 0 ? (
            <p style={emptyStyle}>
              Nenhuma opção de frete encontrada para este CEP.
            </p>
          ) : (
            <ul style={listStyle}>
              {slas.map((sla: any) => (
                <li key={sla.id} style={slaStyle}>
                  {/* Nome da modalidade de entrega */}
                  <span style={strongText}>{sla.friendlyName || sla.name}</span>
                  <div style={slaInfoStyle}>
                    <span style={spanText}>💰 {formatPrice(sla.price)}</span>
                    <span style={spanText}>
                      🕐 {formatEstimate(sla.shippingEstimate)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "16px",
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
  marginBottom: "16px"
};

const titleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
  margin: "0 0 4px 0"
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#555"
};

const containerInput: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  outline: "none",
  fontSize: "14px"
};

// Muda a cor do botão dependendo do estado de loading
const containerButton = (isLoading: boolean): React.CSSProperties => ({
  padding: "8px",
  backgroundColor: isLoading ? "#ccc" : "#0f3e99",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: isLoading ? "not-allowed" : "pointer",
  fontSize: "14px",
  textTransform: "uppercase",
  transition: "background-color 0.3s ease-in-out"
});

const resultContainer: React.CSSProperties = { marginTop: "12px" };

// Remove marcadores padrão da lista
const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

// Card de cada opção de frete
const slaStyle: React.CSSProperties = {
  padding: "10px 12px",
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: "4px"
};

const strongText: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: "14px",
  display: "block",
  marginBottom: "4px",
  color: "#333"
};

const slaInfoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px"
};

const spanText: React.CSSProperties = {
  fontSize: "13px",
  color: "#555"
};

const errorStyle: React.CSSProperties = {
  color: "#ef1717",
  fontSize: "14px",
  marginTop: "4px"
};

const emptyStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#555",
  fontStyle: "italic"
};

export default ShippingSimulation;
