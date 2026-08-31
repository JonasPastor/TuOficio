package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "montos")
public class Monto {
    @Id
    @ColumnDefault("nextval('montos_idmonto_seq')")
    @Column(name = "idmonto", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idprofesional", nullable = false)
    private Profesionale idprofesional;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idoficio", nullable = false)
    private Oficio idoficio;

    @NotNull
    @Column(name = "preciomin", nullable = false, precision = 10, scale = 2)
    private BigDecimal preciomin;

    @NotNull
    @Column(name = "preciomax", nullable = false, precision = 10, scale = 2)
    private BigDecimal preciomax;

}