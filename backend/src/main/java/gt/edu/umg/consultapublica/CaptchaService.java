package gt.edu.umg.consultapublica;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Valida el token de reCAPTCHA v2 contra los servidores de Google.
 * El navegador nunca decide si el captcha es válido: solo obtiene un token
 * y es este servicio el que le pregunta a Google si ese token es legítimo.
 */
@Service
public class CaptchaService {

    private static final String URL_VERIFICACION =
            "https://www.google.com/recaptcha/api/siteverify";

    private final RestClient restClient = RestClient.create();
    private final String claveSecreta;

    public CaptchaService(@Value("${recaptcha.secret}") String claveSecreta) {
        this.claveSecreta = claveSecreta;
    }

    public boolean validar(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        MultiValueMap<String, String> datos = new LinkedMultiValueMap<>();
        datos.add("secret", claveSecreta);
        datos.add("response", token);

        try {
            Map<?, ?> respuesta = restClient.post()
                    .uri(URL_VERIFICACION)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(datos)
                    .retrieve()
                    .body(Map.class);

            return respuesta != null && Boolean.TRUE.equals(respuesta.get("success"));
        } catch (Exception e) {
            // Si Google no responde, se rechaza la consulta por seguridad.
            return false;
        }
    }
}