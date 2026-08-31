package ar.edu.utn.frc.tup.app.utils.validations.password;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.passay.*;

import java.util.Arrays;

public class PasswordConstraintValidator implements ConstraintValidator<ValidPassword, String> {

    @Override
    public void initialize(ValidPassword arg0) {

    }

    /*
    * Tener entre 8 y 30 caracteres.
    * Incluir al menos una mayúscula.
    * Incluir al menos un dígito.
    * Incluir al menos un carácter especial.
    * No tener secuencias numéricas, alfabéticas o de teclado de 3 o más caracteres.
    * No tener espacios en blanco.*/

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        PasswordValidator validator = new PasswordValidator(Arrays.asList(
                new LengthRule(8,30),
                new UppercaseCharacterRule(1),
                new DigitCharacterRule(1),
                new SpecialCharacterRule(1),
                new NumericalSequenceRule(3, false),
                new AlphabeticalSequenceRule(3,false),
                new QwertySequenceRule(3,false),
                new WhitespaceRule()));
        RuleResult result = validator.validate(new PasswordData(password));
        if(result.isValid()){
            return true;
        }
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(
                        String.join(",",validator.getMessages(result)))
                .addConstraintViolation();
        return false;
    }
}
