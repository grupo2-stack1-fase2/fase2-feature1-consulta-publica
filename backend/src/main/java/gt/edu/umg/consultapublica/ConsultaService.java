package gt.edu.umg.consultapublica;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Obtiene el estado de cuenta de un contador leyendo la base del monolito
 * AQUORA con un usuario restringido a SELECT sobre cuatro tablas.
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
            String estado) {}

    /**
     * Una lectura se considera pendiente cuando no existe ningún pago que la
     * referencie. Se usa NOT EXISTS en lugar de unir con pagos porque una
     * lectura con dos pagos registrados se contaría dos veces en el total.
     */
    private static final String CONSULTA = """
            SELECT ct.numero_registro,
                   cl.nombre AS cliente,
                   ct.sector,
                   COUNT(l.id) AS lecturas_registradas,
                   COALESCE(SUM(CASE WHEN NOT EXISTS (
                       SELECT 1 FROM pagos p WHERE p.lectura_id = l.id
                   ) THEN 1 ELSE 0 END), 0) AS lecturas_sin_pagar,
                   COALESCE(SUM(CASE WHEN NOT EXISTS (
                       SELECT 1 FROM pagos p WHERE p.lectura_id = l.id
                   ) THEN l.monto ELSE 0 END), 0) AS monto_pendiente
            FROM contadores ct
            JOIN clientes cl ON cl.id = ct.cliente_id
            LEFT JOIN lecturas l ON l.contador_id = ct.id
            WHERE ct.numero_registro = ?
              AND ct.activo = 1
            GROUP BY ct.id, ct.numero_registro, cl.nombre, ct.sector
            """;

    private final JdbcTemplate jdbc;

    public ConsultaService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<EstadoCuenta> buscarPorNumeroRegistro(String numeroRegistro) {
        if (numeroRegistro == null || numeroRegistro.isBlank()) {
            return Optional.empty();
        }

        List<EstadoCuenta> filas = jdbc.query(
                CONSULTA,
                (rs, fila) -> {
                    int sinPagar = rs.getInt("lecturas_sin_pagar");
                    return new EstadoCuenta(
                            rs.getString("numero_registro"),
                            rs.getString("cliente"),
                            rs.getString("sector"),
                            rs.getInt("lecturas_registradas"),
                            sinPagar,
                            rs.getDouble("monto_pendiente"),
                            sinPagar == 0 ? "Al día" : "Pendiente");
                },
                numeroRegistro.trim().toUpperCase());

        return filas.stream().findFirst();
    }
}