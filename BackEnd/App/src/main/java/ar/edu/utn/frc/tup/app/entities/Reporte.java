package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Builder
@Table(name = "reportes")
@AllArgsConstructor
@NoArgsConstructor
public class Reporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idreporte", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idprofesional", nullable = false)
    private Profesionale idprofesional;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reportado_por")
    private Usuario reportadoPor;

    @NotNull
    @Size(max = 500)
    @Column(name = "razon", nullable = false, length = 500)
    private String razon;

    @CreationTimestamp
    @Column(name = "fecha_reporte", nullable = false, updatable = false)
    private LocalDateTime fechaReporte;

    @Column(name = "atendido", nullable = false)
    private Boolean atendido = false;

    @Column(name = "fecha_atencion")
    private LocalDateTime fechaAtencion;

    @Size(max = 1000)
    @Column(name = "resolucion", length = 1000)
    private String resolucion;
}
