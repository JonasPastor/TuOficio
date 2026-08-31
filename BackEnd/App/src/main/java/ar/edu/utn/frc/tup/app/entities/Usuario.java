package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idusuario", nullable = false)
    private Integer id;

    @Size(max = 20)
    @Pattern(regexp = "^[0-9]+$", message = "Solo se permiten números")
    @Column(name = "documento", length = 20)
    private String documento;

    @Size(max = 20)
    @Pattern(regexp = "^[0-9]+$", message = "Solo se permiten números")
    @Column(name = "telefono", length = 20)
    private String telefono;

    @NotNull
    @Column(name = "nacimiento", nullable = false)
    private LocalDate nacimiento;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "iddireccion", nullable = false)
    private Direccione iddireccion;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idtipodoc", nullable = false)
    private TiposDocumento idtipodoc;

    @Size(max = 255)
    @Column(name = "avatar", nullable = false)
    private String avatar;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idauth", nullable = false)
    private Auth idauth;

    @Column(name = "strike")
    private Integer strike;
}