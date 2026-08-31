package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalTime;

@Getter
@Setter
@Entity
@Table(name = "disponibilidad")
public class Disponibilidad {
    @Id
    @ColumnDefault("nextval('disponibilidad_iddisponibilidad_seq')")
    @Column(name = "iddisponibilidad", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idprofesional", nullable = false)
    private Profesionale idprofesional;

    @Size(max = 20)
    @NotNull
    @Column(name = "diasemana", nullable = false, length = 20)
    private String diasemana;

    @NotNull
    @Column(name = "horainicio", nullable = false)
    private LocalTime horainicio;

    @NotNull
    @Column(name = "horafin", nullable = false)
    private LocalTime horafin;

}