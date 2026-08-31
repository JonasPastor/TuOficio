package ar.edu.utn.frc.tup.app.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferenceResponse {
    private String preferenceId;
    private String initPoint;
    private String sandboxInitPoint;
    private Integer facturaId;
}

