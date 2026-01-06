package com.openclassrooms.starterjwt.exception;

public class UnauthorizedOperationException extends RuntimeException {
    public UnauthorizedOperationException(String message) {
        super(message);
    }
}
