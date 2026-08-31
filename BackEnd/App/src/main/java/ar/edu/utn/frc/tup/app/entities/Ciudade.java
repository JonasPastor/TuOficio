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
@Table(name = "ciudades")
public class Ciudade {
    @Id
    @ColumnDefault("nextval('ciudades_idciudad_seq')")
    @Column(name = "idciudad", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "ciudad", nullable = false, length = 100)
    private String ciudad;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "iddepartamento", nullable = false)
    private Departamento iddepartamento;

}