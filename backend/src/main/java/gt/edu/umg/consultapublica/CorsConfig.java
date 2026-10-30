package gt.edu.umg.consultapublica;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // allowedOriginPatterns admite comodines, a diferencia de
                // allowedOrigins. Se necesita porque la dirección pública del
                // túnel cambia en cada ejecución.
                .allowedOriginPatterns(
                        "http://localhost:3000",
                        "https://*.trycloudflare.com")
                .allowedMethods("GET", "POST");
    }
}