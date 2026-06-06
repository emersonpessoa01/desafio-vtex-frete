import React, { useState } from "react";

const ShippingSimulation = () => {
  const [cep, setCep] = useState("");

  const handleCalculate = () => {
    console.log("O CEP digtado foi: ", cep);
    alert("O CEP foi: " + cep);
  };
  return (
    <div>
      <input
        type="text"
        maxLength={8}
        placeholder="Digite o CEP"
        onChange={(e) => setCep(e.target.value)}
      />
      <button type="submit" onClick={handleCalculate}>Calculate</button>
    </div>
  );
};

export default ShippingSimulation;
