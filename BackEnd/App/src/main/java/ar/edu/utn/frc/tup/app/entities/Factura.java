package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
//@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "facturas")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "facturas_seq")
    @SequenceGenerator(name = "facturas_seq", sequenceName = "facturas_nrofactura_seq", allocationSize = 1)
    @Column(name = "nrofactura", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idusuario", nullable = false)
    private Usuario idusuario;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idprofesional", nullable = false)
    private Profesionale idprofesional;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idmediopago", nullable = false)
    private Mediosdepago idmediopago;

    @OneToOne(mappedBy = "factura", fetch = FetchType.LAZY)
    private Trabajo trabajo;

    @ColumnDefault("now()")
    @Column(name = "fecha")
    private Instant fecha;

    @Size(max = 20)
    @NotNull
    @Column(name = "estadopago", nullable = false, length = 20)
    private String estadopago;

    @NotNull
    @Column(name = "importe", nullable = false, precision = 10, scale = 2)
    private BigDecimal importe;

    @PrePersist
    protected void onCreate() {
        if (fecha == null) {
            fecha = Instant.now();
        }
    }
}