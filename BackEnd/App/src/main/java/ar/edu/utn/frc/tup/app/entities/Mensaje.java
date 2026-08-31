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
@Table(name = "mensajes")
public class Mensaje {
    @Id
    @ColumnDefault("nextval('mensajes_idmensaje_seq')")
    @Column(name = "idmensaje", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idsolicitud", nullable = false)
    private Solicitude idsolicitud;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idremitente", nullable = false)
    private Usuario idremitente;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "iddestinatario", nullable = false)
    private Usuario iddestinatario;

    @Size(max = 500)
    @NotNull
    @Column(name = "mensaje", nullable = false, length = 500)
    private String mensaje;

    @ColumnDefault("now()")
    @Column(name = "fechahora")
    private Instant fechahora;

}