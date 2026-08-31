package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "departamentos")
public class Departamento {
    @Id
    @ColumnDefault("nextval('departamentos_iddepartamento_seq')")
    @Column(name = "iddepartamento", nullable = false)
    private Integer id;

    @Size(max = 255)
    @Column(name = "departamento")
    private String departamento;

}