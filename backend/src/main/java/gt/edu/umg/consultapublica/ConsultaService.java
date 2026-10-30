package gt.edu.umg.consultapublica;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

/**
 * Entrega el estado de cuenta de un contador.
 *
 * Por ahora usa datos de prueba en memoria, con la misma forma que tienen
 * los datos reales de AQUORA. Cuando el equipo confirme la conexión a MySQL,
 * solo hay que reemplazar el mapa DATOS por una consulta a la base.
 */
@Service
public class ConsultaService {

    public record EstadoCuenta(
            String numeroRegistro,
            String cliente,
            String sector,
            int lecturasRegistradas,
            int lecturasSinPagar,
            double montoPendiente,
            String estado
    ) {}

    private static final Map<String, EstadoCuenta> DATOS = Map.of(
        "CT-001", new EstadoCuenta("CT-001", "José Alejandro", "Aldea San Matías", 3, 0, 0.00, "Al día"),
        "CT-002", new EstadoCuenta("CT-002", "María Elena Pérez", "Los Valle", 4, 1, 400.00, "Pendiente"),
        "CT-003", new EstadoCuenta("CT-003", "Carlos Morales", "El Tiucal", 2, 2, 750.00, "Pendiente")
    );

    public Optional<EstadoCuenta> buscarPorNumeroRegistro(String numeroRegistro) {
        if (numeroRegistro == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(DATOS.get(numeroRegistro.trim().toUpperCase()));
    }
}