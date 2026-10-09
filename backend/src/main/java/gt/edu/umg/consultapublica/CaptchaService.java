package gt.edu.umg.consultapublica;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Genera y valida el captcha. La respuesta correcta vive solo en el servidor,
 * nunca viaja al navegador: por eso no se puede falsear desde el frontend.
 */
@Service
public class CaptchaService {

    /** Lo que se le envía al navegador: un identificador y la pregunta. */
    public record Desafio(String captchaId, String pregunta) {}

    private final Map<String, Integer> respuestas = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public Desafio generar() {
        int a = random.nextInt(9) + 1;
        int b = random.nextInt(9) + 1;
        String id = UUID.randomUUID().toString();

        respuestas.put(id, a + b);

        return new Desafio(id, "¿Cuánto es " + a + " + " + b + "?");
    }

    public boolean validar(String captchaId, String respuesta) {
        if (captchaId == null || respuesta == null) {
            return false;
        }

        // remove() en vez de get(): cada captcha sirve una sola vez.
        Integer esperada = respuestas.remove(captchaId);
        if (esperada == null) {
            return false;
        }

        try {
            return esperada == Integer.parseInt(respuesta.trim());
        } catch (NumberFormatException e) {
            return false;
        }
    }
}