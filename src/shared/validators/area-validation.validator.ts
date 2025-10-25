import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidAreaSum', async: false })
export class IsValidAreaSumConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;

    if (!object.areaTotal || !object.areaAgricultavel || !object.areaVegetacao) {
      return true; // Let other validators handle required fields
    }

    const total = Number(object.areaTotal);
    const agricultavel = Number(object.areaAgricultavel);
    const vegetacao = Number(object.areaVegetacao);

    // The sum of agricultural and vegetation areas cannot exceed total area
    return (agricultavel + vegetacao) <= total;
  }

  defaultMessage(args: ValidationArguments) {
    return 'A soma da área agricultável e área de vegetação não pode ser maior que a área total';
  }
}

export function IsValidAreaSum(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAreaSumConstraint,
    });
  };
}
