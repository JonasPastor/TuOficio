package ar.edu.utn.frc.tup.app.config;

import ar.edu.utn.frc.tup.app.config.jwt.JwtAuthorizationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthorizationFilter jwtAuthorizationFilter;
    private final AuthenticationProvider authProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authRequest ->
                        authRequest
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers(
                                        "/api/v1/auth/**",
                                        "/v3/api-docs/**",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/api/v1/registro/**",
                                        "/api/v1/pagos/**", // Temporalmente público para debugging
                                        "/api/v1/password/**",
                                        "/api/v1/resenias/**",
                                        "/api/v1/domicilios/departamentos/all",
                                        "/api/v1/domicilios/ciudades/all",
                                        "/api/v1/domicilios/barrios/all",
                                        "/api/v1/domicilios/departamento/*",
                                        "/api/v1/domicilios/ciudad/*",
                                        "/api/v1/domicilios/barrio/*",
                                        "/api/v1/domicilios/barrio/ciudad/*",
                                        "/api/v1/domicilios/ciudad/departamento/*",
                                        "/api/v1/usuario/tipos-documento",
                                        "/api/v1/oficios/all",
                                        "/api/v1/perfil/profesional/oficio/**",
                                        "/api/v1/perfil/profesionales/**",
                                        "/api/v1/solicitudes/profesionales/mas-solicitados"
                                ).permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/galeria/profesional/*").permitAll()
                                .anyRequest().authenticated()
                )
                .sessionManagement(sessionManager -> sessionManager
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authProvider)
                .addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://192.168.*",
                "https://*.ngrok-free.dev",
                "https://*.ngrok-free.app",
                "https://*.ngrok.io"
        );
        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*", "Authorization", "Content-Type", "ngrok-skip-browser-warning"));
        configuration.setExposedHeaders(Arrays.asList("Location", "Content-Disposition", "X-Request-Id"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
