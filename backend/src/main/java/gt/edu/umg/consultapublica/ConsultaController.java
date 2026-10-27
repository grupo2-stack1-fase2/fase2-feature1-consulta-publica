package gt.edu.umg.consultapublica;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Consulta pública",
     description = "Consulta del estado de cuenta sin necesidad de iniciar sesión")
public class ConsultaController {

    private final CaptchaService captchaService;
    private final ConsultaService consultaService;

    public ConsultaController(CaptchaService captchaService, ConsultaService consultaService) {
        this.captchaService = captchaService;
        this.consultaService = consultaService;
    }

    public record ConsultaRequest(
            @NotBlank(message = "El número de registro es obligatorio")
            String numeroRegistro,

            @NotBlank(message = "Debes marcar la casilla \"No soy un robot\"")
            String tokenCaptcha) {}

    public record ErrorResponse(String mensaje) {}

    @PostMapping("/consulta")
    @Operation(summary = "Consulta el estado de cuenta de un contador, "
                       + "validando antes el captcha de Google reCAPTCHA")
    public ResponseEntity<?> consultar(@Valid @RequestBody ConsultaRequest peticion) {

        if (!captchaService.validar(peticion.tokenCaptcha())) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Verificación de captcha fallida. Intenta de nuevo."));
        }

        return consultaService.buscarPorNumeroRegistro(peticion.numeroRegistro())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(new ErrorResponse("No se encontró un contador con ese número de registro.")));
    }
}