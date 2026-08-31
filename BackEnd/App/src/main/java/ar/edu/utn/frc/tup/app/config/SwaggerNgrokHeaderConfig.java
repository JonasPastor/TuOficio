package ar.edu.utn.frc.tup.app.config;

import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.Parameter;
import org.springdoc.core.customizers.OpenApiCustomizer; // Para springdoc v2 (Spring Boot 3)
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerNgrokHeaderConfig {

    @Bean
    public OpenApiCustomizer ngrokHeaderCustomizer() {
        return openApi -> {
            if (openApi.getPaths() == null) return;

            openApi.getPaths().values().forEach(pathItem ->
                    pathItem.readOperations().forEach(operation -> {
                        boolean exists = operation.getParameters() != null &&
                                operation.getParameters().stream().anyMatch(p ->
                                        "ngrok-skip-browser-warning".equalsIgnoreCase(p.getName()) &&
                                                "header".equalsIgnoreCase(p.getIn()));

                        if (!exists) {
                            Parameter ngrokHeader = new Parameter()
                                    .name("ngrok-skip-browser-warning")
                                    .in("header")
                                    .required(false)
                                    .description("Header para evitar el warning de ngrok (403) al usar Swagger UI.")
                                    .schema(new StringSchema()._default("true").example("true"));

                            operation.addParametersItem(ngrokHeader);
                        }
                    })
            );
        };
    }
}
