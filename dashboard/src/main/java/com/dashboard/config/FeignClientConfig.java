// com/dashboard/config/FeignClientConfig.java
package com.dashboard.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {
    @Bean
    public RequestInterceptor authRelayInterceptor() {
        return template -> {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String auth = attrs.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
                // Add debug logging
                System.out.println("Authorization header present: " + (auth != null));
                if (auth != null) {
                    template.header(HttpHeaders.AUTHORIZATION, auth);
                }
            }
        };
    }
}