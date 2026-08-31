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
@Table(name = "oficios")
public class Oficio {
    @Id
    @ColumnDefault("nextval('oficios_idoficio_seq')")
    @Column(name = "idoficio", nullable = false)
    private Integer id;

    @Size(max = 100)
    @NotNull
    @Column(name = "oficio", nullable = false, length = 100)
    private String oficio;

    @Size(max = 255)
    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @NotNull
    @ColumnDefault("true")
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}