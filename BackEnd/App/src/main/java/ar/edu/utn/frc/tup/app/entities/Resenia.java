package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "resenias")
public class Resenia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idresenia", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idusuario", nullable = false)
    private Usuario idusuario;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idprofesional", nullable = false)
    private Profesionale idprofesional;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idtrabajo")
    private Trabajo trabajo;

    @Column(name = "puntuacion")
    private Integer puntuacion;

    @Size(max = 500)
    @Column(name = "comentario", length = 500)
    private String comentario;

    @ColumnDefault("now()")
    @Column(name = "fecha")
    private Instant fecha;

}