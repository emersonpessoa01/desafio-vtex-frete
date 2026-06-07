declare module "vtex.order-manager/OrderForm" {
  export const useOrderForm: () => {
    orderForm: {
      items: Array<{ id: string }>;
      shipping: {
        selectedAddress: {
          postalCode: string;
        };
      };
    };
    setOrderForm: (orderForm: any) => void;
  };
}
