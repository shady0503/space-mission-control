package microservices.mission_service.config;

import feign.RequestInterceptor;
import feign.Util;
import feign.codec.ErrorDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

@Configuration
public class FeignConfig {

    private static final Logger log = LoggerFactory.getLogger(FeignConfig.class);

    /**
     * Intercepts every Feign request and forwards the incoming Authorization header if present.
     */
    @Bean
    public RequestInterceptor headerForwardInterceptor() {
        return template -> {
            var attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                var request = attrs.getRequest();
                var auth = request.getHeader("Authorization");
                if (auth != null) {
                    log.debug("Forwarding Authorization header to Feign target.");
                    template.header("Authorization", auth);
                } else {
                    log.warn("No Authorization header found in incoming request.");
                }
            } else {
                log.warn("No request context available (RequestContextHolder is null).");
            }
        };
    }

    /**
     * Logs Feign client errors with response body for easier debugging.
     */
    @Bean
    public ErrorDecoder logEverythingDecoder() {
        return (methodKey, response) -> {
            String body = "<unreadable>";
            try {
                body = response.body() != null
                        ? Util.toString(response.body().asReader(Util.UTF_8))
                        : "<no body>";
            } catch (IOException e) {
                log.error("Error reading Feign response body", e);
            }
            log.error("Feign call to {} returned HTTP {}, body: {}", methodKey, response.status(), body);
            return new RuntimeException("Downstream error " + response.status());
        };
    }
}
