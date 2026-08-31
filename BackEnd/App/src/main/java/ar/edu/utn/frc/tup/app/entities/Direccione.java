package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "direcciones")
public class Direccione {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "iddireccion", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idbarrio", nullable = false)
    private Barrio idbarrio;

    @Size(max = 100)
    @NotNull
    @Column(name = "calle", nullable = false, length = 100)
    private String calle;

    @Size(max = 10)
    @NotNull
    @Column(name = "numero", nullable = false, length = 10)
    private String numero;

    @Size(max = 10)
    @Column(name = "piso", length = 10)
    private String piso;

    @Size(max = 10)
    @Column(name = "depto", length = 10)
    private String depto;

    @Size(max = 200)
    @Column(name = "observaciones", length = 200)
    private String observaciones;

}