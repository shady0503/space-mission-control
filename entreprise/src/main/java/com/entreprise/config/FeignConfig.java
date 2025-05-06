package com.entreprise.config;

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

    /**
     * For every Feign call, peek at the incoming HTTP servlet request
     * and if it has an Authorization header, copy it across.
     */
    @Bean
    public RequestInterceptor headerForwardInterceptor() {
        return template -> {
            Logger logger = LoggerFactory.getLogger(this.getClass());
            var attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String auth = attrs.getRequest().getHeader("Authorization");
                if (auth != null) {
                    template.header("Authorization", auth);
                    logger.info("Forwarding Authorization header: {}...", auth.substring(0, Math.min(15, auth.length())));
                } else {
                    logger.warn("No Authorization header found to forward");
                }
            }
        };
    }

    @Bean
    public ErrorDecoder logEverythingDecoder() {
        return (methodKey, response) -> {
            String body = null;
            try {
                body = response.body() != null
                        ? Util.toString(response.body().asReader(Util.UTF_8))
                        : "<no body>";
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            System.err.printf("Feign %s -> HTTP %d, body: %s%n",
                    methodKey, response.status(), body);
            return new RuntimeException("Downstream error " + response.status());
        };
    }

}
