package ar.edu.utn.frc.tup.app.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "foto_galeria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FotoGaleria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "idprofesional", nullable = false)
    private Profesionale profesional;
    
    @Column(name = "url_foto", nullable = false, length = 500)
    private String urlFoto;
    
    @Column(name = "descripcion", length = 255)
    private String descripcion;
    
    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida;
    
    @Column(name = "orden")
    private Integer orden;
}
