// src/main/java/microservices/auth_service/config/RestExceptionHandler.java
package microservices.auth_service.config;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleIllegalState(IllegalStateException ex) { return ex.getMessage(); }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public String handleIllegalArgument(IllegalArgumentException ex) { return ex.getMessage(); }
}
