declare module "vtex.order-manager/OrderForm" {
  export const useOrderForm: () => {
    orderForm: {
      shipping: {
        selectedAddress: {
          postalCode: string;
        };
      };
    };
    setOrderForm: (orderForm: any) => void;
  };
}
