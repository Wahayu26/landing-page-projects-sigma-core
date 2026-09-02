package id.sigmacore.coreapi.shared;

import id.sigmacore.coreapi.inquiry.InquiryNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(InquiryNotFoundException.class)
    ProblemDetail handleNotFound(InquiryNotFoundException exception) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        detail.setTitle("Inquiry not found");
        return detail;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Request validation failed");
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, message);
        detail.setTitle("Invalid request");
        return detail;
    }
}

