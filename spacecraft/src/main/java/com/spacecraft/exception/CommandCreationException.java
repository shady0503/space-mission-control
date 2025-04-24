package com.spacecraft.exception;

/**
 * Custom exception for command-related operations
 */
public class CommandCreationException extends RuntimeException {

    public CommandCreationException(String message) {
        super(message);
    }

    public CommandCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}