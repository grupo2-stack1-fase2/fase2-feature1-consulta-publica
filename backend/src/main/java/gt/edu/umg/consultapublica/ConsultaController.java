package gt.edu.umg.consultapublica;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints públicos: cualquiera puede usarlos sin iniciar sesión.
 * Por eso el captcha, que evita que un robot consulte miles de contadores.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Consulta pública", description = "Consulta del estado de cuenta sin necesidad de iniciar sesión")
public class ConsultaController {

    private final CaptchaService captchaService;
    private final ConsultaService consultaService;

    public ConsultaController(CaptchaService captchaService, ConsultaService consultaService) {
        this.captchaService = captchaService;
        this.consultaService = consultaService;
    }

    /** Lo que el navegador envía al consultar. */
    public record ConsultaRequest(
            @NotBlank(message = "El número de registro es obligatorio")
            String numeroRegistro,

            @NotBlank(message = "Falta el identificador del captcha")
            String captchaId,

            @NotBlank(message = "Debes resolver el captcha")
            String respuestaCaptcha
    ) {}

    public record ErrorResponse(String mensaje) {}

    @GetMapping("/captcha")
    @Operation(summary = "Genera un captcha nuevo para el formulario de consulta")
    public CaptchaService.Desafio obtenerCaptcha() {
        return captchaService.generar();
    }

    @PostMapping("/consulta")
    @Operation(summary = "Consulta el estado de cuenta de un contador, validando antes el captcha")
    public ResponseEntity<?> consultar(@Valid @RequestBody ConsultaRequest peticion) {

        if (!captchaService.validar(peticion.captchaId(), peticion.respuestaCaptcha())) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Captcha incorrecto. Intenta de nuevo."));
        }

        return consultaService.buscarPorNumeroRegistro(peticion.numeroRegistro())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(new ErrorResponse("No se encontró un contador con ese número de registro.")));
    }
}