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
@Table(name = "barrios")
public class Barrio {
    @Id
    @ColumnDefault("nextval('barrios_idbarrio_seq')")
    @Column(name = "idbarrio", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "barrio", nullable = false, length = 100)
    private String barrio;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idciudad", nullable = false)
    private Ciudade idciudad;

}