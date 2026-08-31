export interface FacturaPDF {
  nroFactura: number;
  nombreCliente: string;
  nombreProfesional: string;
  descripcionServicio: string;
  importe: number;
  fecha: string;
  estadoPago: string;
  medioPago: string;
}
