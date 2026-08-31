package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Entity
@Builder
@Table(name = "profesionales")
@AllArgsConstructor
@NoArgsConstructor
public class Profesionale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idprofesional", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "fechadesde", nullable = false)
    private LocalDate fechadesde;

    @Column(name = "fechahasta")
    private LocalDate fechahasta;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idusuario", nullable = false)
    private Usuario idusuario;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idoficio", nullable = false)
    private Oficio idoficio;

    @Column(name = "precio_min")
    private Integer precioMin;

    @Column(name = "precio_max")
    private Integer precioMax;

    @OneToMany(mappedBy = "idprofesional", fetch = FetchType.LAZY)
    private List<Especialidad> especialidades;
}