export interface FacturaRequest {
  idSolicitud: number;
  idTrabajo: number;
  titulo: string;
  descripcion: string;
  cantidad: number;
  monto: number;
}

export interface PreferenceResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  facturaId?: number;
}

export interface MercadoPagoConfig {
  publicKey: string;
  sandbox: boolean;
}

export interface PagoFactura {
  fecha: string;
  monto: number;
  medioPago: string;
}
