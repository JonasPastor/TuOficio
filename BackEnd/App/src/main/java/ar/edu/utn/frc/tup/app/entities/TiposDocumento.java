package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "tipos_documento")
public class TiposDocumento {
    @Id
    @ColumnDefault("nextval('tipos_documento_idtipodoc_seq')")
    @Column(name = "idtipodoc", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "tipo", nullable = false)
    private String tipo;

}