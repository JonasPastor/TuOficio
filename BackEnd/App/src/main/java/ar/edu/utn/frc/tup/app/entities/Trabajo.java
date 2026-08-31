package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "trabajos")
public class Trabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idtrabajo", nullable = false)
    private Integer id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idsolicitud", nullable = false, unique = true)
    private Solicitude solicitud;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idfactura", unique = true)
    private Factura factura;

    @NotNull
    @ColumnDefault("'PENDIENTE'")
    @Size(max = 20)
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Column(name = "fechainicio")
    private Instant fechaInicio;

    @Column(name = "fechafinalizacion")
    private Instant fechaFinalizacion;

    @Column(name = "fechacancelacion")
    private Instant fechaCancelacion;

    @Column(name = "duracionreal")
    private Integer duracionReal;

    @Size(max = 500)
    @Column(name = "observacionestrabajo", length = 500)
    private String observacionesTrabajo;

    @Size(max = 500)
    @Column(name = "observacionescancelacion", length = 500)
    private String observacionesCancelacion;

    @Column(name = "montofinal", precision = 10, scale = 2)
    private BigDecimal montoFinal;

    @Column(name = "montoadicional", precision = 10, scale = 2)
    private BigDecimal montoAdicional;

    @Size(max = 300)
    @Column(name = "descripcionadicional", length = 300)
    private String descripcionAdicional;

    @Size(max = 255)
    @Column(name = "fototrabajo", length = 255)
    private String fotoTrabajo;

    @Column(name = "idpago", length = 255)
    private String idpago;

    @ColumnDefault("now()")
    @Column(name = "creadoen", nullable = false)
    private Instant creadoEn;

    @ColumnDefault("now()")
    @Column(name = "actualizadoen", nullable = false)
    private Instant actualizadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = Instant.now();
        actualizadoEn = Instant.now();
        if (estado == null) {
            estado = "PENDIENTE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        actualizadoEn = Instant.now();
    }
}
