package khoindn.swp391.be.app.exception;

import khoindn.swp391.be.app.exception.exceptions.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

@RestControllerAdvice
public class APIExceptionHandler {

    // ==========================
    // Validation Exceptions
    // ==========================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity handleBadRequest(MethodArgumentNotValidException exception) {
        String message = "";
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            message += fieldError.getField() + ":" + fieldError.getDefaultMessage() + "\n";
        }
        return ResponseEntity.badRequest().body(message); // 400
    }

    // ==========================
    //  Authentication / Security Exceptions
    // ==========================
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity handleBadCredentialsException(BadCredentialsException exception) {
        return ResponseEntity.status(401).body("Username or password invalid!"); // 401
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity handleAuthenticationException(AuthenticationException exception) {
        return ResponseEntity.status(401).body(exception.getMessage()); // 401
    }

    @ExceptionHandler(InternalAuthenticationServiceException.class)
    public ResponseEntity handleInternalAuthenticationServiceException(InternalAuthenticationServiceException exception) {
        return ResponseEntity.status(401).body("Username or password invalid!"); // 401
    }

    @ExceptionHandler(UserIsExistedException.class)
    public ResponseEntity handleUserIsExistedException(UserIsExistedException exception) {
        return ResponseEntity.status(401).body("Username is existed!"); // 401
    }

    // ==========================
    // Common Runtime Exceptions
    // ==========================
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity handleNoSuchElementException(NoSuchElementException ex) {
        return ResponseEntity.status(404).body("This user does not exist in this group!"); // 404
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity handleNullPointerException(NullPointerException ex) {
        return ResponseEntity.status(404).body("This car does not register to any group!"); // 404
    }

    @ExceptionHandler(ContractNotExistedException.class)
    public ResponseEntity handleContractNotExisted(ContractNotExistedException ex) {
        return ResponseEntity.status(404).body("This contract is not existed!"); // 404
    }

    @ExceptionHandler(UndefinedChoiceException.class)
    public ResponseEntity handleUndefinedChoiceException(UndefinedChoiceException ex) {
        return ResponseEntity.status(404).body("Choice is undefined!"); // 404 Not Found
    }

    // ==========================
    // Vehicle-related Exceptions
    // ==========================
    @ExceptionHandler(VehicleNotBelongException.class)
    public ResponseEntity handleVehicleNotBelongException(VehicleNotBelongException ex) {
        return ResponseEntity.status(403).body("This car does not belong to this group!"); // 403
    }

    @ExceptionHandler(VehicleIsRegisteredException.class)
    public ResponseEntity handleVehicleIsRegisteredException(VehicleIsRegisteredException ex) {
        return ResponseEntity.status(409).body("This car already belong to other group!"); // 409
    }

    @ExceptionHandler(VehicleIsNotExistedException.class)
    public ResponseEntity handleVehicleIsNotExistedException(VehicleIsNotExistedException ex) {
        return ResponseEntity.status(404).body("This car is not existed!"); // 404
    }

    @ExceptionHandler(NoVehicleInGroupException.class)
    public ResponseEntity handleNoVehicleInGroup(NoVehicleInGroupException ex) {
        return ResponseEntity.status(404).body("There is no vehicle available!"); // 404
    }

    // ==========================
    // User / Group Exceptions
    // ==========================
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage()); // 404
    }

    @ExceptionHandler(GroupNotFoundException.class)
    public ResponseEntity handleGroupNotFound(GroupNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage()); // 404
    }

    @ExceptionHandler(UserNotBelongException.class)
    public ResponseEntity handleUserNotBelong(UserNotBelongException ex) {
        return ResponseEntity.status(403).body("User is not belonged to this group"); // 403
    }

    @ExceptionHandler(RoleNotFoundException.class)
    public ResponseEntity handleRoleNotFoundException(RoleNotFoundException ex) {
        return ResponseEntity.status(404).body("Role not found!"); // 404 Not Found
    }

    @ExceptionHandler(RequestGroupNotFoundException.class)
    public ResponseEntity handleRequestGroupNotFoundException(RequestGroupNotFoundException ex) {
        return ResponseEntity.status(404).body("Request Group not found!"); // 404 Not Found
    }



    // ==========================
    // Duplicate Data Exceptions
    // ==========================
    @ExceptionHandler(EmailDuplicatedException.class)
    public ResponseEntity handleEmailDuplicatedException(EmailDuplicatedException ex) {
        return ResponseEntity.status(409).body("Email is existed!"); // 409
    }

    @ExceptionHandler(CCCDDuplicatedException.class)
    public ResponseEntity handleCCCDDuplicatedException(CCCDDuplicatedException ex) {
        return ResponseEntity.status(409).body("CCCD is existed!"); // 409
    }

    @ExceptionHandler(GPLXDuplicatedException.class)
    public ResponseEntity handleGPLXDuplicatedException(GPLXDuplicatedException ex) {
        return ResponseEntity.status(409).body("GPLX is existed!"); // 409
    }

    @ExceptionHandler(PhoneDuplicatedException.class)
    public ResponseEntity handlePhoneDuplicatedException(PhoneDuplicatedException ex) {
        return ResponseEntity.status(409).body("Phone is existed!"); // 409
    }

    // ==========================
    // Override / Schedule Exceptions
    // ==========================
    @ExceptionHandler(OverrideLimitExceededException.class)
    public ResponseEntity handleOverrideLimitExceeded(OverrideLimitExceededException ex) {
        return ResponseEntity.status(400).body(ex.getMessage()); // 400 Bad Request
    }

    @ExceptionHandler(LowerOwnershipException.class)
    public ResponseEntity handleLowerOwnership(LowerOwnershipException ex) {
        return ResponseEntity.status(403).body(ex.getMessage()); // 403 Forbidden
    }
}
