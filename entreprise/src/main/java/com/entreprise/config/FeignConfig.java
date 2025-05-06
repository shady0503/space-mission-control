package com.entreprise.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    /**
     * For every Feign call, peek at the incoming HTTP servlet request
     * and if it has an Authorization header, copy it across.
     */
    @Bean
    public RequestInterceptor headerForwardInterceptor() {
        return template -> {
            var attrs = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attrs != null) {
                String auth = attrs.getRequest().getHeader("Authorization");
                if (auth != null) {
                    template.header("Authorization", auth);
                }
            }
        };
    }
}
